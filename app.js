const express = require("express");
const { handleCustomErrors } = require("./middleware/errorHandling.js");
const app = express();
const apiRouter = require("./routes/api-router.js");
app.use(express.json());
app.use("/api", apiRouter);
app.use(handleCustomErrors);
module.exports = app;
