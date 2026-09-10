const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/history', chatController.getChatHistory);
router.post('/message', chatController.sendMessage);
router.delete('/history', chatController.clearHistory);

module.exports = router;
