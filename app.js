const express = require("express");
const {
  handleCustomErrors,
  notFoundHandler,
  handleServerErrors,
} = require("./middleware/errorHandling.js");
const app = express();
const apiRouter = require("./routes/api-router.js");
app.use(express.json());
app.use("/api", apiRouter);
app.all("*", notFoundHandler);
app.use(handleCustomErrors);
app.use(handleServerErrors);
module.exports = app;
