const multer = require("multer");
const path = require("path");

const MIME_TYPES_BY_FOLDER = {
  "surat-masuk": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "surat-keluar": [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  sertifikat: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ],
};

const EXTENSIONS_BY_FOLDER = {
  "surat-masuk": [".pdf", ".doc", ".docx"],
  "surat-keluar": [".pdf", ".doc", ".docx"],
  sertifikat: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
};

const getUploadFolder = (req) => {
  let folder = "surat-masuk";

  if (req.baseUrl.includes("surat-keluar")) folder = "surat-keluar";
  if (req.baseUrl.includes("sertifikat")) folder = "sertifikat";

  return folder;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getUploadFolder(req);

    cb(null, `uploads/${folder}/`);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const folder = getUploadFolder(req);
  const allowedExtensions = EXTENSIONS_BY_FOLDER[folder] || EXTENSIONS_BY_FOLDER["surat-masuk"];
  const allowedMimeTypes = MIME_TYPES_BY_FOLDER[folder] || MIME_TYPES_BY_FOLDER["surat-masuk"];

  const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Hanya file dokumen (PDF/DOCX) dan gambar (JPG/PNG) yang diizinkan!"));
  }
};

const uploadSingle = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batasi maksimal 5MB
  }
}).single("file");

const uploadBulk = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batasi maksimal 5MB per file
  }
}).array("files", 20); // Max 20 files

module.exports = { uploadSingle, uploadBulk };
