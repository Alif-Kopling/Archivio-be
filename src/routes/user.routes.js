const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const { role } = require("../middlewares/role.middleware");

// admin-only: user management
router.use(auth);
router.use(role(["admin"]));

router.get("/", userController.getAll);
router.post("/", userController.create);
router.put("/:id", userController.update);
router.delete("/:id", userController.remove);

module.exports = router;
