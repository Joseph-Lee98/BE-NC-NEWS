const { getEndpoints } = require("../controllers/api.controller.js");
const apiRouter = require("express").Router();
apiRouter.route("/").get(getEndpoints);

const topicsRouter = require("./topics-router.js");
const usersRouter = require("./users-router.js");
const commentsRouter = require("./comments-router.js");
const articlesRouter = require("./articles-router.js");

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/articles", articlesRouter);

module.exports = apiRouter;
