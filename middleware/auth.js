const jwt = require("jsonwebtoken");
const db = require("../db/connection");

const rolesHierarchy = {
  user: ["user", "admin"],
  admin: ["admin"],
};

exports.authenticateUser = (requiredRole) => {
  return async (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user info to the request object

      // Check if the account is deleted
      const userDeletedResult = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [decoded.username]
      );

      const user = userDeletedResult.rows[0];

      if (!Object.keys(user).length) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.deleted_at) {
        return res.status(403).json({ message: "Account deleted" });
      }

      // Check if the user has the required role
      if (!rolesHierarchy[requiredRole].includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Check if the route has a username parameter and match it
      const { username } = req.params;
      if (
        username &&
        username !== decoded.username &&
        decoded.role !== "admin"
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
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
