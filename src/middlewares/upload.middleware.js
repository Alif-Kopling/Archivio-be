const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "surat-masuk"; // Default
    if (req.baseUrl.includes("surat-keluar")) folder = "surat-keluar";
    if (req.baseUrl.includes("sertifikat")) folder = "sertifikat";
    
    cb(null, `uploads/${folder}/`);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;