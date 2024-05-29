const {fetchTopics} = require('../models/api.models');

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

