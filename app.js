const express = require('express');
const {getTopics,getEndpoints} = require('./controllers/api.controllers');

const app = express();

app.get('/api/topics',getTopics);

app.get('/api', getEndpoints)

app.all('*',(req,res)=>{
    res.status(404).send({msg: 'Route not found'});
})

app.use((err,req,res,next) => {
    res.status(500).send({msg: 'Internal Server Error'});
})



module.exports = app;