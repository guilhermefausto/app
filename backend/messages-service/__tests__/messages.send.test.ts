import request from 'supertest';
import { IMessage } from '../src/models/message';
import app from './../src/app';
import repository from '../src/models/messageRepository';
import accountsApp from '../../accounts-service/src/app';
import contactsApp from '../../contacts-service/src/app';
import {beforeAll, afterAll, describe, it, expect} from '@jest/globals';
import { MessageStatus } from '../src/models/messageStatus';

const testEmail = 'jest@contacts.com';
const testEmail2 = 'jest2@contacts.com'; 
const testPassword = '123456';
let jwt:string = '';
let testAccountId: number = 0;
let testMessageId: number = 0;
let testContactId: number = 0;

beforeAll(async ()=>{
    //Inicio criação account
    const testAccount = {
        name: 'Jest',
        email: testEmail,
        password: testPassword,
        domain: 'jest.com'
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

    //Criação de contact
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
    //Fim Criação de contact


    //Criação da Message
    const testMessage = {
        accountId: testAccountId,
        body: "corpo da mensagem",
        subject: "assunto da mensagem"
    } as IMessage;

    const addResult = await repository.add(testMessage, testAccountId);
    console.log(`addResult ${addResult.status}`);
    testMessageId = addResult.id!;
    //Fim criação da Message

})

afterAll(async ()=> {
    
    const removeResult = await repository.removeById(testMessageId,testAccountId);
    console.log(`removeResult: ${removeResult}`);

    const deleteContactResponse = await request(contactsApp)
        .delete(`/contacts/${testContactId}?force=true`)
        .set('x-access-token',jwt)
    console.log(`deleteContactResponse: ${deleteContactResponse.status}`)

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
    it('POST /messages/:id/send - Deve retornar statusCode 200', async() => {
        
        const resultado = await request(app)
            .post('/messages/'+testMessageId+'/send')
            .set('x-access-token',jwt);
            
        expect(resultado.status).toEqual(200);
        expect(resultado.body.id).toEqual(testMessageId);
        expect(resultado.body.status).toEqual(MessageStatus.SENT);
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
    })

    
})