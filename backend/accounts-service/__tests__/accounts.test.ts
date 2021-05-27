import request from 'supertest';
import { IAccount } from '../src/models/account';
import app from './../src/app';
import repository from '../src/models/accountRepository';
import auth from '../src/auth';
import {beforeAll, afterAll, describe, it, expect} from '@jest/globals';
import { AccountStatus } from '../src/models/accountStatus';

const testEmail = 'jest@accounts.com';
const testEmail2 = 'jest2@accounts.com';
const hashPassword = '$2a$10$ez0VDj0Gh.tRC/jFxoLIieuo2cgPDhVvWLQl5T0dqW3LI0GPLA4Fm'; //senha 123456 
const testPassword = '123456';
let jwt:string = '';
let testId: number = 0;

beforeAll(async ()=>{
    const testAccount : IAccount = {
        name: 'Jest',
        email: testEmail,
        password: hashPassword,
        domain: 'jest.com'
    }
    const result = await repository.add(testAccount);
    testId = result.id!;
    jwt = await auth.sign(result.id!);
})

afterAll(async ()=> {
    await repository.removeByEmail(testEmail);
    await repository.removeByEmail(testEmail2);
})

describe('Testando rotas do accounts',()=>{
    it('GET /accounts/ - Deve retornar statusCode 200', async() => {
        const resultado = await request(app)
            .get('/accounts/')
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(200);
        expect(Array.isArray(resultado.body)).toBeTruthy();    
    }),

    it('POST /accounts/ - Deve retornar status 201 e um objeto', async ()=>{

        const payload : IAccount ={
            name: 'Jest 2',
            email: testEmail2,
            password: '123456',
            domain: 'jest@jest.com'
        }

        const resultado = await request(app)
            .post('/accounts')
            .send(payload)

        expect(resultado.status).toEqual(201);
        expect(resultado.body.id).toBeTruthy();

    }),

    it('POST /accounts/ - Deve retornar statusCode 422', async ()=>{

        const payload ={
            name: 'Guilherme',
            street: 'Rua Prefeito Jośe Guida',
            city: 'Bom Jardim',
            state: 'RJ'
        }

        const resultado = await request(app)
            .post('/accounts')
            .send(payload)

        expect(resultado.status).toEqual(422);

    }),

    it('PATCH /accounts/:id - Deve retornar statusCode 200', async ()=>{

        const payload ={
            name: 'Jest Update',
        }

        const resultado = await request(app)
            .patch('/accounts/'+testId)
            .set('x-access-token',jwt)
            .send(payload);
            

        expect(resultado.status).toEqual(200);
        expect(resultado.body.id).toEqual(testId);
        expect(resultado.body.name).toEqual(payload.name);        

    })
    
    it('PATCH /accounts/:id - Deve retornar statusCode 400', async ()=>{

        const payload ={
            name: 'Guilherme Fausto',
        }

        const resultado = await request(app)
            .patch('/accounts/abc')
            .set('x-access-token',jwt)
            .send(payload)

        expect(resultado.status).toEqual(400);

    }),
    

    it('PATCH /accounts/:id - Deve retornar statusCode 403', async ()=>{

        const payload ={
            name: 'Guilherme Fausto',
        }

        const resultado = await request(app)
            .patch('/accounts/-1')
            .set('x-access-token',jwt)
            .send(payload)

        expect(resultado.status).toEqual(403);

    }),    

    it('GET /accounts/:id - Deve retornar statusCode 200', async() => {
        const resultado = await request(app)
            .get('/accounts/'+testId)
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(200);
        expect(resultado.body.id).toBe(testId);    
    }),

    it('GET /accounts/:id - Deve retornar statusCode 403', async() => {
        const resultado = await request(app)
            .get('/accounts/-1')
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(403);
    }),
    
    it('GET /accounts/:id - Deve retornar statusCode 400', async() => {
        const resultado = await request(app)
            .get('/accounts/abc')
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(400);
    }),
    
    
    it('DELETE /accounts/:id - Deve retornar statusCode 200', async() => {
        const resultado = await request(app)
            .delete('/accounts/'+testId)
            .set('x-access-token',jwt);    
 
        expect(resultado.status).toEqual(200);
        expect(resultado.body.status).toEqual(AccountStatus.REMOVED);
    }),

    it('DELETE /accounts/:id?force=true - Deve retornar statusCode 200', async() => {
        const resultado = await request(app)
            .delete(`/accounts/${testId}?force=true`)
            .set('x-access-token',jwt);
 
        expect(resultado.status).toEqual(200);
    }),    

    it('DELETE /accounts/:id - Deve retornar statusCode 403', async() => {
        const resultado = await request(app)
            .delete('/accounts/-1')
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(403);
    })
})