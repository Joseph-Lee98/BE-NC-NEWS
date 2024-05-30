const express = require('express');
const {getTopics,getEndpoints,getArticleById,getArticles,getCommentsByArticleId,postCommentByArticleId,patchArticleById,deleteCommentById} = require('./controllers/api.controllers');

const app = express();

app.use(express.json());

app.get('/api/topics',getTopics);

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)

app.post('/api/articles/:article_id/comments', postCommentByArticleId)

app.patch('/api/articles/:article_id', patchArticleById)

app.delete('/api/comments/:comment_id', deleteCommentById)

app.all('*',(req,res)=>{
    res.status(404).send({msg: 'Route not found'});
})


app.use((err,req,res,next)=>{
    if(err.status&&err.message){
        res.status(err.status).send({msg: err.message})
    }
    else next(err)
})

app.use((err,req,res,next)=>{
    if(err.code){
        res.status(400).send({msg: 'Bad Request'})
    }
    else next(err)
})


app.use((err,req,res,next) => {
    res.status(500).send({msg: 'Internal Server Error'});
})



module.exports = app;