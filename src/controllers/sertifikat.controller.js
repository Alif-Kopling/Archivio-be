const path = require("path");
const fs = require("fs");
const sertifikatService = require("../services/sertifikat.service");
const { getInitialStatus, sanitizeDocumentUpdate } = require("../utils/documentStatus");
const { getDownloadFileNameFromPath } = require("../utils/fileName");

exports.getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const data = await sertifikatService.getAll({
      search,
      page: Number(page),
      limit: Number(limit),
    });

    res.json(data);
  } catch (err) {
    console.error("Sertifikat Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const filePath = req.file ? req.file.path : null;
    const { role, id: userId } = req.user;
    const status = getInitialStatus(role);

    const data = await sertifikatService.create({
      ...req.body,
      filePath,
      status,
      createdBy: userId,
    });

    res.json(data);
  } catch (err) {
    console.error("Sertifikat Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate = sanitizeDocumentUpdate(req.body);

    if (!Object.keys(dataToUpdate).length) {
      return res.status(400).json({ error: "No valid data provided for update." });
    }

    const existingDocument = await sertifikatService.getById(id);
    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found." });
    }

    const data = await sertifikatService.update(id, dataToUpdate);
    res.json(data);
  } catch (err) {
    console.error("Sertifikat Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const dataToUpdate = sanitizeDocumentUpdate(req.body);

    if (!dataToUpdate.status) {
      return res.status(400).json({ error: "New status must be provided." });
    }

    if (role.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Access denied. Only admin can change document status." });
    }

    const existingDocument = await sertifikatService.getById(id);
    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found." });
    }

    const updatedDocument = await sertifikatService.update(id, { status: dataToUpdate.status });
    res.json({ message: "Document status updated successfully.", data: updatedDocument });
  } catch (err) {
    console.error("Sertifikat Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.approve = async (req, res) => {
  req.body = { ...req.body, status: "final" };
  return exports.updateStatus(req, res);
};

exports.reject = async (req, res) => {
  req.body = { ...req.body, status: "rejected" };
  return exports.updateStatus(req, res);
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await sertifikatService.getById(id);

    if (!document) {
      return res.status(404).json({ error: "Archive not found" });
    }

    await sertifikatService.remove(id);

    const absolutePath = path.join(__dirname, "../../", document.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    res.json({ message: "Certificate archive successfully destroyed! 🗑️💥" });
  } catch (err) {
    console.error("Sertifikat Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.download = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await sertifikatService.getById(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    let finalPath = document.filePath;
    if (!finalPath.includes("sertifikat")) {
      const fileName = path.basename(finalPath);
      finalPath = path.join("uploads/sertifikat", fileName);
    }

    const absolutePath = path.join(__dirname, "../../", finalPath);
    res.download(absolutePath, getDownloadFileNameFromPath(finalPath, document.title || "certificate.pdf"));
  } catch (err) {
    console.error("Sertifikat Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
