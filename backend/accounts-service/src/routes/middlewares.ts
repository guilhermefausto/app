import {accountSchema,loginSchema, accountUpdateSchema} from './../models/accountSchemas';
import {accountEmailSchema, accountEmailUpdateSchema} from '../models/accountEmailSchemas';
import {Request,Response} from 'express';
import commonsMiddleware from 'ms-commons/api/routes/middlewares';
import controllerCommons from 'ms-commons/api/controllers/controller';
import {Token} from 'ms-commons/api/auth/accountsAuth';

function validateAccountEmailSchema(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateSchema(accountEmailSchema,req,res,next)
}

function validateAccountEmailUpdateSchema(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateSchema(accountEmailUpdateSchema,req,res,next)
}

function validateAccountSchema(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateSchema(accountSchema,req,res,next);
}

function validateUpdateAccountSchema(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateSchema(accountUpdateSchema,req,res,next);
}

function validateLoginSchema(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateSchema(loginSchema,req,res,next);
}

async function validateAuthentication(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateAccountAuth(req,res,next)
}

async function validateMSAuthentication(req: Request, res: Response, next:any){
    return commonsMiddleware.validateMicroserviceAuth(req,res,next);
}

function validateAuthorization(req: Request, res: Response, next:any) {
    const accountId = parseInt(req.params.id);
    if(!accountId) return res.status(400).end();

    const token = controllerCommons.getToken(res) as Token;
    if(accountId !== token.accountId) return res.status(403).end();

    next();
}


export {
    validateAccountSchema,
    validateLoginSchema, 
    validateUpdateAccountSchema, 
    validateAuthentication, 
    validateAuthorization,
    validateAccountEmailSchema,
    validateAccountEmailUpdateSchema,
    validateMSAuthentication
}