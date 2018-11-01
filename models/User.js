var mongoose = require('mongoose');
var userSchema = require('../schemas/user_schema');
module.exports.User = mongoose.model('User', userSchema);