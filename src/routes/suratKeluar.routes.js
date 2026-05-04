const express = require("express");
const router = express.Router();

const suratKeluarController = require("../controllers/suratKeluar.controller");
const upload = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");
const { role } = require("../middlewares/role.middleware");

router.use(auth);

router.get("/", suratKeluarController.getAll);
router.get("/download/:id", suratKeluarController.download);
router.post("/send-email", role(["admin", "staff"]), suratKeluarController.sendEmail);
router.post("/:id/send-email", role(["admin", "staff"]), suratKeluarController.sendEmail);

router.post("/", role(["admin", "staff"]), upload.single("file"), suratKeluarController.create);

// Update umum, bisa untuk field lain selain status
router.put("/:id", role(["admin"]), suratKeluarController.update);

// Endpoint khusus untuk update status oleh Admin
router.patch("/:id/status", role(["admin"]), suratKeluarController.updateStatus);
router.patch("/:id/approve", role(["admin"]), suratKeluarController.approve);
router.patch("/:id/reject", role(["admin"]), suratKeluarController.reject);

router.delete("/:id", role(["admin"]), suratKeluarController.remove);

module.exports = router;
