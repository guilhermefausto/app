/*require('dotenv-safe').config({
    example: '../.env.example',
    path: '../.env'
})*/

import request from 'supertest';
import { IMessage } from '../src/models/message';
import app from '../src/app';
import repository from '../src/models/messageRepository';
import accountsApp from '../../accounts-service/src/app';
import contactsApp from '../../contacts-service/src/app';
import {beforeAll, afterAll, describe, it, expect, jest} from '@jest/globals';
import { MessageStatus } from '../src/models/messageStatus';
import { IAccountEmail } from '../../accounts-service/src/models/accountEmail';
import { ISending } from '../src/models/sending';
import { SendingStatus } from '../src/models/sendingStatus';
import { v4 as uuid } from 'uuid';
import sendingRepository from '../src/models/sendingRepository';
import microserviceAuth from '../../__commons__/src/api/auth/microservicesAuth';

const testDomain = 'jest.send.com'
const testEmail = `jest@${testDomain}`;
const testEmail2 = `jest2@${testDomain}`;
const testPassword = '123456';
let jwt:string = '';
let testAccountId: number = 0;
let testAccountEmailId: number = 0;
let testMessageId: number = 0;
let testContactId: number = 0;
let testContactId2: number = 0;
let testSendingId: string = '';
let testSendingId2: string = '';



/*import microservicesAuth from '../../__commons__/src/api/auth/microservicesAuth';
const token = microservicesAuth.sign({
    id: "7a1d7ed0-3cdb-44d8-82de-9edaad1d0bfc", 
    contactId: 90,
    messageId: 1,
    accountId: 218
});
console.log(token);*/


beforeAll(async ()=>{
    jest.setTimeout(10000);

    //Inicio criação account
    const testAccount = {
        name: 'Jest',
        email: testEmail,
        password: testPassword,
        domain: testDomain
    }
    const accountResponse = await request(accountsApp)
                          .post('/accounts/')
                          .send(testAccount);
    console.log(`accountResponse: ${accountResponse.status} - id ${accountResponse.body.id}`);
    testAccountId = accountResponse.body.id;
    
    //Login da account criada
    const loginResponse = await request(accountsApp)
            .post('/accounts/login')
            .send({
                email: testEmail,
                password: testPassword
            });
    console.log(`loginResponse: ${loginResponse.status}`);
    jwt = loginResponse.body.token;
    //Fim do login

    const testAccountEmail: IAccountEmail = {
        name: 'Jest',
        email: testEmail,
        accountId: testAccountId
    }
    const accountEmailResponse = await request(accountsApp)
        .put('/accounts/settings/accountEmails')
        .send(testAccountEmail)
        .set('x-access-token',jwt);
    console.log(`accountEmailResponse: ${accountEmailResponse.status}`);
    if(accountEmailResponse.status != 201) throw new Error();
    testAccountEmailId = accountEmailResponse.body.id;

    //Criação de contact 1
    const testContact ={
        accountId: testAccountId,
        name: 'Jest',
        email: testEmail
    }
    const contactResponse = await request(contactsApp)
            .post('/contacts')
            .send(testContact)
            .set('x-access-token',jwt)
    console.log(`contactResponse: ${contactResponse.status}`);
    testContactId = contactResponse.body.id;
    //Fim Criação de contact 2

    //Criação de contact 2
    const testContact2 ={
        accountId: testAccountId,
        name: 'Jest',
        email: testEmail2
    }
    const contactResponse2 = await request(contactsApp)
            .post('/contacts')
            .send(testContact2)
            .set('x-access-token',jwt)
    console.log(`contactResponse2: ${contactResponse2.status}`);
    testContactId2 = contactResponse2.body.id;
    //Fim Criação de contact 2  


    //Criação da Message
    const testMessage = {
        accountId: testAccountId,
        body: "corpo da mensagem",
        subject: "assunto da mensagem",
        accountEmailId: testAccountEmailId
    } as IMessage;

    const addResult = await repository.add(testMessage, testAccountId);
    console.log(`addResult ${addResult.status}`);
    testMessageId = addResult.id!;
    //Fim criação da Message

    //Inicio criação do sending 1
    const testSending: ISending = {
        accountId: testAccountId,
        messageId: testMessageId,
        contactId: testContactId,
        status: SendingStatus.QUEUED,
        id: uuid()
    }
    const sendingResult = await sendingRepository.add(testSending);
    console.log(`sendingResult: ${sendingResult.id}`);
    if(!sendingResult.id) throw new Error();
    testSendingId = sendingResult.id;
    //Fim criação do sending

    //Inicio criação do sending 2
    const testSending2: ISending = {
        accountId: testAccountId,
        messageId: testMessageId,
        contactId: testContactId2,
        status: SendingStatus.QUEUED,
        id: uuid()
    }
    const sendingResult2 = await sendingRepository.add(testSending2);
    console.log(`sendingResult2: ${sendingResult2.id}`);
    if(!sendingResult2.id) throw new Error();
    testSendingId2 = sendingResult2.id;
    //Fim criação do sending    

})

afterAll(async ()=> {
    jest.setTimeout(10000);

    const sendingResult = await sendingRepository.removeById(testSendingId,testAccountId);
    const sendingResult2 = await sendingRepository.removeById(testSendingId2,testAccountId);
    console.log(`sendingResult: ${sendingResult}:${sendingResult2}`);

    const removeResult = await repository.removeById(testMessageId,testAccountId);
    console.log(`removeResult: ${removeResult}`);

    const deleteContactResponse = await request(contactsApp)
        .delete(`/contacts/${testContactId}?force=true`)
        .set('x-access-token',jwt)
    console.log(`deleteContactResponse: ${deleteContactResponse.status}`)

    const deleteContactResponse2 = await request(contactsApp)
        .delete(`/contacts/${testContactId2}?force=true`)
        .set('x-access-token',jwt)
    console.log(`deleteContactResponse2: ${deleteContactResponse2.status}`)
    
    const deleteAccountEmailResponse = await request(accountsApp)
        .delete(`/accounts/settings/accountEmails/${testAccountEmailId}/?force=true`)
        .set('x-access-token',jwt);
    console.log(`deleteAccountEmailResponse: ${deleteAccountEmailResponse.status}`);

    //remove a account criada no teste
    const deleteAccountResponse = await request(accountsApp)
                                .delete(`/accounts/${testAccountId}?force=true`)
                                .set('x-access-token',jwt);
    console.log(`deleteAccountResponse: ${deleteAccountResponse.status}`);
    
    //faz logout
    const logoutResponse = await request(accountsApp)
                                .post('/accounts/logout')
                                .set('x-access-token',jwt);
    console.log(`logoutResponse: ${logoutResponse.status}`)
})

describe('Testando rotas do messages',()=>{
    
    //Retorna ok created para envio da mensagem para fila
    it('POST /messages/:id/send - Deve retornar statusCode 202', async() => {
        
        const resultado = await request(app)
            .post('/messages/'+testMessageId+'/send')
            .set('x-access-token',jwt);
            
        expect(resultado.status).toEqual(202);
        expect(resultado.body.id).toEqual(testMessageId);
        expect(resultado.body.status).toEqual(MessageStatus.SCHEDULED);
    }),
    
    //Retorna erro não autorizado para envio da mensagem para fila
    it('POST /messages/:id/send - Deve retornar statusCode 401', async() => {
        
        const resultado = await request(app)
            .post(`/messages/${testMessageId}/send`)
            
        expect(resultado.status).toEqual(401);
    }),
    
    //Retorna erro de mensagem com ID inválido para envio da mensagem para fila
    it('POST /messages/:id/send - Deve retornar statusCode 403', async() => {
        
        const resultado = await request(app)
            .post(`/messages/-1/send`)
            .set('x-access-token',jwt);
            
        expect(resultado.status).toEqual(403);
    }),

    //Retorna erro de mensagem com ID em formato inválido para envio da mensagem para fila
    it('POST /messages/:id/send - Deve retornar statusCode 400', async() => {
        
        const resultado = await request(app)
            .post(`/messages/abc/send`)
            .set('x-access-token',jwt);
            
        expect(resultado.status).toEqual(400);
    }),

    //Retorna um ok para a mensagem que foi enviada ao SES
    it('POST /messages/sending - Deve retornar statusCode 202', async () =>{
        const payload: ISending = {
            id: testSendingId,
            accountId: testAccountId,
            contactId: testContactId,
            messageId: testMessageId
        }

        const msJwt = await microserviceAuth.sign(payload);
        
        const result = await request(app)
                        .post('/messages/sending')
                        .set('x-access-token',`${msJwt}`)
                        .send(payload); 
        
        expect(result.status).toEqual(202);
        expect(result.body.id).toEqual(testSendingId);
        expect(result.body.status).toEqual(SendingStatus.SENT);
    }),

    //Retorna erro de autenticação
    it('POST /messages/sending - Deve retornar statusCode 401', async () =>{
        
        const result = await request(app)
                        .post('/messages/sending')
        
        expect(result.status).toEqual(401);
    }),
    
    //Retorna erro por causa de UUID inválido
    it('POST /messages/sending - Deve retornar statusCode 404', async () =>{
        const payload: ISending = {
            id: uuid(),
            accountId: testAccountId,
            contactId: testContactId,
            messageId: testMessageId
        }

        const msJwt = await microserviceAuth.sign(payload);
        
        const result = await request(app)
                        .post('/messages/sending')
                        .set('x-access-token',`${msJwt}`)
                        .send(payload); 
        
        expect(result.status).toEqual(404);
    }),

    //Retorna erro por causa de accountId inválido
    it('POST /messages/sending - Deve retornar statusCode 404', async () =>{
        const payload: ISending = {
            id: testSendingId2,
            accountId: 99999999,
            contactId: testContactId,
            messageId: testMessageId
        }

        const msJwt = await microserviceAuth.sign(payload);
        
        const result = await request(app)
                        .post('/messages/sending')
                        .set('x-access-token',`${msJwt}`)
                        .send(payload); 
        
        expect(result.status).toEqual(404);
    }),
    
    //Retorna um erro por causa de contactId inválido
    it('POST /messages/sending - Deve retornar statusCode 404', async () =>{
        const payload: ISending = {
            id: testSendingId2,
            accountId: testAccountId,
            contactId: 999999999,
            messageId: testMessageId
        }

        const msJwt = await microserviceAuth.sign(payload);
        
        const result = await request(app)
                        .post('/messages/sending')
                        .set('x-access-token',`${msJwt}`)
                        .send(payload); 
        
        expect(result.status).toEqual(404);
    }),    

    //Retorna erro por causa do messageId inválido
    it('POST /messages/sending - Deve retornar statusCode 404', async () =>{
        const payload: ISending = {
            id: testSendingId2,
            accountId: testAccountId,
            contactId: testContactId,
            messageId: 99999999
        }

        const msJwt = await microserviceAuth.sign(payload);
        
        const result = await request(app)
                        .post('/messages/sending')
                        .set('x-access-token',`${msJwt}`)
                        .send(payload); 
        
        expect(result.status).toEqual(404);
    }),

    //Retorna erro passando payload inválido
    it('POST /messages/sending - Deve retornar statusCode 422', async () =>{
        const payload = {
            street: 'rua'
        }

        const msJwt = await microserviceAuth.sign(payload);
        
        const result = await request(app)
                        .post('/messages/sending')
                        .set('x-access-token',`${msJwt}`)
                        .send(payload); 
        
        expect(result.status).toEqual(422);
    })

    //Retorna um erro para o envio da mensagem pelo SES - Está mockado
    it('POST /messages/sending - Deve retornar statusCode 400', async () =>{
        const payload: ISending = {
            id: testSendingId2,
            accountId: testAccountId,
            contactId: testContactId2,
            messageId: testMessageId
        }

        const msJwt = await microserviceAuth.sign(payload);
        
        const result = await request(app)
                        .post('/messages/sending')
                        .set('x-access-token',`${msJwt}`)
                        .send(payload); 
        
        expect(result.status).toEqual(400);
    })

    
})