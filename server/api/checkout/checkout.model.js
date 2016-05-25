'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var CheckoutSchema = new Schema({
  
});



module.exports = mongoose.model('Checkout', CheckoutSchema);