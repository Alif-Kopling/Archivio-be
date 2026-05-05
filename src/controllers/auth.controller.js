const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Pakai bcrypt.compare ya sayangg, biar sinkron sama password yang sudah di-hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Login failed: Password does not match");
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role.toUpperCase(),
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role.toUpperCase(),
      },
    });
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};