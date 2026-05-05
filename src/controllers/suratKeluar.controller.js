const path = require("path");
const fs = require("fs");
const suratKeluarService = require("../services/suratKeluar.service");
const { sendDocumentEmail } = require("../services/email.service");
const { getInitialStatus, normalizeDocumentDate, sanitizeDocumentUpdate } = require("../utils/documentStatus");
const { getDownloadFileNameFromPath } = require("../utils/fileName");

exports.getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const data = await suratKeluarService.getAll({
      search,
      page: Number(page),
      limit: Number(limit),
    });

    res.json(data);
  } catch (err) {
    console.error("Surat Keluar Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const filePath = req.file ? req.file.path : null;
    const { id: userId, role } = req.user;
    const status = getInitialStatus(role);
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const sender = typeof req.body.sender === "string" ? req.body.sender.trim() : "";
    const documentDate = normalizeDocumentDate(req.body.documentDate);

    if (!filePath) {
      return res.status(400).json({ error: "Document file is required." });
    }

    if (!title || !sender || !documentDate) {
      return res.status(400).json({
        error: "Title, sender, and document date are required.",
      });
    }

    const data = await suratKeluarService.create({
      title,
      sender,
      documentDate,
      filePath,
      status,
      createdBy: userId,
    });

    res.json(data);
  } catch (err) {
    console.error("Surat Keluar Controller Error:", err);
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

    const existingDocument = await suratKeluarService.getById(id);
    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found." });
    }

    const data = await suratKeluarService.update(id, dataToUpdate);
    res.json(data);
  } catch (err) {
    console.error("Surat Keluar Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Endpoint khusus untuk update status oleh Admin
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const dataToUpdate = sanitizeDocumentUpdate(req.body);

    if (!dataToUpdate.status) {
      return res.status(400).json({ error: "New status must be provided." });
    }

    // Pastikan hanya admin yang bisa mengubah status
    if (role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: "Access denied. Only admin can change document status." });
    }

    const existingDocument = await suratKeluarService.getById(id);
    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found." });
    }

    const updatedDocument = await suratKeluarService.update(id, { status: dataToUpdate.status });
    res.json({ message: "Document status updated successfully.", data: updatedDocument });

  } catch (err) {
    console.error("Surat Keluar Controller Error:", err);
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
    const document = await suratKeluarService.getById(id);

    if (!document) {
      return res.status(404).json({ error: "Archive not found" });
    }

    await suratKeluarService.remove(id);

    const absolutePath = path.join(__dirname, "../../", document.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    res.json({ message: "Outgoing Mail archive successfully destroyed! 🗑️💥" });
  } catch (err) {
    console.error("Surat Keluar Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.download = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await suratKeluarService.getById(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    let finalPath = document.filePath;
    if (!finalPath.includes("surat-keluar")) {
      const fileName = path.basename(finalPath);
      finalPath = path.join("uploads/surat-keluar", fileName);
    }

    const absolutePath = path.join(__dirname, "../../", finalPath);
    res.download(absolutePath, getDownloadFileNameFromPath(finalPath, document.title || "document.pdf"));
  } catch (err) {
    console.error("Surat Keluar Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    const { to, subject, message } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Document ID must be provided.",
      });
    }

    if (!to || typeof to !== "string") {
      return res.status(400).json({
        success: false,
        error: "Recipient email must be provided.",
      });
    }

    const document = await suratKeluarService.getById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found.",
      });
    }

    const normalizedStatus = document.status?.toLowerCase();
    if (normalizedStatus !== "final" && normalizedStatus !== "approved") {
      return res.status(400).json({
        success: false,
        error: "Document can only be sent after admin approval.",
      });
    }

    let finalPath = document.filePath;
    if (!finalPath.includes("surat-keluar")) {
      const fileName = path.basename(finalPath);
      finalPath = path.join("uploads/surat-keluar", fileName);
    }

    const absolutePath = path.join(__dirname, "../../", finalPath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        error: "Document file not found on server.",
      });
    }

    const info = await sendDocumentEmail({
      to: to.trim(),
      subject: typeof subject === "string" && subject.trim() ? subject.trim() : `Document: ${document.title}`,
      text: typeof message === "string" && message.trim()
        ? message.trim()
        : `Attached is the document ${document.title}.`,
      attachmentPath: absolutePath,
      attachmentName: getDownloadFileNameFromPath(finalPath, document.title || "document.pdf"),
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      info,
    });
  } catch (err) {
    console.error("[surat-keluar][send-email] failed", {
      id: req.params.id || req.body.id,
      error: err.message,
    });

    const errorMessage = err.message || "Failed to send email.";
    const lowered = errorMessage.toLowerCase();
    
    if (lowered.includes("not found") || lowered.includes("tidak ditemukan")) {
      return res.status(404).json({ success: false, error: "Document or file not found." });
    }
    
    if (lowered.includes("invalid") || lowered.includes("tidak valid") || lowered.includes("incomplete") || lowered.includes("empty")) {
      return res.status(400).json({ success: false, error: "Invalid request data." });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error while sending email.",
    });
  }
};
