const express = require('express');
const router = express.Router();
const favoritesController = require('../controller/favoritesController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', favoritesController.getFavorites);
router.post('/', favoritesController.addFavorite);
router.post('/toggle', favoritesController.toggleFavorite);
router.delete('/:id', favoritesController.removeFavorite);

module.exports = router;
