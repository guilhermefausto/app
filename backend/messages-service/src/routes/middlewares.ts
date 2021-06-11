import {messageSchema,messageUpdateSchema} from './../models/messageSchemas';
import {Request,Response} from 'express';
import commonsMiddleware from 'ms-commons/api/routes/middlewares';
import {sendingSchema} from './../models/sendingSchema';

function validateMessageSchema(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateSchema(messageSchema,req,res,next);
}

function validateUpdateMessageSchema(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateSchema(messageUpdateSchema,req,res,next);
}

function validateSendingSchema(req: Request, res: Response, next:any) {
    return commonsMiddleware.validateSchema(sendingSchema,req,res,next);
}

export {validateMessageSchema,validateUpdateMessageSchema, validateSendingSchema}