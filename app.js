var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var csurf = require('csurf');
var dotenv = require('dotenv');
var xss = require('xss-clean');

dotenv.config();

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const locationsRouter = require('./routes/locations');
const reservationsRouter = require('./routes/reservations');

var app = express();

// Подключение MongoDB
var mongoose = require("mongoose");
var mongoDB = "mongodb://127.0.0.1:27017/reservation_system";

mongoose.connect(mongoDB).then(
  () => console.log("MongoDB connected successfully!"),
  (err) => console.error("MongoDB connection error:", err)
);
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));


// Настройка view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
app.use(logger('dev'));
app.use(xss());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Настройка сессий
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// CSRF защита
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// Передача CSRF-токена в шаблоны
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Маршруты
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/locations', locationsRouter);
app.use('/reservations', reservationsRouter);

// Обработка ошибок CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ error: 'Недействительный или отсутствующий CSRF-токен.' });
  } else {
    next(err);
  }
});

// Обработка 404 ошибок
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Устанавливаем переменные locals, доступные в шаблоне
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Рендерим страницу ошибки
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
