const { createUser, verifyUser } = require("../models/users.model");
const jwt = require("jsonwebtoken");

exports.registerUser = (req, res, next) => {};

exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await verifyUser(username, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};
