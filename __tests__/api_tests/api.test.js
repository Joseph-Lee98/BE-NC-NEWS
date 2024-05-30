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
    checkExists,
    validDataType
  } = require('../../db/seeds/utils');



beforeEach(()=>{
    return seed(data);
})

afterAll(()=>{
    return db.end();
})

describe('GET - /api/topics',()=>{
    test('200: Should return 200 status code and correct message containing array of topic objects',()=>{
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

describe('GET - /api',()=>{
    test('200: Should return 200 status code and correct message containing object listing endpoints',()=>{
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

describe('GET - /api/articles/:article_id',()=>{
    test('200: should return 200 status code and correct article',()=>{
        return request(app)
        .get('/api/articles/3')
        .expect(200)
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
                votes: 0,
                comment_count: '2'
            })
        })
    })
    test('400: Should return 400 status code and correct message when article_id parameter is invalid',()=>{
        return request(app)
        .get('/api/articles/banana')
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('404: Should return 404 status code and correct message when article_id parameter is valid but not found',()=>{
        return request(app)
        .get('/api/articles/50')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Not Found')
        })
    })
})

describe('GET - /api/articles',()=>{
    test('200: When no topic query, should return 200 status code and correct array of article objects with comment_count property',()=>{
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body})=>{
            expect(body.articles).toHaveLength(data.articleData.length);
            expect(body.articles).toBeSortedBy("created_at",{
                descending: true
            })
            body.articles.forEach((article) => {
                expect(article).toMatchObject({
                    article_id: expect.any(Number),
                    title: expect.any(String),
                    author: expect.any(String),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(String)
                })
                const comment_count = Number(article.comment_count);
                expect(typeof comment_count).toBe('number');
                expect(Number.isNaN(comment_count)).toBe(false);
            }
            )
        })
    })
    test('200: When passed a topic query, should return 200 status code and correct array of article objects with comment_count property, where topic property of each object matches topic query',()=>{
        return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(({body})=>{
            expect(body.articles).toHaveLength(12);
            expect(body.articles).toBeSortedBy("created_at",{
                descending: true
            })
            body.articles.forEach((article) => {
                expect(article).toMatchObject({
                    article_id: expect.any(Number),
                    title: expect.any(String),
                    author: expect.any(String),
                    topic: 'mitch',
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(String)
                })
                const comment_count = Number(article.comment_count);
                expect(typeof comment_count).toBe('number');
                expect(Number.isNaN(comment_count)).toBe(false);
            }
            )
        })
    })
    test('404: Should return 404 status code and correct message when topic is not found in slug property of topics table',()=>{
        return request(app)
        .get('/api/articles?topic=dogs')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Not Found')
        })
    })
})

describe('GET - /api/articles/:article_id/comments',()=>{
    test('200: should return 200 status code and array of comments where article id matches id passed in as parameter',()=>{
        return request(app)
        .get('/api/articles/3/comments')
        .expect(200)
        .then(({body})=>{
            const commentIds = [];
            expect(body.comments).toHaveLength(2)
            expect(body.comments).toBeSortedBy("created_at",{
                descending: true
            })
            body.comments.forEach((comment)=>{
                commentIds.push(comment.comment_id)
                expect(comment).toMatchObject({
                    body: expect.any(String),
                    votes: expect.any(Number),
                    author: expect.any(String),
                    article_id: 3,
                    created_at: expect.any(String),
                    comment_id: expect.any(Number)
                })
            })
            const sortedCommentIds = [...commentIds].sort()
            expect(sortedCommentIds).toEqual([10,11])
        })
    })
    test('200: should return 200 status code and an empty array when article id passed in has no comments',()=>{
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({body})=>{
            expect(body.comments).toHaveLength(0)
        })
    })
    test('400: Should return 400 status code and correct message when article_id parameter is invalid',()=>{
        return request(app)
        .get('/api/articles/banana/comments')
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('404: Should return 404 status code and correct message when article_id parameter is valid but not found',()=>{
        return request(app)
        .get('/api/articles/50/comments')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Not Found')
        })
    })
    test('404: should return 404 status code and correct message when endpoint is invalid',()=>{
        return request(app)
        .get('/api/articls/4/comments')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Route not found')
        })
    })

})

describe('POST - /api/articles/:article_id/comments',()=>{
    test('201: should return 201 status code and the comment object added to the comments table',()=>{
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: 'rogersop',
            body: 'This is a very long article'
        })
        .expect(201)
        .then(({body})=>{

            expect(body.comment).toMatchObject({
                body: 'This is a very long article',
                votes: 0,
                author: 'rogersop',
                article_id: 2,
                created_at: expect.any(String),
                comment_id: 19
            })
        })
    })
    test('404: Should return 404 status code and correct message when article_id parameter is valid but not found',()=>{
        return request(app)
        .post('/api/articles/50/comments')
        .send({
            username: 'rogersop',
            body: 'This is a very long article'
        })
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Not Found')
        })
    })
    test('404: Should return 404 status code and correct message when username is valid but not found',()=>{
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: 'manicstreetpreacher',
            body: 'This is a very long article'
        })
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Not Found')
        })
    })
    test('400: Should return 400 status code and correct message when article_id parameter is invalid',()=>{
        return request(app)
        .post('/api/articles/banana/comments')
        .send({
            username: 'rogersop',
            body: 'This is a very long article'
        })
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('400: Should return 400 status code and correct message when username is invalid',()=>{
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: 10,
            body: 'This is a very long article'
        })
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('400: Should return 400 status code and correct message when body is invalid',()=>{
        return request(app)
        .post('/api/articles/2/comments')
        .send({
            username: 'rogersop',
            body: 10
        })
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('404: should return 404 status code and correct message when endpoint is invalid',()=>{
        return request(app)
        .post('/api/articls/4/comments')
        .send({
            username: 'rogersop',
            body: 'This is a very long article'
        })
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Route not found')
        })
    })
})

describe('PATCH - /api/articles/:article_id',()=>{
    test('200: should return 200 status code and the updated article object in the articles table',()=>{
        return request(app)
        .patch('/api/articles/2')
        .send({
            inc_votes: 5
        })
        .expect(200)
        .then(({body})=>{
            expect(body.article).toEqual({
                article_id: 2,
                title: "Sony Vaio; or, The Laptop",
                topic: "mitch",
                author: "icellusedkars",
                votes: 5,
                body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
                created_at: "2020-10-16T05:03:00.000Z",
                article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
            })
        })
    })
    test('404: Should return 404 status code and correct message when article_id parameter is valid but not found',()=>{
        return request(app)
        .patch('/api/articles/50')
        .send({
            inc_votes: 5
        })
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Not Found')
        })
    })
    test('400: Should return 400 status code and correct message when article_id parameter is invalid',()=>{
        return request(app)
        .patch('/api/articles/banana')
        .send({
            inc_votes: 5
        })
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('400: Should return 400 status code and correct message when inc_votes value is invalid',()=>{
        return request(app)
        .patch('/api/articles/2')
        .send({
            inc_votes: '5'
        })
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('404: should return 404 status code and correct message when endpoint is invalid',()=>{
        return request(app)
        .patch('/api/articls/4')
        .send({
            inc_votes: 5,
        })
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Route not found')
        })
    })
})

describe('DELETE - /api/comments/:comment_id',()=>{
    test('204: should return 204 status code and no response content for a successful deletion of a comment',()=>{
        return request(app)
        .delete('/api/comments/5')
        .expect(204)
        .then(({body})=>{
            expect(body).toEqual({})
        })
    })
    test('400: Should return 400 status code and correct message when comment_id is invalid',()=>{
        return request(app)
        .delete('/api/comments/banana')
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('404: Should return 404 status code and correct message when comment_id is valid but not found',()=>{
        return request(app)
        .delete('/api/comments/100')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Not Found')
        })
    })
    test('404: should return 404 status code and correct message when endpoint is invalid',()=>{
        return request(app)
        .delete('/api/commentss/4')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Route not found')
        })
    })
})

describe('GET - /api/users',()=>{
    test('200: Should return 200 status code and correct message containing array of user objects',()=>{
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body})=>{
            expect(body.users).toHaveLength(4);
            body.users.forEach((user) => {
                expect(user).toMatchObject({
                    username: expect.any(String),
                    name: expect.any(String),
                    avatar_url: expect.any(String)
                })
            }
            )
        })
    })
    test('404: should return 404 status code and correct message when endpoint is invalid',()=>{
        return request(app)
        .get('/api/userss')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Route not found')
        })
    })
})