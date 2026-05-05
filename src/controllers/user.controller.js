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

    // 1. Cek dulu usernya ada ngga
    const user = await userService.getById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Cek apakah user punya dokumen (Foreign Key constraint)
    if (user._count && user._count.documents > 0) {
      return res.status(400).json({ 
        error: `Cannot delete user "${user.name}" because they have ${user._count.documents} associated documents. Please delete the documents first.` 
      });
    }

    await userService.remove(id);
    res.json({ message: "User successfully deleted by Admin! ✋🛑" });
  } catch (err) {
    console.error("User Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
