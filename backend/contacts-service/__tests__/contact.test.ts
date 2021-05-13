import request from 'supertest';
import { IContact } from '../src/models/contact';
import app from './../src/app';
import repository from '../src/models/contactRepository';
import accountsApp from '../../accounts-service/src/app';
import accounts from '../../accounts-service/src/controllers/accounts';
import {beforeAll, afterAll, describe, it, expect} from '@jest/globals';

const testEmail = 'jest@contacts.com';
const testEmail2 = 'jest2@contacts.com'; 
const testPassword = '123456';
let jwt:string = '';
let testAccountId: number = 0;
let testContactId: number = 0;

beforeAll(async ()=>{
    //Inicio criação account
    const testAccount = {
        name: 'Jest',
        email: testEmail,
        password: testPassword,
        domain: 'jest.com'
    }
    const account = await request(accountsApp)
                          .post('/accounts/')
                          .send(testAccount);
    testAccountId = account.body.id;
    
    //Login da account criada
    const result = await request(accountsApp)
            .post('/accounts/login')
            .send({
                email: testEmail,
                password: testPassword
            });
    jwt = result.body.token;
    //Fim criação account

    //Inicio criação contact
    const testContact = {
        name: 'Jest',
        email: testEmail,
        phone: '22999626792'
    } as IContact;        

    const result2 = await repository.add(testContact, testAccountId);
    testContactId = result2.id!;
    //Fim criação contact
})

afterAll(async ()=> {
    //remove os contacts criados nos teste
    await repository.removeByEmail(testEmail,testAccountId);
    await repository.removeByEmail(testEmail2,testAccountId);

    //remove a account criada no teste
    await request(accountsApp)
            .delete('/accounts/'+testAccountId)
            .set('x-access-token',jwt);
    
    //faz logout
    await request(accountsApp)
            .post('/accounts/logout')
            .set('x-access-token',jwt);

})

describe('Testando rotas do contacts',()=>{
    
    //Retorna os contatos da account que está logada
    it('GET /contacts/ - Deve retornar statusCode 200', async() => {
        const resultado = await request(app)
            .get('/contacts/')
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(200);
        expect(Array.isArray(resultado.body)).toBeTruthy();    
    }),

    //Erro quando usuário não logado tenta listar os contatos
    it('GET /contacts/ - Deve retornar statusCode 401', async() => {
        const resultado = await request(app)
            .get('/contacts/');
        
        expect(resultado.status).toEqual(401);    
    }),    

    //Retorna um contato específico de uma conta que está logada
    it('GET /contacts/:id - Deve retornar statusCode 200', async() => {
        const resultado = await request(app)
            .get('/contacts/'+ testContactId)
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(200);
        expect(resultado.body.id).toEqual(testContactId);    
    }),
    
    //Erro quando é passado um ID de contato inválido
    it('GET /contacts/:id - Deve retornar statusCode 404', async() => {
        const resultado = await request(app)
            .get('/contacts/-1')
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(404);    
    }),

    //Erro quando é passado um formato inválido de ID
    it('GET /contacts/:id - Deve retornar statusCode 400', async() => {
        const resultado = await request(app)
            .get('/contacts/abc')
            .set('x-access-token',jwt);
        
        expect(resultado.status).toEqual(400);    
    }),

    //Erro quando tenta buscar um ID de contato específico, mas com token inválido
    it('GET /contacts/:id - Deve retornar statusCode 401', async() => {
        const resultado = await request(app)
            .get('/contacts/'+testContactId)
        
        expect(resultado.status).toEqual(401);    
    }),

    //Criação de registro de contato vinculado a uma conta com sucesso
    it('POST /contacts/ - Deve retornar statusCode 201', async() => {
        const testContact = {
            name: 'Jest2',
            email: testEmail2,
            phone: '22999626792'
        } as IContact;
        
        const resultado = await request(app)
            .post('/contacts/')
            .set('x-access-token',jwt)
            .send(testContact);
        
        expect(resultado.status).toEqual(201);
        expect(resultado.body.id).toBeTruthy();    
    }),
    
    //Erro quando é passado um objeto inválido ao criar um contato
    it('POST /contacts/ - Deve retornar statusCode 422', async() => {
        const payload = {
            street: 'Rua Prefeito Jose Guida'
        }
        
        const resultado = await request(app)
            .post('/contacts/')
            .set('x-access-token',jwt)
            .send(payload);
        
        expect(resultado.status).toEqual(422);    
    }),
    
    //Erro quando tenta criar contato sem estar logado ou com token inválido
    it('POST /contacts/ - Deve retornar statusCode 401', async() => {
        const testContact = {
            name: 'Jest2',
            email: testEmail2,
            phone: '22999626792'
        } as IContact;
        
        const resultado = await request(app)
            .post('/contacts/')
            .send(testContact);
        
        expect(resultado.status).toEqual(401);    
    }),
    
    //Erro ao verificar os indexes. Não pode ter o email repetido para o mesmo accountId
    it('POST /contacts/ - Deve retornar statusCode 400', async() => {
        const testContact = {
            name: 'Jest3',
            email: testEmail,
            phone: '22999626792'
        } as IContact;
        
        const resultado = await request(app)
            .post('/contacts/')
            .set('x-access-token',jwt)
            .send(testContact);
        
        expect(resultado.status).toEqual(400);    
    }),

    //Contato alterado com sucesso
    it('PATCH /contacts/:id - Deve retornar statusCode 200', async() => {
        const payload = {
            name: 'Guilherme'
        }
        
        const resultado = await request(app)
            .patch('/contacts/'+testContactId)
            .set('x-access-token',jwt)
            .send(payload);
        console.log('Aquiiii: '+resultado.body.name);
        expect(resultado.status).toEqual(200);
        expect(resultado.body.name).toEqual('Guilherme');    
    }),
    
    //Erro ao alterar contato sem token
    it('PATCH /contacts/:id - Deve retornar statusCode 401', async() => {
        const payload = {
            name: 'Guilherme'
        }
        
        const resultado = await request(app)
            .patch('/contacts/'+testContactId)
            .send(payload);
        
        expect(resultado.status).toEqual(401);
    })

    //Erro ao alterar contato mandando objeto inválido
    it('PATCH /contacts/:id - Deve retornar statusCode 422', async() => {
        const payload = {
            street: 'Rua Prefeito José Guida'
        }
        
        const resultado = await request(app)
            .patch('/contacts/'+testContactId)
            .set('x-access-token',jwt)
            .send(payload);
        
        expect(resultado.status).toEqual(422);
    }),
    
    //Erro ao alterar passando um id de contato inválido
    it('PATCH /contacts/:id - Deve retornar statusCode 404', async() => {
        const payload = {
            name: 'Guilherme'
        }
        
        const resultado = await request(app)
            .patch('/contacts/-1')
            .set('x-access-token',jwt)
            .send(payload);
        
        expect(resultado.status).toEqual(404);
    })
    
    //Erro quando é passado um parâmetro num formato inválido
    it('PATCH /contacts/:id - Deve retornar statusCode 400', async() => {
        const payload = {
            name: 'Guilherme'
        }
        
        const resultado = await request(app)
            .patch('/contacts/abc')
            .set('x-access-token',jwt)
            .send(payload);
        
        expect(resultado.status).toEqual(400);
    })    

})