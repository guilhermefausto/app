import { expectCt } from 'helmet';
import { isMainThread } from 'node:worker_threads';
import request from 'supertest';
import app from './../src/app';

describe('Testando rotas do accounts',()=>{
    it('GET /accounts/ - Deve retornar statusCode 200', async() => {
        const resultado = await request(app)
            .get('/accounts/');
        
        expect(resultado.status).toEqual(200);
        expect(Array.isArray(resultado.body)).toBeTruthy();    
    }),

    it('POST /accounts/ - Deve retornar status 201 e um objeto', async ()=>{

        const payload ={
            id: 1,
            name: 'Guilherme',
            email: 'guilhermesfausto@gmail.com',
            password: '123456',
            status: 100
        }

        const resultado = await request(app)
            .post('/accounts')
            .send(payload)

        expect(resultado.status).toEqual(201);
        expect(resultado.body.id).toBe(1);

    }),

    it('POST /accounts/ - Deve retornar statusCode 422', async ()=>{

        const payload ={
            id: 1,
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
            name: 'Guilherme Fausto',
            email: 'guilhermesfausto@gmail.com',
            password: '123456'
        }

        const resultado = await request(app)
            .patch('/accounts/1')
            .send(payload)

        expect(resultado.status).toEqual(200);
        expect(resultado.body.id).toEqual(1);

    }),

    it('PATCH /accounts/:id - Deve retornar statusCode 404', async ()=>{

        const payload ={
            name: 'Guilherme Fausto',
            email: 'guilhermesfausto@gmail.com',
            password: '123456'
        }

        const resultado = await request(app)
            .patch('/accounts/-1')
            .send(payload)

        expect(resultado.status).toEqual(404);

    }),    

    it('GET /accounts/:id - Deve retornar statusCode 200', async() => {
        const resultado = await request(app)
            .get('/accounts/1');
        
        expect(resultado.status).toEqual(200);
        expect(resultado.body.id).toBe(1);    
    }),

    it('GET /accounts/:id - Deve retornar statusCode 404', async() => {
        const resultado = await request(app)
            .get('/accounts/2');
        
        expect(resultado.status).toEqual(404);
    }),
    
    it('GET /accounts/:id - Deve retornar statusCode 400', async() => {
        const resultado = await request(app)
            .get('/accounts/abc');
        
        expect(resultado.status).toEqual(400);
    })
})