const mongoose = require('mongoose');
const User = require('./models/user'); // Подключите вашу модель User

mongoose.connect('mongodb://127.0.0.1:27017/reservation_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
  console.log('MongoDB connected!');

  const users = await User.find({});
  console.log('Список пользователей:', users);

  mongoose.connection.close();
});
