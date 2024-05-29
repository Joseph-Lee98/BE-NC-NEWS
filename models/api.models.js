const db = require('../db/connection');

const {
    convertTimestampToDate,
    createRef,
    formatComments,
    checkExists
  } = require("../db/seeds/utils");

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

exports.fetchArticles = () => {
    return db.query(`
    SELECT articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url, SUM(COALESCE(comments.article_id,0)) AS comment_count
    FROM articles LEFT JOIN comments
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url
    ORDER BY articles.created_at DESC
    `)
    .then((articles)=>{
        return articles.rows
    })
}

exports.fetchCommentsByArticleId = (article_id) => {
    return db.query(`
    SELECT * FROM comments 
    WHERE article_id = $1 
    ORDER BY created_at DESC
    `, [article_id])
    .then((comments) => {
        if (comments.rowCount === 0) {
            return checkExists('articles', 'article_id', article_id)
                .then(() => {
                    return comments.rows
                })   
            }
            return comments.rows;
        });
};