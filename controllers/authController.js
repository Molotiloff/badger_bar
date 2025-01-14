const bcrypt = require('bcrypt');
const User = require('../models/user');
const { validationResult } = require('express-validator');

/**
 * Отображает форму регистрации.
 */
exports.getRegisterForm = (req, res) => {
  res.render('auth_register', {
    title: 'Регистрация',
    csrfToken: req.csrfToken(),
    errors: [],
  });
};

/**
 * Обрабатывает регистрацию пользователя.
 */
exports.registerUser = async (req, res) => {
  try {
    console.log('Входящие данные для регистрации:', req.body);

    const errors = validationResult(req);
    console.log('Ошибки валидации:', errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).render('auth_register', {
        title: 'Регистрация',
        csrfToken: req.csrfToken(),
        errors: errors.array(),
      });
    }

    const { user_name, user_mail, user_password } = req.body;
    const normalizedEmail = user_mail.trim().toLowerCase();

    console.log(`Проверяем наличие пользователя с email: ${normalizedEmail}`);
    const existingUser = await User.findOne({ user_mail: normalizedEmail });
    console.log('Результат поиска пользователя:', existingUser);

    if (existingUser) {
      return res.status(400).render('auth_register', {
        title: 'Регистрация',
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Пользователь с таким email уже существует' }],
      });
    }

    console.log('Хешируем пароль...');
    const hashedPassword = await bcrypt.hash(user_password, 10);

    const newUser = new User({
      user_name,
      user_mail: normalizedEmail,
      user_password: hashedPassword,
    });
    await newUser.save();

    console.log('Пользователь успешно зарегистрирован:', newUser);

    // Передача успешного сообщения
    return res.status(201).render('auth_register', {
      title: 'Регистрация',
      csrfToken: req.csrfToken(),
      errors: [],
      success: 'Регистрация прошла успешно! Теперь вы можете забронировать столик.',
    });
  } catch (err) {
    console.error('Ошибка при регистрации пользователя:', err);
    res.status(500).render('auth_register', {
      title: 'Регистрация',
      csrfToken: req.csrfToken(),
      errors: [{ msg: 'Произошла ошибка при регистрации' }],
    });
  }
};

/**
 * GET /auth/login - Отображает форму входа.
 */
exports.getLoginForm = (req, res) => {
  res.render('auth_login', {
    title: 'Вход',
    csrfToken: req.csrfToken(),
    errors: [],
  });
};
exports.loginUser = async (req, res) => {
  try {
    console.log('Входящие данные для входа:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth_login', {
        title: 'Вход',
        csrfToken: req.csrfToken(),
        errors: errors.array(),
      });
    }

    const { user_mail, user_password } = req.body;
    const normalizedEmail = user_mail.trim().toLowerCase();

    // Ищем пользователя в базе данных
    const user = await User.findOne({ user_mail: normalizedEmail });
    if (!user) {
      return res.status(400).render('auth_login', {
        title: 'Вход',
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Неверный email или пароль' }],
      });
    }

    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return res.status(400).render('auth_login', {
        title: 'Вход',
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Неверный email или пароль' }],
      });
    }

    // Убедитесь, что `req.session` инициализирована
    if (req.session) {
      req.session.userId = user._id; // Сохраняем ID пользователя в сессии
      console.log(`Пользователь ${user.user_name} успешно вошёл.`);
      res.status(200).redirect('/profile'); // Перенаправляем на страницу профиля
    } else {
      console.error('Сессия не инициализирована.');
      res.status(500).render('auth_login', {
        title: 'Вход',
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Ошибка сервера. Попробуйте снова.' }],
      });
    }
  } catch (err) {
    console.error('Ошибка при входе пользователя:', err);
    res.status(500).render('auth_login', {
      title: 'Вход',
      csrfToken: req.csrfToken(),
      errors: [{ msg: 'Произошла ошибка при входе' }],
    });
  }
};
