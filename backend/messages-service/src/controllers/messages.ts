import {Request, Response} from 'express';
import repository from '../models/messageRepository';
import controllerCommons from 'ms-commons/api/controllers/controller';
import {Token} from 'ms-commons/api/auth/accountsAuth';
import { IMessage } from '../models/message';
import { MessageStatus } from '..//models/messageStatus';
import {getContacts, getContact} from 'ms-commons/clients/contactsService';
import {getAccountEmail} from 'ms-commons/clients/accountsService';
import queueService from 'ms-commons/clients/queueService';
import emailService from 'ms-commons/clients/emailService';
import sendingRepository from '../models/sendingRepository';
import { SendingStatus } from '..//models/sendingStatus';
import { ISending } from '../models/sending';
import messageRepository from '../models/messageRepository';

async function getMessages(req:Request, res: Response, next: any) {
    try {
        const includeRemoved = req.query.includeRemoved == 'true'
        //Pega o id sempre do token da requisição, para garantir que a consulta seja feita 
        //exatamente de quem estiver autenticado
    
        const token = controllerCommons.getToken(res) as Token;
        const messages = await repository.findAll(token.accountId,includeRemoved);

        res.json(messages);    
    } catch (error) {
        console.log(`getMessages: ${error}`);
        res.sendStatus(400);
    }
}

async function getMessage(req:Request, res: Response, next: any) {
    try {
        const id = parseInt(req.params.id)
        if(!id) return res.status(400).json({message: 'id is required'});
    
        const token = controllerCommons.getToken(res) as Token;
        const message = await repository.findById(id,token.accountId);
    
        if(message === null) return res.sendStatus(404);
        else res.json(message);
        
    } catch (error) {
        console.log(`getMessage: ${error}`);
        res.sendStatus(400);
    }
}

async function addMessage(req:Request, res: Response, next: any) {
    try {
        const token = controllerCommons.getToken(res) as Token;
        const message = req.body as IMessage;
        const result = await repository.add(message, token.accountId);
        res.status(201).json(result);
        
    } catch (error) {
        console.log(`addMessage: ${error}`);
        res.sendStatus(400);
    }
}

async function setMessage(req:Request, res: Response, next: any) {
    try {
        const messageId = parseInt(req.params.id);
        if(!messageId) return res.status(400).json({message: 'id is required'});
        

        const token = controllerCommons.getToken(res) as Token;
        const message = req.body as IMessage;
        const result = await repository.set(messageId,message,token.accountId);

        if(!result) return res.sendStatus(404);
        res.json(result);
        
    } catch (error) {
        console.log(`setMessage: ${error}`);
        res.sendStatus(400).end();
    }
}

async function deleteMessage(req: Request, res: Response, next: any){
    try {
        const messageId = parseInt(req.params.id);
        if(!messageId) return res.status(400).json({message: 'id is required'});

        const token = controllerCommons.getToken(res) as Token;
        

        if(req.query.force === 'true'){
            await repository.removeById(messageId,token.accountId);
            res.sendStatus(204);
        }
        else{
            const messageParams = {
                status: MessageStatus.REMOVED
            } as IMessage;
            const updatedMessage = await repository.set(messageId,messageParams,token.accountId);
            if(updatedMessage)
                res.status(200).json(updatedMessage);
            else
                res.sendStatus(403);
        }
    } catch (error) {
        console.log(`deleteMessage ${error}`);
        res.sendStatus(400);
    }
}

async function scheduleMessage(req: Request, res: Response, next: any) {
    try {
        const token = controllerCommons.getToken(res) as Token;
        
        //obtendo a mensagem
        let messageId = parseInt(req.params.id);
        if(!messageId) return res.status(400).json({message: 'id is required'});
        
        const message = await repository.findById(messageId,token.accountId);
        if(!message) return res.sendStatus(403);
        
        //obtendo os contatos
        const contacts = await getContacts(token.jwt!);
        if(!contacts || contacts.length === 0) return res.sendStatus(404).json({message: 'There are no contacts for this account'});

        //criar as sendings
        const sendings = await sendingRepository.addAll(contacts.map(contact => {
            return {
                accountId: token.accountId,
                contactId: contact.id,
                messageId,
                status: SendingStatus.QUEUED
            }
        }));

        if(!sendings) return res.status(400).json({message: "Couldn't save the sendings."})

        //simplificar o sendings para fila
        const messages  = sendings.map(item => {
            return {
                id: item.id,
                accountId: item.accountId,
                contactId: item.contactId,
                messageId: item.messageId
            }
        })

        //enviando mensagens para fila
        const promises = queueService.sendMessageBacth(messages)
        await Promise.all(promises);

        //atualizando a mensagem
        const messageParams = { status:MessageStatus.SCHEDULED, sendDate: new Date() } as IMessage;
        const updatedMessage = await repository.set(messageId,messageParams,token.accountId);
        if(updatedMessage)
            return res.status(202).json(updatedMessage)
        else
            res.sendStatus(403);

    } catch (error) {
        console.log(`scheduleMessage ${error}`);
        res.sendStatus(400);
    }
}

async function sendMessage(req: Request, res: Response, next: any) {
    try {
        const params = req.body as ISending;
        
        //pegando o envio
        const sending = await sendingRepository.findQueuedOne(params.id!,params.messageId,params.accountId, params.contactId);
        if(!sending) return res.status(404).json({message: 'sending not found'});

        //TODO implementar cache no futuro
        //pegando a mensagem(corpo, assunto, etc)
        const message = await messageRepository.findById(sending.messageId, sending.accountId)
        if(!message) return res.status(404).json({message: 'message not found'});

        //pegando o contato (destinatário)
        const contact = await getContact(sending.contactId, sending.accountId);
        if(!contact) return res.status(404).json({message: 'contact not found'});

        //pegando o accountEmail(remetente)
        const accountEmail = await getAccountEmail(sending.accountId,message.accountEmailId);
        if(!accountEmail) return res.status(404).json({message: 'accountEmail not found'});

        //enviando o email
        const result = await emailService.sendEmail(accountEmail.name,accountEmail.email,contact.email,message.subject,message.body)
        if(!result.success) return res.status(400).json({message: "Couldn't send the email message"});

        sending.status = SendingStatus.SENT;
        sending.sendDate = new Date();
        await sendingRepository.set(params.id!,sending,sending.accountId);

        //atualizando a message
        const hasMore = await sendingRepository.hasQueuedSending(sending.messageId,sending.accountId);
        if(!hasMore){
            message.status = MessageStatus.SENT;
            message.sendDate = new Date();
            await repository.set(sending.messageId, message,sending.accountId);
        }

        res.status(202).json(sending);
    } catch (error) {
        console.log(`sendMessage: ${error}`);
        return res.sendStatus(400);
    }
}

export default {getMessages, getMessage, addMessage, setMessage, deleteMessage, scheduleMessage, sendMessage};