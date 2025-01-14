const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Валидация для регистрации
const registerValidators = [
  body('user_name').trim().escape(),
  body('user_mail')
    .trim()
    .isEmail()
    .withMessage('Некорректный email')
    .customSanitizer((value) => value.toLowerCase()),
  body('user_password').isLength({ min: 6 }).escape(),
];

// Валидация для входа
const loginValidators = [
  body('user_mail')
    .trim()
    .isEmail()
    .withMessage('Некорректный email')
    .customSanitizer((value) => value.toLowerCase()),
  body('user_password').isLength({ min: 6 }).escape(),
];

// Маршрут для отображения формы регистрации
router.get('/register', authController.getRegisterForm);

// Маршрут для обработки регистрации
router.post('/register', registerValidators, authController.registerUser);

// Маршрут для отображения формы входа
router.get('/login', authController.getLoginForm);

// Маршрут для обработки входа
router.post('/login', loginValidators, authController.loginUser);



module.exports = router;
