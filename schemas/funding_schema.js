const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var fundingSchema = new Schema({
    title: String,
    description: String,
    date: {type: Date, default: Date.now()},
    images: String,
    server_private_key: String,
    server_mnemonic: String,
    server_wallet: String,
    members : Array
});

module.exports = fundingSchema;