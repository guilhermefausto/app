import {Request, Response} from 'express';
import {IAccount} from '../models/account';
import repository from '../models/accountRepository';
import auth from '../auth';
import controllerCommons from 'ms-commons/api/controllers/controller';
import {Token} from 'ms-commons/api/auth';
import { AccountStatus } from '../models/accountStatus';
import emailService, { AccountSettings } from 'ms-commons/clients/emailService';
import accountRepository from '../models/accountRepository';
import { IAccountEmail } from '../models/accountEmail';
import accountEmailRepository from '../models/accountEmailRepository';

const accounts : IAccount[] = [];

async function getAccounts(req: Request, res: Response, next: any){
    const includeRemoved = req.query.includeRemoved == 'true';
    const accounts : IAccount [] = await repository.findAll(includeRemoved);
    res.json(accounts.map(item =>{
        item.password = '';
        return item;
    }));
}

async function getAccount(req: Request, res: Response, next: any){

    try {
        const id = parseInt(req.params.id);
        if(!id) return res.status(400).json({message: 'id is required'});

        const token = controllerCommons.getToken(res) as Token;
        if(id !== token.accountId) return res.sendStatus(403);

        const account =  await repository.findById(id);
        if (account === null)
            return res.sendStatus(404);
        else
            account.password = '';
            return res.json(account);

    } catch (error) {
        console.log(`getAccount ${error}`);
        res.sendStatus(400);
    }
    
}

async function setAccount(req: Request, res: Response, next: any){
    
    try {
        const accountParams = req.body as IAccount;
        if(accountParams.status === AccountStatus.REMOVED)
            return deleteAccount(req,res,next)
        const accountId = parseInt(req.params.id);
        if(!accountId) return res.status(400).json({message: 'id is required'});

        const token = controllerCommons.getToken(res) as Token;
        if(accountId !== token.accountId) return res.sendStatus(403);

        if(accountParams.password)
            accountParams.password = auth.hashPassword(accountParams.password);
        
        const updatedAccount = await repository.set(accountId,accountParams);
        
        if(updatedAccount !== null){
            updatedAccount.password = '';
            res.status(200).json(updatedAccount);
        }
        else
            res.sendStatus(404);    

    } catch (error) {
        console.log(`setAccount ${error}`);
        res.sendStatus(400);
    }    
}

async function addAccount(req: Request, res: Response, next: any){
        const newAccount = req.body as IAccount;
    try {
        newAccount.password = auth.hashPassword(newAccount.password);
        const result = await repository.add(newAccount);
        newAccount.id = result.id;
        newAccount.password = '';

        //criando a conta no SES da AWS
        newAccount.settings = await emailService.createAccountSettings(newAccount.domain);

        res.status(201).json(newAccount);
        
    } catch (error) {
        console.log(`addAccount ${error}`);
        //if(newAccount.id) await repository.remove(newAccount.id)
        res.sendStatus(400);
    }
}

async function loginAccount(req: Request, res: Response, next: any){
    try {
        const loginParams = req.body as IAccount;
        
        const account = await repository.findByEmail(loginParams.email);

        if(account !== null){
            const isValid = auth.comparePassword(loginParams.password,account.password)
            && account.status !== AccountStatus.REMOVED;
            
            if(isValid){
                const token = await auth.sign(account.id!);
                return res.json({auth: true, token})
            }
            else return res.sendStatus(401);
        } 
        else res.sendStatus(404);
        
    } catch (error) {
        console.log(`loginAccount: ${error}`);
        res.sendStatus(400);
    }
}

function logoutAccount(req: Request, res: Response, next: any){
    res.json({auth: false, token: {}})
}

async function deleteAccount(req: Request, res: Response, next: any){
    try {
        const accountId = parseInt(req.params.id);
        if(!accountId) return res.status(400).json({message: 'id is required'});

        const token = controllerCommons.getToken(res) as Token;
        if(accountId !== token.accountId) return res.sendStatus(403);

        const account = await accountRepository.findByIdWithEmails(accountId);
        if(account == null) return res.sendStatus(404);
        

        const accountEmails = account.get('accountEmails',{plain:true}) as IAccountEmail[];
        if(accountEmails && accountEmails.length > 0){
            const promises = accountEmails.map(item => {
                return emailService.removeEmailIdentity(item.email);
            })
            await Promise.all(promises);
            await accountEmailRepository.removeAll(accountId);
        }
        await emailService.removeEmailIdentity(account.domain);

        if(req.query.force === 'true'){
            await repository.remove(accountId);
            res.sendStatus(200);
        }
        else{
            const accountParams = {
                status: AccountStatus.REMOVED
            } as IAccount;
            const updatedAccount = await repository.set(accountId,accountParams);

            if(updatedAccount != null){
                updatedAccount.password = '';
                res.json(updatedAccount);
            } 
            else res.end();
        }
    } catch (error) {
        console.log(`deleteAccount ${error}`);
        res.sendStatus(400);
    }
}

async function getAccountSettings(req: Request, res: Response, next: any){
    try {
        const token = controllerCommons.getToken(res) as Token;
        const account = await accountRepository.findByIdWithEmails(token.accountId);
        if(!account) return res.sendStatus(404);

        let emails: string [] = [];
        const accountEmails = account.get('accountEmails',{plain:true}) as IAccountEmail[];
        if(accountEmails && accountEmails.length > 0)
            emails = accountEmails.map(item => item.email)

        const settings = await emailService.getAccountSettings(account.domain, emails);
        res.json(settings);
    } catch (error) {
        console.log(`getAccountSettings: ${error}`);
        res.sendStatus(400);
    }
}

async function createAccountSettings(req: Request, res: Response, next: any) {
    try {
        const token = controllerCommons.getToken(res) as Token;
        const account = await accountRepository.findById(token.accountId);
        if(!account) return res.sendStatus(404);

        let accountSettings: AccountSettings;
        if(req.query.force === 'true'){
            await emailService.removeEmailIdentity(account.domain)
        }
        else{
            accountSettings = await emailService.getAccountSettings(account.domain,[]);
            if(accountSettings) return res.json(accountSettings);
        }
        accountSettings = await emailService.createAccountSettings(account.domain);
        res.status(201).json(accountSettings);
    } catch (error) {
        console.log(`createAccountSettings: ${error}`);
        res.sendStatus(400);
    }    
}

async function addAccountEmail(req: Request, res: Response, next: any){
    const token = controllerCommons.getToken(res) as Token;
    const accountEmail = req.body as IAccountEmail;

    try {
        const account = await accountRepository.findByIdWithEmails(token.accountId);
        if(!account) return res.sendStatus(404);
    
        if(!accountEmail.email.endsWith(`@${account.domain}`)) return res.sendStatus(403);
    
        const accountEmails = account.get('accountEmails',{plain:true}) as IAccountEmail[];
        let alreadyExists = false;
        if(accountEmails && accountEmails.length > 0)
            alreadyExists = accountEmails.some(item => item.email === accountEmail.email)
        if(alreadyExists) return res.sendStatus(400);
        
        accountEmail.accountId = token.accountId;
        const result = await accountEmailRepository.add(accountEmail);
        if(!result.id) return res.sendStatus(400);

        accountEmail.id = result.id!;
        const response = await emailService.addEmailIdentity(accountEmail.email);
        res.status(201).json(accountEmail);
    } catch (error) {
        console.log(`addAccountEmail: ${error}`);
        if(accountEmail.id) await accountEmailRepository.remove(accountEmail.id, token.accountId)
        res.sendStatus(400);        
    }
}

async function getAccountEmails(req: Request, res: Response, next: any){
    try {
        const token = controllerCommons.getToken(res) as Token;
        const account = await accountRepository.findByIdWithEmails(token.accountId);
        if(!account) return res.sendStatus(404);

        let emails: string [] = [];
        const accountEmails = account.get('accountEmails',{plain:true}) as IAccountEmail[];
        if(accountEmails && accountEmails.length > 0)
            emails = accountEmails.map(item => item.email)

        const settings = await emailService.getEmailSettings(emails);
        accountEmails.forEach(item => {
            item.settings = settings.find(s => s.email === item.email);
        })
        res.json(accountEmails);
    } catch (error) {
        console.log(`getAccountEmails: ${error}`);
        res.sendStatus(400);
    }
}

async function getAccountEmail(req: Request, res: Response, next: any){
    try {
        const id = parseInt(req.params.id);
        if(!id) return res.sendStatus(400);

        const token = controllerCommons.getToken(res) as Token;
        const accountEmail = await accountEmailRepository.findById(id, token.accountId,true) as IAccountEmail
        if(!accountEmail) return res.sendStatus(404);

        const settings = await emailService.getEmailSettings([accountEmail.email]);
        if(!settings || settings.length === 0) return res.sendStatus(404);
        
        accountEmail.settings = settings[0];
        res.json(accountEmail);
    } catch (error) {
        console.log(`getAccountEmail: ${error}`);
        res.sendStatus(400);
    }
}

async function setAccountEmail(req: Request, res: Response, next: any){
    const accountEmailId = parseInt(req.params.id);
    try {
        if(!accountEmailId) return res.sendStatus(400);

        const token = controllerCommons.getToken(res) as Token;
        
        const accountParams = req.body as IAccountEmail;
        
        const updatedAccontEmail = await accountEmailRepository.set(accountEmailId,token.accountId,accountParams);
        
        if(updatedAccontEmail !== null){
            res.json(updatedAccontEmail);
        }
        else
            res.sendStatus(404);    

    } catch (error) {
        console.log(`setAccountEmail ${error}`);
        res.sendStatus(400);
    }    
}

async function deleteAccountEmail(req: Request, res: Response, next: any){
    try {
        const accountEmailId = parseInt(req.params.id);
        if(!accountEmailId) return res.sendStatus(400);

        const token = controllerCommons.getToken(res) as Token;

        const accountEmail = await accountEmailRepository.findById(accountEmailId,token.accountId);
        if(accountEmail == null) return res.sendStatus(404);
        
        await emailService.removeEmailIdentity(accountEmail.email);
        await accountEmailRepository.remove(accountEmailId,token.accountId)

        res.sendStatus(200);

    } catch (error) {
        console.log(`deleteAccount ${error}`);
        res.sendStatus(400);
    }
}

export default { 
    getAccounts, 
    addAccount, 
    getAccount, 
    setAccount, 
    loginAccount, 
    logoutAccount, 
    deleteAccount, 
    getAccountSettings,
    createAccountSettings,
    addAccountEmail,
    getAccountEmails,
    getAccountEmail,
    setAccountEmail,
    deleteAccountEmail
}