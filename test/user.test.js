const request=require('supertest')

const app=require('../src/app')


test('Should sign up a new user',async()=>{
        await request(app).post('/user').send({
            name:'Vivek',
            email:'vvksingh6939@gmail.com',
            password:'MyPass2077995631'
        }).expect(201)
})