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

      if (!user) {
        // console.log("User not found");
        return res.status(401).json({ message: "User not found" });
      }

      if (user.deleted_at) {
        // console.log("Account deleted");
        return res.status(403).json({ message: "Account deleted" });
      }

      // Check if the user has the required role
      if (!rolesHierarchy[requiredRole].includes(decoded.role)) {
        // console.log("Forbidden due to role");
        return res.status(403).json({ message: "Forbidden" });
      }

      // Check if the route has a username parameter and match it
      const { username } = req.params;

      let isUserPresent;

      if (username) {
        isUserPresent = await db.query(
          "SELECT * FROM users WHERE username = $1",
          [username]
        );
      }

      if (decoded.role === "admin" && username && !isUserPresent.rowCount) {
        return res.status(401).send({ message: "User not found" });
      }

      if (
        decoded.role === "admin" &&
        username &&
        isUserPresent.rows[0]?.deleted_at
      ) {
        return res.status(401).send({ message: "Account deleted" });
      }

      if (
        username &&
        username !== decoded.username &&
        decoded.role !== "admin"
      ) {
        // console.log("Forbidden due to username mismatch");
        return res.status(403).json({ message: "Forbidden" });
      }

      // console.log("Middleware passing");
      next();
    } catch (error) {
      // console.error("Authentication error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

exports.authenticateUserForUserInformation = () => {
  return async (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    try {
      let decoded;
      // Verify the token, if token is present
      if (token) {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to the request object
        // Check if the account is deleted

        const userDeletedResult = await db.query(
          "SELECT * FROM users WHERE username = $1",
          [decoded.username]
        );

        const user = userDeletedResult.rows[0];

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        if (user.deleted_at) {
          return res.status(403).json({ message: "Account deleted" });
        }
      }

      // Check if the route has a username parameter and match it
      const { username } = req.params;

      // Check if the account is deleted

      const queriedUserDeletedResult = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      const queriedUser = queriedUserDeletedResult.rows[0];

      if (!queriedUser) {
        return res.status(401).json({ message: "User not found" });
      }

      if (queriedUser.deleted_at) {
        return res.status(403).json({ message: "Account deleted" });
      }

      const isPrivate = await db.query(
        "SELECT is_private FROM users WHERE username = $1",
        [username]
      );

      const queriedIsPrivate = isPrivate.rows[0].is_private;

      if (decoded) {
        if (
          queriedIsPrivate &&
          decoded.role !== "admin" &&
          decoded.username !== username
        ) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else if (queriedIsPrivate) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      console.error(error);
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
