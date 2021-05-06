import {Request, Response} from 'express';
import { func } from 'joi';
import {IAccount} from '../models/account';
import repository from '../models/accountModel';

const accounts : IAccount[] = [];

async function getAccounts(req: Request, res: Response, next: any){
    const accounts = await repository.findAll();
    res.json(accounts.map(item =>{
        item.password = '';
        return item;
    }));
}

async function getAccount(req: Request, res: Response, next: any){

    try {
        const id = parseInt(req.params.id);
        
        if(!id) throw new Error("ID is in invalid format");

        const account =  await repository.findById(id);
        if (account === null)
            return res.status(404).end();
        else
            account.password = '';
            return res.json(account);

    } catch (error) {
        console.log(error);
        res.status(400).end();
    }
    
}

function setAccount(req: Request, res: Response, next: any){
    
    try {
        const accountId = parseInt(req.params.id);
        if(!accountId) throw new Error("ID is in invalid format");
        
        const accountParams = req.body as IAccount;
        const index = accounts.findIndex(item => item.id === accountId);
        if(index === -1) return res.status(404).end();
        
        const originalAccount = accounts[index];
        if(accountParams.name) originalAccount.name = accountParams.name;
        if(accountParams.password) originalAccount.password = accountParams.password;

        accounts[index] = originalAccount;
        res.status(200).json(originalAccount);

    } catch (error) {
        console.log(error);
        res.status(400).end();
    }    
}

async function addAccount(req: Request, res: Response, next: any){
    try {
        const newAccount = req.body as IAccount;
        const result = await repository.add(newAccount);
        newAccount.id = result.id
        newAccount.password = ''
        res.status(201).json(newAccount);
        
    } catch (error) {
        console.log(error);
        res.status(400).end();
    }
}

function loginAccount(req: Request, res: Response, next: any){
    try {
        const loginParams = req.body as IAccount;
        const index = accounts.findIndex(item => item.email === loginParams.email && item.password === loginParams.password);

        if(index === -1) return res.status(401).end();

        res.json({auth: true, token: {}})
        
    } catch (error) {
        console.log(error);
        res.status(400).end();
    }
}

function logoutAccount(req: Request, res: Response, next: any){
    res.json({auth: false, token: {}})
}

export default { getAccounts, addAccount, getAccount, setAccount, loginAccount, logoutAccount}