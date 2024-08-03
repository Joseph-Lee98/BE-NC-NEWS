const jwt = require("jsonwebtoken");
const db = require("../db/connection");

const rolesHierarchy = {
  user: ["user", "admin"],
  admin: ["admin"],
};

exports.checkRole = (role) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      if (!rolesHierarchy[role].includes(userRole)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

exports.checkUser = (req, res, next) => {
  const { username } = req.params;
  const userRole = req.user.role;

  if (req.user.username !== username && userRole !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

exports.preventLoggedInUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(); // No token, proceed to login
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    const error = new Error("Already logged in");
    error.status = 409;
    return next(error);
  } catch (error) {
    next(); // Invalid token, proceed to login
  }
};

exports.checkUserStatus = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = decoded;

    const result = await db.query(
      "SELECT deleted_at FROM users WHERE username = $1",
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).send({ message: "User not found" });
    }

    if (user.deleted_at) {
      return res.status(403).send({ message: "Account deleted" });
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
