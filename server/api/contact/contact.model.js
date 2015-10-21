'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContactSchema = new Schema({
  name: String,
  email: String,
  comment: String
});

module.exports = mongoose.model('Contact', ContactSchema);