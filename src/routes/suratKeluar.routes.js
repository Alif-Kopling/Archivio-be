const express = require("express");
const router = express.Router();

const suratKeluarController = require("../controllers/suratKeluar.controller");
const { uploadSingle, uploadBulk } = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");
const { role } = require("../middlewares/role.middleware");

router.use(auth);

router.get("/", suratKeluarController.getAll);
router.get("/download/:id", suratKeluarController.download);
router.post("/send-email", role(["admin", "staff"]), suratKeluarController.sendEmail);
router.post("/:id/send-email", role(["admin", "staff"]), suratKeluarController.sendEmail);

router.post("/", role(["admin", "staff"]), uploadSingle, suratKeluarController.create);
router.post("/bulk", role(["admin", "staff"]), uploadBulk, suratKeluarController.createBulk);

// general update, for fields other than status
router.put("/:id", role(["admin"]), suratKeluarController.update);

// admin-only status endpoints
router.patch("/:id/status", role(["admin"]), suratKeluarController.updateStatus);
router.patch("/:id/approve", role(["admin"]), suratKeluarController.approve);
router.patch("/:id/reject", role(["admin"]), suratKeluarController.reject);

router.delete("/:id", role(["admin"]), suratKeluarController.remove);

module.exports = router;
