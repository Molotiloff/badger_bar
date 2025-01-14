const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Маршрут для отображения профиля пользователя
router.get('/', profileController.getUserProfile);

module.exports = router;
