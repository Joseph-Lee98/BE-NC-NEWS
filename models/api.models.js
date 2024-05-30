const db = require('../db/connection');

const {
    convertTimestampToDate,
    createRef,
    formatComments,
    checkExists,
    validDataType
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

exports.createCommentByArticleId = (article_id,body) => {
    return validDataType('string',body.username)
    .then(()=>{
    return validDataType('string',body.body)  
    })
    .then(()=>{
    return checkExists('articles','article_id',article_id)
    })
    .then(()=>{
    return checkExists('users','username',body.username)
    })
    .then(()=>{
    return db.query(`
    INSERT INTO comments
    (body,article_id,author)
    VALUES
    ($1,$2,$3)
    RETURNING *;
    `,[body.body,article_id,body.username])
    })  
    .then((comment)=>{
        return comment.rows[0]
    })
}

exports.updateArticleById = (article_id,body) => {
    const {inc_votes} = body;
    return validDataType('number',inc_votes)
    .then(()=>{
    return checkExists('articles','article_id',article_id)
    })
    .then(()=>{
    return db.query(`
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
    `,[inc_votes,article_id])
    })
    .then((article)=>{
        return article.rows[0]
    })
}

exports.removeCommentById = (comment_id) => {
    return db.query(`
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *
    `,[comment_id])
    .then((comment)=>{
        if(comment.rowCount===0){
            const error = new Error('Not Found')
            error.status = 404
            throw error
        }
    })
}

exports.fetchUsers = () => {
    return db.query('SELECT * FROM users')
    .then((users)=>{
        return users.rows
    })
}