const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: String,
  social_id: String,
  name: String,
  photo: String,
  email: String,
  created_on: Date,
  provider: String,
  last_login: Date,
  login_count: Number
})
// userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
