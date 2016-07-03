'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    _ = require('lodash'),
    random = require('../../components/random.service');

var CheckoutSchema = new Schema({
	MerchantTradeNo: String,
	MerchantTradeDate: String,
	TotalAmount: Number,
	TradeDesc: String,
	Items: Array,
	ReturnURL: String,
	ChoosePayment: String,
	User: {
		type: Schema.ObjectId,
    	ref: 'User'
	},
	dateCreated: Date,
  RtnMsg: String,
  PaymentType: String,
  TradeNo: String,
  PaymentDate: String,
  PaymentTypeChargeFee: String,
  SimulatePaid: String,
  RtnCode: String,
  CheckMacValue: String
});

CheckoutSchema.statics = {
  findTradeNoOrCreate: function(no, info, cb) {
  	var Model = this;
  	var newCheckout = new Model();
	newCheckout = _.merge(newCheckout, info);

  	this.findOne({ 'MerchantTradeNo': no }, function(err, data) {
  		if(err) { console.log('err', err); }
  		if(!data) {
  			//There's no order with the same merchant trade no
  			newCheckout.save(function(err, d) {
  				if(err) { console.log('err while saving order to db', err); }
  				cb(d);
  			});
  		} else {
  			//There's already a order with the merchant trade no
  			//Generate new order no
  			var newNo = random.generate(20);
  			newCheckout = _.merge(newCheckout, {MerchantTradeNo: newNo});
  			newCheckout.save(function(err, d) {
  				if(err) { console.log('err while saving order to db', err); }
  				console.log('repeated order no and new no given', newNo);
  				cb(d);
  			});
  		}	
  	});
  },
  findOrder: function(info, cb) {
    this.findOne({ 'MerchantTradeNo': info.MerchantTradeNo }, function(err, data) {
      if(err) { console.log('err', err); }
      if(!data) {
        console.log('cant find order');
      } else {
        //Found order
        var updatedOrder = _.merge(data, info);
        updatedOrder.save(function(err, d) {
          if(err) { console.log('err while saving order to db', err); }
          console.log('order updated', updatedOrder);
          cb(updatedOrder);
        });
      } 
    });
  }
};


module.exports = mongoose.model('Checkout', CheckoutSchema);