const db = require('../db/connection');
const fs = require('fs/promises')

exports.fetchTopics = () => {
    return db.query('SELECT * FROM topics')
    .then((data)=>{
        return data.rows
    })
    .catch((err)=>{
        throw new Error();
    })
}

exports.fetchEndpoints = () => {
    return fs.readFile('./endpoints.json','utf-8')
    .then((endpoints)=>{
        return JSON.parse(endpoints)
    })
    .catch((err)=>{
        throw new Error();
    })
}