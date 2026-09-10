const express = require('express');
const router = express.Router();
const alertsController = require('../controller/alertsController');
const newsController = require('../controller/newsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/disaster-news', newsController.getDisasterNews);
router.get('/', alertsController.getAlerts);
router.post('/:id/dismiss', alertsController.dismissAlert);
router.put('/settings', authMiddleware, alertsController.updateSettings);

module.exports = router;
