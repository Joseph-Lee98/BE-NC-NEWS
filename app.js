const express = require("express");
const {
  handleCustomErrors,
  notFoundHandler,
} = require("./middleware/errorHandling.js");
const app = express();
const apiRouter = require("./routes/api-router.js");
app.use(express.json());
app.use("/api", apiRouter);
app.all("*", notFoundHandler);
app.use(handleCustomErrors);
module.exports = app;
