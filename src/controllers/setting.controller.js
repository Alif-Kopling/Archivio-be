const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Helper to remove a file from the filesystem.
 * @param {string} filePath - Path to the file.
 */
const removeDocumentFile = (filePath) => {
  if (typeof filePath !== "string" || !filePath.trim()) {
    return;
  }

  const absolutePath = path.join(__dirname, "../../", filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

/**
 * Retrieves all application settings.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
};

/**
 * Retrieves document storage statistics.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getStorageStats = async (req, res) => {
  try {
    const totalCount = await prisma.document.count();
    const storageLimitSetting = await prisma.setting.findUnique({ where: { key: 'storage_limit' } });
    const storageLimit = storageLimitSetting ? parseInt(storageLimitSetting.value) : 100;

    res.json({
      total: totalCount,
      limit: storageLimit
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve storage stats' });
  }
};

/**
 * Retrieves statistics of rejected documents.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getTrashStats = async (req, res) => {
  try {
    const rejectedCount = await prisma.document.count({
      where: {
        status: "rejected",
      },
    });

    res.json({
      rejected: rejectedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve trash stats" });
  }
};

/**
 * Permanently removes all rejected documents.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.emptyRejectedTrash = async (req, res) => {
  try {
    const rejectedDocuments = await prisma.document.findMany({
      where: {
        status: "rejected",
      },
      select: {
        id: true,
        filePath: true,
      },
    });

    for (const document of rejectedDocuments) {
      removeDocumentFile(document.filePath);
    }

    const result = await prisma.document.deleteMany({
      where: {
        status: "rejected",
      },
    });

    res.json({
      message: "Rejected documents permanently removed.",
      deleted: result.count,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to empty rejected trash" });
  }
};

/**
 * Updates or creates an application setting.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateSetting = async (req, res) => {
  const { key, value } = req.body;
  try {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
