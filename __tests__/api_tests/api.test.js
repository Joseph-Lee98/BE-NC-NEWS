const data = require('../../db/data/test-data/index');
const db = require('../../db/connection');
const seed = require('../../db/seeds/seed');
const request = require('supertest');
const app = require('../../app');
const endpoints = require('../../endpoints.json');


beforeEach(()=>{
    return seed(data);
})

afterAll(()=>{
    return db.end();
})

describe('/api/topics',()=>{
    test('200: Should return 200 status code and correct message',()=>{
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({body})=>{
            expect(body.topics).toHaveLength(3);
            body.topics.forEach((topic) => {
                expect(topic).toMatchObject({
                    slug: expect.any(String),
                    description: expect.any(String)
                })
            }
            )
        })
    })
    test('404: should return 404 status code and correct message when endpoint is invalid',()=>{
        return request(app)
        .get('/api/topicss')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Route not found')
        })
    })
})

describe('/api',()=>{
    test('200: Should return 200 status code and correct message',()=>{
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body})=>{
            expect(body.endpoints).toEqual(endpoints)
        })
    })
    test('404: should return 404 status code and correct message when endpoint is invalid',()=>{
        return request(app)
        .get('/apis')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Route not found')
        })
    })
})