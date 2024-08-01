exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else next(err);
};

exports.notFoundHandler = (req, res) => {
  res.status(404).send({ message: "Route not found" });
};
