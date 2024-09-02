const {
  createUser,
  verifyUser,
  removeUser,
  fetchUser,
  updateUser,
  fetchUsers,
} = require("../models/users.model");
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
      { expiresIn: "5m" }
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
    console.log("Environment:", process.env.NODE_ENV); // Log the environment
    console.log("JWT Secret:", process.env.JWT_SECRET); // Log the JWT secret being used

    const user = await verifyUser(username, password);
    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
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
    console.error("Error during login:", error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  const { username } = req.params;
  try {
    await removeUser(username);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  const { username } = req.params;
  try {
    const userInformation = await fetchUser(username);
    res.status(200).send(userInformation);
  } catch (error) {
    next(error);
  }
};

exports.patchUser = async (req, res, next) => {
  const { updatedUsername, name, password, avatar_url, is_private } = req.body;

  // Check if all specified fields are undefined
  const areAllFieldsUndefined = [
    updatedUsername,
    name,
    password,
    avatar_url,
    is_private,
  ].every((field) => field === undefined);

  if (areAllFieldsUndefined) {
    return res.status(400).json({
      message:
        "Request body must contain at least one of the following fields: username, name, password, avatar_url, is_private.",
    });
  }

  if (updatedUsername !== undefined) {
    if (typeof updatedUsername !== "string")
      return res
        .status(400)
        .send({ message: "Username must be in a valid format" });
    if (updatedUsername.length === 0 || updatedUsername.trim().length === 0)
      return res
        .status(400)
        .send({ message: "Username must not be empty text" });
    if (updatedUsername.length > 20)
      return res.status(400).send({
        message: "Username must not be greater than 20 characters in length",
      });
  }

  if (password !== undefined) {
    if (typeof password !== "string")
      return res
        .status(400)
        .send({ message: "Password must be in a valid format" });
    if (password.length === 0 || password.trim().length === 0)
      return res
        .status(400)
        .send({ message: "Password must not be empty text" });
    if (password.length > 30)
      return res.status(400).send({
        message: "Password must not be greater than 30 characters in length",
      });
  }

  if (name !== undefined) {
    if (typeof name !== "string")
      return res
        .status(400)
        .send({ message: "Name must be in a valid format" });
    if (name.length === 0 || name.trim().length === 0)
      return res.status(400).send({ message: "Name must not be empty text" });
    if (name.length > 30)
      return res.status(400).send({
        message: "Name must not be greater than 30 characters in length",
      });
  }

  if (avatar_url !== undefined) {
    if (typeof avatar_url !== "string")
      return res
        .status(400)
        .send({ message: "URL to avatar image must be in a valid format" });
    if (avatar_url.length === 0 || avatar_url.trim().length === 0)
      return res
        .status(400)
        .send({ message: "URL to avatar image must not be empty text" });
  }

  if (is_private !== undefined && typeof is_private !== "boolean") {
    return res
      .status(400)
      .send({ message: "is_private must be in a valid format" });
  }

  const { username } = req.params;

  try {
    const updatedUser = await updateUser(
      username,
      updatedUsername,
      name,
      password,
      avatar_url,
      is_private
    );
    res.status(200).send(updatedUser);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const usersInformation = await fetchUsers();
    res.status(200).send(usersInformation);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
