import {Request, Response} from 'express';
import repository from '../models/messageRepository';
import controllerCommons from 'ms-commons/api/controllers/controller';
import {Token} from 'ms-commons/api/auth/accountsAuth';
import { IMessage } from '../models/message';
import { MessageStatus } from '../models/messageStatus';
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

        //enviando mensagens para fila SQS
        const promises = queueService.sendMessageBacth(messages)
        const resultPromises = await Promise.all(promises);
        console.log(`ResultPromises: ${resultPromises}`)
        if(resultPromises[0].Failed.length > 0){
            //Em caso de erro ao enviar para SQS exclui as sendings do banco
            sendings.map(async item =>{
                await sendingRepository.removeById(item.id!,item.accountId);
            })
            throw new Error(`${resultPromises[0].Failed[0].Message}`)
        } 
            

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

/*{"ResponseMetadata":
    {
        "RequestId":"3be55750-3f3e-54c3-89ba-0e16e0c1f595"
    },
    "Successful":
        [
            {
                "Id":"c356eb85-a50a-4878-9f78-2aaa3a203b98","MessageId":"2da78e62-8939-4935-ba1d-78d287092ab8","MD5OfMessageBody":"e710009e976c521e6a32c5b0179dc431","MD5OfMessageSystemAttributes":"d41d8cd98f00b204e9800998ecf8427e"
            },
            {
                "Id":"05eacd9a-83c3-4e4e-a600-90c38ef89abc","MessageId":"ce3c2e01-a607-429f-b18f-b1e57220b0ee","MD5OfMessageBody":"1ac1e236101fd9a6329ad75c0b6bb27b","MD5OfMessageSystemAttributes":"d41d8cd98f00b204e9800998ecf8427e"
            }
        ],
    "Failed":[]
}*/