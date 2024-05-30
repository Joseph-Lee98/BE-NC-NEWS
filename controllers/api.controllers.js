
const {fetchTopics,fetchArticleById,fetchArticles,fetchCommentsByArticleId,createCommentByArticleId} = require('../models/api.models');


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

exports.getCommentsByArticleId = (req,res,next) => {
    const {article_id} = req.params;
    fetchCommentsByArticleId(article_id)
    .then((comments)=>{
        res.status(200).send({comments})
    })
    .catch(next)
}

exports.postCommentByArticleId = (req,res,next) => {
    const {article_id} = req.params;
    const body = req.body
    createCommentByArticleId(article_id,body)
    .then((comment)=>{
        res.status(201).send({comment})
    })
    .catch(next)
}