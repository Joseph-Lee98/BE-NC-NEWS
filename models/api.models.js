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
            if(typeof article_id!=='number'||isNaN(article_id)){
                const error = new Error('Bad Request')
                error.status(400)
                throw error
            }
            const error = new Error('Not Found')
            error.status(404)
            throw error
        }
        return data.rows[0];
    })
}