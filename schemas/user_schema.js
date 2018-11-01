const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    email : String,
    wallet : String,
    enteredWallet : Array
},{usePushEach : true});

module.exports = userSchema;