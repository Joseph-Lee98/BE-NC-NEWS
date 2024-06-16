
const {fetchTopics,fetchArticleById,fetchArticles,fetchCommentsByArticleId,createCommentByArticleId,updateArticleById,removeCommentById,fetchUsers} = require('../models/api.models');


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
    const queries = req.query
    fetchArticles(queries)
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

exports.patchArticleById = (req,res,next) => {
    const {article_id} = req.params;
    const body = req.body;
    updateArticleById(article_id,body)
    .then((article)=>{
        res.status(200).send({article})
    })
    .catch(next)
}

exports.deleteCommentById = (req,res,next) => {
    const {comment_id} = req.params;
    removeCommentById(comment_id)
    .then(()=>{
        res.status(204).send()
    })
    .catch(next)
}

exports.getUsers = (req,res,next) => {
    fetchUsers()
    .then((users)=>{
        res.status(200).send({users})
    })
    .catch(next)
}