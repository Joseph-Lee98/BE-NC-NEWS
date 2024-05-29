const express = require('express');
const {getTopics,getEndpoints,getArticleById} = require('./controllers/api.controllers');

const app = express();

app.get('/api/topics',getTopics);

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.all('*',(req,res)=>{
    res.status(404).send({msg: 'Route not found'});
})

app.use((err,req,res,next)=>{
    if(err.status&&err.message){
        res.status(err.status).send({msg: err.message})
    }
})

app.use((err,req,res,next) => {
    res.status(500).send({msg: 'Internal Server Error'});
})



module.exports = app;