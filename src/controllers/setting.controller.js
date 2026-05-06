const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
};

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
