
const {fetchTopics,fetchArticleById,fetchArticles} = require('../models/api.models');


exports.getTopics = (req,res,next) => {
    fetchTopics()
    .then((topics)=>{
        res.status(200).send({topics})
    })
    .catch(next)
}

exports.getEndpoints = (req,res,next) => {
    try{
        const endpoints = require('../endpoints.json');
        res.status(200).send({endpoints});
    }
    catch(err){
        next(err)
    }
}


exports.getArticleById = (req,res,next) => {
    const {article_id} = req.params;
    fetchArticleById(article_id)
    .then((article)=>{
        res.status(200).send({article})
    })
    .catch(next)
}

exports.getArticles = (req,res,next) => {
    fetchArticles()
    .then((articles)=>{
        res.status(200).send({articles})
    })
    .catch(next)
}