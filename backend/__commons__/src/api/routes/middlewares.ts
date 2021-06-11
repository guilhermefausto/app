import Joi from 'joi';
import {Request,Response} from 'express';
import accountAuth from '../auth/accountsAuth';
import microServiceAuth from '../auth/microservicesAuth';

function validateSchema(schema : Joi.ObjectSchema<any>, req: Request, res: Response, next:any) {
    const {error} = schema.validate(req.body)
    
    if (error == null) return next();

    const {details} = error;
    const message = details.map(item => item.message).join(',');

    console.log(message);
    res.status(422).json({
        entity: req.body,
        message
    });

}

async function validateAccountAuth(req: Request, res: Response, next:any) {
    try {

        const token = req.headers['x-access-token'] as string;
        if(!token) return res.sendStatus(401);

        const payload = await accountAuth.verify(token);
        if(!payload) return res.sendStatus(401);

        res.locals.payload = payload;

        next();
        
    } catch (error) {
        console.log(`validateAccountAuth: ${error}`);
        res.sendStatus(400);    
    }
}

async function validateMicroserviceAuth(req: Request, res: Response, next:any) {
    try {

        const token = req.headers['x-access-token'] as string;
        if(!token) return res.sendStatus(401);

        const payload = await microServiceAuth.verify(token);
        if(!payload) return res.sendStatus(401);

        res.locals.payload = payload;

        next();
        
    } catch (error) {
        console.log(`validateMicroServiceAuth: ${error}`);
        res.sendStatus(400);    
    }
}

export default {validateSchema, validateAccountAuth, validateMicroserviceAuth}