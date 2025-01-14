const Reservation = require('../models/reservation');

/**
 * Отображает профиль пользователя с активными бронями.
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.session.userId; // Получаем ID текущего пользователя из сессии

    if (!userId) {
      return res.status(401).redirect('/auth/login'); // Перенаправляем на страницу входа, если пользователь не авторизован
    }

    // Ищем активные брони пользователя
    const reservations = await Reservation.find({ user: userId })
      .populate('table', 'table_location table_capacity') // Загружаем данные стола
      .sort({ reservation_date: 1 }); // Сортируем по дате

    // Рендерим страницу профиля с бронями
    res.render('profile', {
      title: 'Мой профиль',
      reservations,
    });
  } catch (err) {
    console.error('Ошибка при загрузке профиля:', err);
    res.status(500).render('error', {
      message: 'Не удалось загрузить профиль. Попробуйте снова.',
      error: err,
    });
  }
};
