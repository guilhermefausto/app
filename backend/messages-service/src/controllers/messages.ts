import {Request, Response} from 'express';
import repository from '../models/messageRepository';
import controllerCommons from 'ms-commons/api/controllers/controller';
import {Token} from 'ms-commons/api/auth';
import { IMessage } from '../models/message';
import { MessageStatus } from '..//models/messageStatus';

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
            res.sendStatus(200);
        }
        else{
            const messageParams = {
                status: MessageStatus.REMOVED
            } as IMessage;
            const updatedMessage = await repository.set(messageId,messageParams,token.accountId);
            if(updatedMessage)
                res.json(updatedMessage);
            else
                res.sendStatus(403);
        }
    } catch (error) {
        console.log(`deleteMessage ${error}`);
        res.sendStatus(400);
    }
}



export default {getMessages, getMessage, addMessage, setMessage, deleteMessage};