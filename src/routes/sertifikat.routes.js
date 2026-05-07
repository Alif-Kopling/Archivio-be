const express = require("express");
const router = express.Router();

const sertifikatController = require("../controllers/sertifikat.controller");
const { uploadSingle, uploadBulk } = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");
const { role } = require("../middlewares/role.middleware");

router.use(auth);

router.get("/", sertifikatController.getAll);
router.get("/download/:id", sertifikatController.download);

router.post("/", role(["admin", "staff"]), uploadSingle, sertifikatController.create);
router.post("/bulk", role(["admin", "staff"]), uploadBulk, sertifikatController.createBulk);

router.patch("/:id/status", role(["admin"]), sertifikatController.updateStatus);
router.patch("/:id/approve", role(["admin"]), sertifikatController.approve);
router.patch("/:id/reject", role(["admin"]), sertifikatController.reject);
router.put("/:id", role(["admin"]), sertifikatController.update);
router.delete("/:id", role(["admin"]), sertifikatController.remove);

module.exports = router;
