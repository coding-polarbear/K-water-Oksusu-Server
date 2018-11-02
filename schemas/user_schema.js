const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    email : String,
    name : String,
    wallet : String,
    enteredWallet : Array
});

module.exports = userSchema;