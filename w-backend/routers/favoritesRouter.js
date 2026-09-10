const express = require('express');
const router = express.Router();
const favoritesController = require('../controller/favoritesController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, favoritesController.getFavorites);
router.post('/', authMiddleware, favoritesController.addFavorite);
router.post('/toggle', authMiddleware, favoritesController.toggleFavorite);
router.delete('/:id', authMiddleware, favoritesController.removeFavorite);

module.exports = router;
