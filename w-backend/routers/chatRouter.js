const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/history', authMiddleware, chatController.getChatHistory);
router.post('/message', authMiddleware, chatController.sendMessage);
router.delete('/history', authMiddleware, chatController.clearHistory);

module.exports = router;
