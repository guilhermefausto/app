import {Request, Response} from 'express';
import repository from '../models/contactRepository';
import controllerCommons from 'ms-commons/api/controllers/controller';
import {Token} from 'ms-commons/api/auth/accountsAuth';
import { IContact } from '../models/contact';
import { ContactStatus } from '../models/contactStatus';

async function getContacts(req:Request, res: Response, next: any) {
    try {
        const includeRemoved = req.query.includeRemoved == 'true';
        //Pega o id sempre do token da requisição, para garantir que a consulta seja feita 
        //exatamente de quem estiver autenticado
    
        const token = controllerCommons.getToken(res) as Token;
        const contacts = await repository.findAll(token.accountId,includeRemoved);

        res.json(contacts);    
    } catch (error) {
        console.log(`getContacts: ${error}`);
        res.sendStatus(400);
    }
}

async function getContact(req:Request, res: Response, next: any) {
    try {
        const id = parseInt(req.params.id)
        if(!id) return res.status(400).json({message: 'id is required'});

        let accountId = parseInt(req.params.accountId);
        if(!accountId){
            const token = controllerCommons.getToken(res) as Token;
            accountId = token.accountId;
        }
        const contact = await repository.findById(id,accountId);
    
        if(contact === null) return res.sendStatus(404);
        else res.json(contact);
        
    } catch (error) {
        console.log(`getContact: ${error}`);
        res.sendStatus(400);
    }
}

async function addContact(req:Request, res: Response, next: any) {
    try {
        const token = controllerCommons.getToken(res) as Token;
        const contact = req.body as IContact;
        const result = await repository.add(contact, token.accountId);
        res.status(201).json(result);
        
    } catch (error) {
        console.log(`addContact: ${error}`);
        res.sendStatus(400);
    }
}

async function setContact(req:Request, res: Response, next: any) {
    try {
        const contactId = parseInt(req.params.id);
        if(!contactId) return res.status(400).json({message: 'id is required'});
        

        const token = controllerCommons.getToken(res) as Token;
        const contact = req.body as IContact;
        const result = await repository.set(contactId,contact,token.accountId);

        if(!result) return res.sendStatus(404);
        res.json(result);
        
    } catch (error) {
        console.log(`setContact: ${error}`);
        res.sendStatus(400).end();
    }
}

async function deleteContact(req: Request, res: Response, next: any){
    try {
        const contactId = parseInt(req.params.id);
        if(!contactId) return res.status(400).json({message: 'id is required'});

        const token = controllerCommons.getToken(res) as Token;
        

        if(req.query.force === 'true'){
            await repository.removeById(contactId,token.accountId);
            res.sendStatus(204);
        }
        else{
            const contactParams = {
                status: ContactStatus.REMOVED
            } as IContact;
            const updatedContact = await repository.set(contactId,contactParams,token.accountId);
            if(updatedContact)
                res.status(200).json(updatedContact);
            else
                res.sendStatus(404);
        }
    } catch (error) {
        console.log(`deleteContact ${error}`);
        res.sendStatus(400);
    }
}

export default {getContacts, getContact, addContact, setContact, deleteContact};