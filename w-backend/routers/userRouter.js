const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);
router.delete('/account', userController.deleteAccount);

module.exports = router;
