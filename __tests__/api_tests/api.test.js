const data = require('../../db/data/test-data/index');
const db = require('../../db/connection');
const seed = require('../../db/seeds/seed');
const request = require('supertest');
const app = require('../../app');
const endpoints = require('../../endpoints.json');
const {
    convertTimestampToDate,
    createRef,
    formatComments,
  } = require('../../db/seeds/utils');


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

describe('/api/articles/:article_id',()=>{
    test.only('200: should return 200 status code and correct article',()=>{
        return request(app)
        .get('/api/articles/3')
        .then(({body})=>{
            const articleWithDate = convertTimestampToDate(body.article);
            expect(articleWithDate).toEqual({
                title: "Eight pug gifs that remind me of mitch",
                topic: "mitch",
                author: "icellusedkars",
                body: "some gifs",
                created_at: new Date(1604394720000),
                article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                article_id: 3,
                votes: 0
            })
        })
    })
})