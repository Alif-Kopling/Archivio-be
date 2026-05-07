const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const auth = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.get('/', auth, settingController.getSettings);
router.get('/stats', auth, settingController.getStorageStats);
router.get('/trash', auth, isAdmin, settingController.getTrashStats);
router.delete('/trash/rejected', auth, isAdmin, settingController.emptyRejectedTrash);
router.put('/', auth, isAdmin, settingController.updateSetting);

module.exports = router;
