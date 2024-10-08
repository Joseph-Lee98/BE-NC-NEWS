const format = require("pg-format");
const db = require("../connection");
const {
  convertTimestampToDate,
  createRef,
  formatComments,
  hashPasswords,
  hashPassword,
} = require("../../utils/seedUtils");

const seed = async ({ topicData, userData, articleData, commentData }) => {
  try {
    await db.query(`DROP TABLE IF EXISTS comments;`);
    await db.query(`DROP TABLE IF EXISTS articles;`);
    await db.query(`DROP TABLE IF EXISTS users;`);
    await db.query(`DROP TABLE IF EXISTS topics;`);

    await db.query(`
     CREATE TABLE topics (
       slug VARCHAR PRIMARY KEY,
       description VARCHAR
     );
   `);

    await db.query(`
     CREATE TABLE users (
       username VARCHAR(20) PRIMARY KEY,
       name VARCHAR(30) NOT NULL,
       avatar_url VARCHAR,
       password VARCHAR NOT NULL,
       role VARCHAR(10) DEFAULT 'user',
       deleted_at TIMESTAMP NULL,
       is_private BOOLEAN DEFAULT false
     );
   `);

    await db.query(`
     CREATE TABLE articles (
       article_id SERIAL PRIMARY KEY,
       title VARCHAR(200) NOT NULL,
       topic VARCHAR NOT NULL REFERENCES topics(slug),
       author VARCHAR(20),
       body VARCHAR(5000) NOT NULL,
       created_at TIMESTAMP DEFAULT NOW(),
       votes INT DEFAULT 0 NOT NULL,
       article_img_url VARCHAR DEFAULT 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
     );
   `);

    await db.query(`
     CREATE TABLE comments (
       comment_id SERIAL PRIMARY KEY,
       body VARCHAR(1000) NOT NULL,
       article_id INT NOT NULL,
       author VARCHAR(20),
       votes INT DEFAULT 0 NOT NULL,
       created_at TIMESTAMP DEFAULT NOW(),
       FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
     );
   `);

    const hashedUserData = await hashPasswords(userData);
    const hashedAdminPassword = await hashPassword(process.env.ADMIN_PASSWORD);
    const adminUser = {
      username: process.env.ADMIN_USERNAME,
      name: "Admin User",
      password: hashedAdminPassword,
      role: "admin",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/4919/4919646.png",
      is_private: true,
    };

    const insertTopicsQueryStr = format(
      `INSERT INTO topics (slug, description) VALUES %L;`,
      topicData.map(({ slug, description }) => [slug, description])
    );

    const insertUsersQueryStr = format(
      "INSERT INTO users (username, name, avatar_url, password, role, is_private) VALUES %L;",
      [...hashedUserData, adminUser].map(
        ({ username, name, avatar_url, password, role, is_private }) => [
          username,
          name,
          avatar_url,
          password,
          role,
          is_private || false,
        ]
      )
    );

    await db.query(insertTopicsQueryStr);
    await db.query(insertUsersQueryStr);

    const formattedArticleData = articleData.map(convertTimestampToDate);

    const insertArticlesQueryStr = format(
      "INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;",
      formattedArticleData.map(
        ({
          title,
          topic,
          author,
          body,
          created_at,
          votes = 0,
          article_img_url,
        }) => [title, topic, author, body, created_at, votes, article_img_url]
      )
    );

    const { rows: articleRows } = await db.query(insertArticlesQueryStr);

    const articleIdLookup = createRef(articleRows, "title", "article_id");
    const formattedCommentData = formatComments(commentData, articleIdLookup);

    const insertCommentsQueryStr = format(
      "INSERT INTO comments (body, author, article_id, votes, created_at) VALUES %L;",
      formattedCommentData.map(
        ({ body, author, article_id, votes = 0, created_at }) => [
          body,
          author,
          article_id,
          votes,
          created_at,
        ]
      )
    );
    await db.query(insertCommentsQueryStr);
  } catch (error) {}
};

module.exports = seed;
