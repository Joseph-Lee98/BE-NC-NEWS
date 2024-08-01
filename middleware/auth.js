const jwt = require("jsonwebtoken");

// Define role hierarchy
const rolesHierarchy = {
  user: ["user", "admin"],
  admin: ["admin"],
};

exports.checkRole = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      const userRole = decoded.role;

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
  const { username } = req.params; // Assumes the route has a `username` parameter
  const userRole = req.user.role; // req.user is already populated by checkRole

  // Check if the username in the token matches the one in the request parameters or if the user is an admin
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
