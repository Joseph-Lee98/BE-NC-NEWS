const express = require("express");
const cors = require("cors");
const {
  handleCustomErrors,
  notFoundHandler,
  handleServerErrors,
} = require("./middleware/errorHandling.js");
const app = express();
app.use(cors());
const apiRouter = require("./routes/api-router.js");
app.use(express.json());
app.use("/api", apiRouter);
app.all("*", notFoundHandler);
app.use(handleCustomErrors);
app.use(handleServerErrors);
module.exports = app;
