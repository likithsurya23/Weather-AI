const express = require('express');
const router = express.Router();
const alertsController = require('../controller/alertsController');
const newsController = require('../controller/newsController');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');

router.get('/disaster-news', newsController.getDisasterNews);
router.get('/', optionalAuth, alertsController.getAlerts);
router.post('/:id/dismiss', optionalAuth, alertsController.dismissAlert);
router.put('/settings', requireAuth, alertsController.updateSettings);

module.exports = router;
