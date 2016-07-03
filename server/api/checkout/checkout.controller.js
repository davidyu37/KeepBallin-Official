'use strict';


var _ = require('lodash');
var Checkout = require('./checkout.model');
var Allpay = require("allpay");
var config = require("../../config/environment");
var moment = require("moment");
var random = require('../../components/random.service');
var Point = require('../point/point.model');
//http request
// var requestify = require('requestify'); //https://github.com/ranm8/requestify

var allpay = new Allpay({
  merchantID: config.allpay.merchantID,
  hashKey: config.allpay.hashKey,
  hashIV: config.allpay.hashIV,
  mode: config.allpay.mode,
  debug: true
});

// Creates a new checkout in the DB.
exports.create = function(req, res) {
  var now = moment();
  var stringNow = now.format("YYYY/MM/DD HH:mm:ss").toString();
  var tradeNo = random.generate(20);
  var amount =  Number(req.body.points);

  var objForAllpay = {
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: stringNow,
    TotalAmount: amount,
    TradeDesc: "商城購物測試",
    Items: [{
      name: req.body.points + "KB點數",
      price: amount,
      currency: "元",
      quantity: 1
    }],
    ReturnURL: config.allpay.apiURL,
    ClientBackURL: config.allpay.clientURL,
    ChoosePayment: "ALL"
  };

  var objForDb = _.merge(objForAllpay, { User: req.user._id, dateCreated: now});

  //Persist to db
  Checkout.findTradeNoOrCreate(tradeNo, objForDb, function(data) {
    //Merge new merchant trade no in case there is duplicated trade no
    var sendToAllPay = _.merge(objForAllpay, { MerchantTradeNo: data.MerchantTradeNo });
    //Return the html that takes the user to allpay page
    allpay.aioCheckOut(sendToAllPay, function(err, result) {
      if(err) { console.log(err); }
      console.log('result', result);
      data.CheckMacValue = result.CheckMacValue;
      data.save(function() {
        return res.status(201).json(result);
      });
    });//aioCheckOut ends
  });//Checkout.findTradeNoOrCreate ends
};

exports.complete = function(req, res) {
  console.log('things allpay sent back', req.body);
  //Do validation or else get owned by hacker
  
  var obj = {
    MerchantID: req.body.MerchantID,
    MerchantTradeNo: req.body.MerchantTradeNo,
    PayAmt: req.body.PayAmt,
    PaymentDate: req.body.PaymentDate,
    PaymentType: req.body.PaymentType,
    PaymentTypeChargeFee: req.body.PaymentTypeChargeFee,
    RedeemAmt: req.body.RedeemAmt,
    RtnCode: req.body.RtnCode,
    RtnMsg: req.body.RtnMsg,
    SimulatePaid: req.body.SimulatePaid,
    TradeAmt: req.body.TradeAmt,
    TradeDate: req.body.TradeDate,
    TradeNo: req.body.TradeNo
  };
  var checkMacValue = allpay.genCheckMacValue(obj).toString();
  //Check if what allpay server generated mac value is the same as our server generated
  if(req.body.CheckMacValue === checkMacValue) {
    //All good
    console.log('check mac value correct');
    if(req.body.RtnCode === '1') {
      //Payment successful
      //Add points to account
      Checkout.findOrder(req.body, function(order) {
        //Checkout.findOrder updates the order and returns the updated order
        console.log('user id of the order', order.User);
        console.log('order detail', order);
        //Only if there's valid order, then add points
        if(order) {
          //Add points to user
          Point.getPointsAndUpdate(order.User, order.TotalAmount, function(points) {
            console.log('points added', points);
          });
        }

      });
    } else {
      //Payment failed
      //Find order and update the order
      Checkout.findOrder(req.body, function(order) {
        console.log('payment failed', order);
      });
    }   
  } else {
    console.log('check mac value failed');
  }
  return res.status(201).send("1|OK");
};

function handleError(res, err) {
  return res.status(500).send(err);
}