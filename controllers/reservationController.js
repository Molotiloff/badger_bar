const bcrypt = require('bcrypt');
const User = require('../models/user');
const Table = require('../models/table');
const Reservation = require('../models/reservation');

const WORKING_HOURS = {
  weekdays: { start: 18, end: 1 }, // С понедельника по четверг
  weekend: { start: 18, end: 6 }, // Пятница, суббота, воскресенье
};

/**
 * Рассчитывает время окончания работы бара для данной даты.
 */
function calculateClosingTime(date) {
  const day = date.getDay();
  const isWeekend = day === 5 || day === 6 || day === 0;
  const { start, end } = isWeekend ? WORKING_HOURS.weekend : WORKING_HOURS.weekdays;

  const closingTime = new Date(date);
  closingTime.setHours(end === 6 ? 6 : end, 0, 0, 0);
  if (end < start) {
    closingTime.setDate(closingTime.getDate() + 1);
  }

  return closingTime;
}

const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

const transporter = nodemailer.createTransport(emailConfig);

/**
 * Отправка письма с подтверждением бронирования.
 */
async function sendReservationEmail(to, reservationDetails) {
  const mailOptions = {
    from: '"Bagder Bar" <badger.bar@mail.ru>',
    to,
    subject: 'Подтверждение бронирования',
    text: `Здравствуйте, ${reservationDetails.name}!

Ваше бронирование подтверждено:
- Локация: ${reservationDetails.location}
- Дата и время: ${reservationDetails.date}
- Количество гостей: ${reservationDetails.guests}

Ждём вас в баре!
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Письмо успешно отправлено:', to);
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
  }
}

/**
 * Выбирает случайный доступный стол в указанной локации.
 */
async function findAvailableTable(location, reservationDate) {
  const tables = await Table.find({ table_location: location });
  for (const table of tables) {
    const conflictingReservations = await Reservation.find({
      table: table._id,
      reservation_date: { $gte: reservationDate },
    });
    if (!conflictingReservations.length) {
      return table; // Возвращаем первый свободный стол
    }
  }
  return null; // Нет доступных столов
}

/**
 * Показывает форму бронирования.
 */
exports.getReservationForm = (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).render('reserve_location_form', {
      title: 'Ошибка',
      errors: [{ msg: 'Не выбрана локация' }],
    });
  }

  res.render('reserve_location_form', {
    title: `Бронирование: ${location}`,
    location,
    csrfToken: req.csrfToken(),
    errors: [],
  });
};

/**
 * Обрабатывает создание бронирования.
 */
exports.createReservation = async (req, res) => {
  try {
    const {
      user_mail,
      user_password,
      reservation_date,
      number_of_guests,
      send_email, // Получаем флаг из формы
    } = req.body;

    const location = req.body.location;
    const reservationDate = new Date(reservation_date);

    // Нормализация email
    const normalizedEmail = user_mail.trim().toLowerCase();

    // Проверка рабочих часов
    const closingTime = calculateClosingTime(reservationDate);
    if (
      reservationDate.getHours() < WORKING_HOURS.weekdays.start ||
      reservationDate >= closingTime
    ) {
      return res.status(400).render('reserve_location_form', {
        title: `Бронирование: ${location}`,
        location,
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Бронь вне рабочих часов бара невозможна.' }],
      });
    }

    // Проверка пользователя
    console.log(`Ищем пользователя с нормализованным email: ${normalizedEmail}`);
    const user = await User.findOne({ user_mail: normalizedEmail });
    if (!user) {
      console.error(`Пользователь с email ${normalizedEmail} не найден.`);
      return res.status(400).render('reserve_location_form', {
        title: `Бронирование: ${location}`,
        location,
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Неверная почта или пароль (пользователь не найден)' }],
      });
    }

    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      console.error('Пароль не совпадает.');
      return res.status(400).render('reserve_location_form', {
        title: `Бронирование: ${location}`,
        location,
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Неверная почта или пароль' }],
      });
    }

    // Поиск стола
    const table = await findAvailableTable(location, reservationDate);
    if (!table) {
      return res.status(404).render('reserve_location_form', {
        title: `Бронирование: ${location}`,
        location,
        csrfToken: req.csrfToken(),
        errors: [{ msg: `Нет доступных столов в локации "${location}"` }],
      });
    }

    // Проверка вместимости стола
    if (number_of_guests > table.table_capacity) {
      return res.status(400).render('reserve_location_form', {
        title: `Бронирование: ${location}`,
        location,
        csrfToken: req.csrfToken(),
        errors: [{ msg: `Максимальная вместимость для ${table.table_location}: ${table.table_capacity} гостей.` }],
      });
    }

    // Создание бронирования
    const reservation = new Reservation({
      user: user._id,
      table: table._id,
      location: table.table_location,
      reservation_date,
      end_time: closingTime,
      number_of_guests,
    });

    await reservation.save();
    console.log(`Бронь создана для пользователя ${user.user_name}`);

    // Если галочка включена, отправляем письмо
    if (send_email) {
      await sendReservationEmail(user_mail, {
        name: user.user_name,
        location: table.table_location,
        date: reservation_date,
        guests: number_of_guests,
      });
    }

    // Успешное бронирование
    return res.status(201).render('reserve_location_form', {
      title: `Бронирование: ${location}`,
      location,
      csrfToken: req.csrfToken(),
      errors: [],
      success: `Бронь успешно создана! Стол: ${table.table_location}, на ${number_of_guests} гостей.`,
    });
  } catch (err) {
    console.error('Ошибка при создании брони:', err);
    res.status(500).render('reserve_location_form', {
      title: `Бронирование: ${location}`,
      location,
      csrfToken: req.csrfToken(),
      errors: [{ msg: 'Ошибка при создании брони. Пожалуйста, попробуйте снова.' }],
    });
  }
};
