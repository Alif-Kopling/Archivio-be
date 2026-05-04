const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "token tidak ada" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "token tidak valid" });
  }
};

// Support both import styles
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;