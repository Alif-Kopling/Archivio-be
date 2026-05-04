const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const auth = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.get('/', auth, settingController.getSettings);
router.put('/', auth, isAdmin, settingController.updateSetting);

module.exports = router;
