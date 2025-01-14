// models/reservation.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  table: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  location: {
    type: String,
    enum: ['Барная стойка', 'Стол', 'VIP-Комната'],
    required: true,
  },
  number_of_guests: { type: Number, required: true },
  reservation_date: { type: Date, required: true },
  end_time: { type: String, required: true }, // Новое поле
});

module.exports = mongoose.model('Reservation', reservationSchema);
