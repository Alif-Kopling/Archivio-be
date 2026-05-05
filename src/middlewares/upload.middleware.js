const multer = require("multer");
const path = require("path");

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

const fileFilter = (req, file, cb) => {
  // Ekstensi yang diizinkan (case insensitive)
  const allowedExtensions = /pdf|doc|docx|jpg|jpeg|png/;
  // MIME types yang diizinkan
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png"
  ];

  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Hanya file dokumen (PDF/DOCX) dan gambar (JPG/PNG) yang diizinkan!"));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batasi maksimal 5MB
  }
});

module.exports = upload;