var mongoose = require('mongoose');
var fundingSchema = require('../schemas/funding_schema');
module.exports.Funding = mongoose.model('Funding', fundingSchema);