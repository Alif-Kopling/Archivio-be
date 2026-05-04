const express = require("express");
const router = express.Router();

const suratMasukController = require("../controllers/suratMasuk.controller");
const upload = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");
const { role } = require("../middlewares/role.middleware");

// Semua rute di bawah ini butuh login (auth)
router.use(auth);

router.get("/", suratMasukController.getAll);
router.get("/download/:id", suratMasukController.download);

// Staff bisa upload draf, Admin bisa upload final (tapi kita override jadi draft dulu)
router.post("/", role(["admin", "staff"]), upload.single("file"), suratMasukController.create);

// Cuma Admin yang bisa update status atau hapus arsip (Kelola semua arsip)
// Menggunakan PATCH untuk update status agar lebih semantik
router.patch("/:id/status", role(["admin"]), suratMasukController.updateStatus); // Membuat endpoint khusus update status
router.patch("/:id/approve", role(["admin"]), suratMasukController.approve);
router.patch("/:id/reject", role(["admin"]), suratMasukController.reject);
router.put("/:id", role(["admin"]), suratMasukController.update); // Tetap sediakan PUT untuk update umum jika ada field lain
router.delete("/:id", role(["admin"]), suratMasukController.remove);

module.exports = router;
