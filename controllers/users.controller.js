const { createUser, verifyUser } = require("../models/users.model");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res, next) => {
  const { username, password, name, avatar_url } = req.body;
  if (username === undefined || password === undefined || name === undefined) {
    return res
      .status(400)
      .send({ message: "Username, password and name are required" });
  }
  if (typeof username !== "string")
    return res
      .status(400)
      .send({ message: "Username must be in a valid format" });
  if (typeof password !== "string")
    return res
      .status(400)
      .send({ message: "Password must be in a valid format" });
  if (typeof name !== "string")
    return res.status(400).send({ message: "Name must be in a valid format" });
  if (avatar_url && typeof avatar_url !== "string")
    return res
      .status(400)
      .send({ message: "URL to avatar image must be in a valid format" });
  if (username.length === 0)
    return res.status(400).send({ message: "Username must not be empty text" });
  if (password.length === 0)
    return res.status(400).send({ message: "Password must not be empty text" });
  if (name.length === 0)
    return res.status(400).send({ message: "Name must not be empty text" });
  if (avatar_url !== undefined && avatar_url.length === 0)
    return res
      .status(400)
      .send({ message: "URL to avatar image must not be empty text" });
  if (username.length > 20)
    return res.status(400).send({
      message: "Username must not be greater than 20 characters in length",
    });
  if (password.length > 30)
    return res.status(400).send({
      message: "Password must not be greater than 30 characters in length",
    });
  if (name.length > 30)
    return res.status(400).send({
      message: "Name must not be greater than 30 characters in length",
    });
  try {
    const user = await createUser(username, name, password, avatar_url);
    if (!user) return res.status(401).send({ message: "Registration failed" });
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).send({
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

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
        avatar_url: user.avatar_url,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
