// initDb.js
const mongoose = require('mongoose');
const Table = require('./models/table'); // Путь к вашей модели (возможно '../models/table')

// Строка подключения к MongoDB (замените на свою)
const mongoDB = 'mongodb://127.0.0.1:27017/reservation_system';

async function initDb() {
  try {
    // Подключаемся к базе
    await mongoose.connect(mongoDB);
    console.log('MongoDB connected successfully!');

    // Очищаем коллекцию Table, чтобы не было дублей
    await Table.deleteMany({});
    console.log('Cleared Table collection');

    // Формируем массив объектов (4 стула, 10 барных мест, 1 VIP)
    const tablesData = [];

    // 10 барных мест (вместимость = 1)
    for (let i = 0; i < 10; i++) {
      tablesData.push({
        table_location: 'Барная стойка',
        table_capacity: 1,
      });
    }

    // 4 стула (вместимость до 4)
    for (let i = 0; i < 4; i++) {
      tablesData.push({
        table_location: 'Стол',
        table_capacity: 4,
      });
    }

    // 1 VIP (вместимость = 12)
    tablesData.push({
      table_location: 'VIP-Комната',
      table_capacity: 12,
    });

    // Записываем данные в коллекцию
    await Table.insertMany(tablesData);
    console.log('Inserted initial Table data successfully!');

  } catch (err) {
    console.error('Error initializing DB:', err);
  } finally {
    // Закрываем соединение
    mongoose.connection.close();
  }
}

initDb();
