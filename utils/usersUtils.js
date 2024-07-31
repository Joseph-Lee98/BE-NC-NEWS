const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = { generateToken };
