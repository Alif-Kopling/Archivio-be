const express = require("express");
const router = express.Router();

const sertifikatController = require("../controllers/sertifikat.controller");
const upload = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");
const { role } = require("../middlewares/role.middleware");

router.use(auth);

router.get("/", sertifikatController.getAll);
router.get("/download/:id", sertifikatController.download);

router.post("/", role(["admin", "staff"]), upload.single("file"), sertifikatController.create);

router.patch("/:id/status", role(["admin"]), sertifikatController.updateStatus);
router.patch("/:id/approve", role(["admin"]), sertifikatController.approve);
router.patch("/:id/reject", role(["admin"]), sertifikatController.reject);
router.put("/:id", role(["admin"]), sertifikatController.update);
router.delete("/:id", role(["admin"]), sertifikatController.remove);

module.exports = router;
