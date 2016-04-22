'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');

var ReservationSchema = new Schema({
  
});



module.exports = mongoose.model('Reservation', ReservationSchema);