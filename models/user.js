const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_name:     { type: String, required: true, unique: false },
  user_mail:     { type: String, required: true, unique: true },
  user_password: { type: String, required: true },
});


module.exports = mongoose.model('User', userSchema);
