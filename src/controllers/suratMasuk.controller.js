const path = require("path");
const fs = require("fs");
const suratMasukService = require("../services/suratMasuk.service");
const { getInitialStatus, normalizeDocumentDate, sanitizeDocumentUpdate } = require("../utils/documentStatus");
const { getDownloadFileNameFromPath } = require("../utils/fileName");
const { getBulkFieldValue } = require("../utils/bulkUploadFields");

/**
 * Retrieves all incoming letters.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy, sortOrder, status } = req.query;

    const data = await suratMasukService.getAll({
      search,
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
      status,
    });

    res.json(data);
  } catch (err) {
    console.error("Surat Masuk Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Creates a new incoming letter.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
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

    const data = await suratMasukService.create({
      title,
      sender,
      documentDate,
      filePath,
      status,
      createdBy: userId,
    });

    res.json(data);
  } catch (err) {
    console.error("Surat Masuk Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Creates multiple incoming letters via bulk upload.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createBulk = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const status = getInitialStatus(role);
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ error: "At least one document file is required." });
    }

    const results = [];
    const errors = [];

    for (const [index, file] of files.entries()) {
      try {
        const title = getBulkFieldValue(req.body, "title", file, index, file.originalname);
        const sender = getBulkFieldValue(req.body, "sender", file, index);
        const documentDate = normalizeDocumentDate(
          getBulkFieldValue(req.body, "documentDate", file, index),
        );

        if (!sender || !documentDate) {
          errors.push({ file: file.originalname, error: "Sender and document date are required." });
          continue;
        }

        const data = await suratMasukService.create({
          title: title.trim(),
          sender: sender.trim(),
          documentDate,
          filePath: file.path,
          status,
          createdBy: userId,
        });

        results.push(data);
      } catch (err) {
        errors.push({ file: file.originalname, error: err.message });
      }
    }

    res.json({ data: results, errors, total: files.length, success: results.length });
  } catch (err) {
    console.error("Surat Masuk Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Updates an incoming letter by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate = sanitizeDocumentUpdate(req.body);

    if (!Object.keys(dataToUpdate).length) {
      return res.status(400).json({ error: "No valid data provided for update." });
    }

    const existingDocument = await suratMasukService.getById(id);
    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found." });
    }

    const data = await suratMasukService.update(id, dataToUpdate);
    res.json(data);
  } catch (err) {
    console.error("Surat Masuk Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Updates an incoming letter's status.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const dataToUpdate = sanitizeDocumentUpdate(req.body);

    if (!dataToUpdate.status) {
      return res.status(400).json({ error: "New status must be provided." });
    }

    if (role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: "Access denied. Only admin can change document status." });
    }

    const existingDocument = await suratMasukService.getById(id);
    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found." });
    }

    const updatedDocument = await suratMasukService.update(id, { status: dataToUpdate.status });
    res.json({ message: "Document status updated successfully.", data: updatedDocument });

  } catch (err) {
    console.error("Surat Masuk Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Approves an incoming letter.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.approve = async (req, res) => {
  req.body = { ...req.body, status: "final" };
  return exports.updateStatus(req, res);
};

/**
 * Rejects an incoming letter.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.reject = async (req, res) => {
  req.body = { ...req.body, status: "rejected" };
  return exports.updateStatus(req, res);
};

/**
 * Removes an incoming letter and its file.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await suratMasukService.getById(id);

    if (!document) {
      return res.status(404).json({ error: "Archive not found" });
    }

    await suratMasukService.remove(id);

    const absolutePath = path.join(__dirname, "../../", document.filePath);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    res.json({ message: "Archive and its physical file successfully removed." });
  } catch (err) {
    console.error("Surat Masuk Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Downloads an incoming letter file.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.download = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await suratMasukService.getById(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    let finalPath = document.filePath;
    if (!finalPath.includes("surat-masuk")) {
      const fileName = path.basename(finalPath);
      finalPath = path.join("uploads/surat-masuk", fileName);
    }

    const absolutePath = path.join(__dirname, "../../", finalPath);
    res.download(absolutePath, getDownloadFileNameFromPath(finalPath, document.title || "document.pdf"));
  } catch (err) {
    console.error("Surat Masuk Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
