// models/table.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tableSchema = new Schema({
  table_location: {
    type: String,
    enum: ['Барная стойка', 'Стол', 'VIP-Комната'],
    required: true
  },
  table_capacity: { type: Number, required: true },
});

module.exports = mongoose.model('Table', tableSchema);
