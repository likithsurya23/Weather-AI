const express = require('express');
const router = express.Router();
const weatherController = require('../controller/weatherController');

router.get('/', weatherController.getWeather);
router.get('/search', weatherController.searchLocations);
router.get('/map', weatherController.getMapData);

module.exports = router;
