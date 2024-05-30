\c nc_news_test

SELECT articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) AS comment_count
FROM articles LEFT JOIN comments
ON articles.article_id = comments.article_id
WHERE topic = 'mitch'
GROUP BY articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url ORDER BY articles.created_at DESC