const { createUser, verifyUser } = require("../models/users.model");
const jwt = require("jsonwebtoken");

exports.registerUser = (req, res, next) => {};

exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  if (username === undefined || password === undefined) {
    return res
      .status(400)
      .send({ message: "Username and password are required" });
  }
  try {
    const user = await verifyUser(username, password);
    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).send({
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
