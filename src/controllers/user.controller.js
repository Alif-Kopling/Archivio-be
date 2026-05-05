const userService = require("../services/user.service");

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const data = await userService.getAll(search);
    res.json(data);
  } catch (err) {
    console.error("User Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await userService.create(req.body);
    res.json(data);
  } catch (err) {
    console.error("User Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await userService.update(id, req.body);
    res.json(data);
  } catch (err) {
    console.error("User Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.remove(id);
    res.json({ message: "User successfully deleted by Admin! ✋🛑" });
  } catch (err) {
    console.error("User Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
