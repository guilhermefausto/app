import request from 'supertest';
import app from './../src/app';

describe('Testando rotas do accounts',()=>{
    it('POST /accounts/ - Deve retornar status 201 e um objeto', async ()=>{

        const payload ={
            id: 1,
            name: 'Guilherme Fausto',
            email: 'guilhermesfausto@gmail.com',
            password: '123456',
            status: 1
        }

        const resultado = await request(app)
            .post('/accounts')
            .send(payload)

            expect(resultado.status).toEqual(201);

    })
})