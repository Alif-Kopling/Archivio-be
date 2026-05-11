const userService = require("../services/user.service");

/**
 * Retrieves all users.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
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

/**
 * Creates a new user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.create = async (req, res) => {
  try {
    const data = await userService.create(req.body);
    res.json(data);
  } catch (err) {
    console.error("User Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Updates a user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
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

/**
 * Deletes a user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._count && user._count.documents > 0) {
      return res.status(400).json({ 
        error: `Cannot delete user "${user.name}" because they have ${user._count.documents} associated documents.` 
      });
    }

    await userService.remove(id);
    res.json({ message: "User successfully deleted." });
  } catch (err) {
    console.error("User Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
