const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/preferences', authMiddleware, userController.getPreferences);
router.put('/preferences', authMiddleware, userController.updatePreferences);
router.delete('/account', authMiddleware, userController.deleteAccount);

module.exports = router;
