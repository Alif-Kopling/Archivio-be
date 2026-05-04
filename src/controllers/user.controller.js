const userService = require("../services/user.service");

exports.getAll = async (req, res) => {
  try {
    const data = await userService.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await userService.create(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await userService.update(id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.remove(id);
    res.json({ message: "User successfully deleted by Admin! ✋🛑" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
