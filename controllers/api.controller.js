exports.getEndpoints = (req, res, next) => {
  try {
    const endpoints = require("../endpoints.json");
    res.status(200).send({ endpoints });
  } catch (err) {
    next(err);
  }
};
