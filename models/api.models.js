const db = require('../db/connection');

exports.fetchTopics = () => {
    return db.query('SELECT * FROM topics')
    .then((data)=>{
        return data.rows
    })
}

exports.fetchArticleById = (article_id) => {
    return db.query(`
    SELECT * FROM articles
    WHERE article_id = $1
    `,[article_id])
    .then((data)=>{
        if(data.rowCount===0){
            const error = new Error('Not Found')
            error.status=404
            throw error
        }
        return data.rows[0];
    })
}