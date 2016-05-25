'use strict';

var _ = require('lodash');
var court = require('./checkout.model');
var Allpay = require("allpay");
var config = require("../../config/environment");
var moment = require("moment");
var uuid = require('uuid');
//http request
// var requestify = require('requestify'); //https://github.com/ranm8/requestify

var allpay = new Allpay({
  merchantID: config.allpay.merchantID,
  hashKey: config.allpay.hashKey,
  hashIV: config.allpay.hashIV,
  mode: config.allpay.mode,
  debug: true
});

// Creates a new court in the DB.
exports.create = function(req, res) {
  console.log('testing', req.body);
  var now = moment();
  now = now.format("YYYY/MM/DD HH:mm:ss");

  console.log('now', now);
  var tradeNo = uuid.v1();
  console.log(tradeNo.length);
  console.log('tradeNo', tradeNo);

  tradeNo = tradeNo.slice(tradeNo.length - 12, tradeNo.length);

  console.log('sliced', tradeNo);

  now = now.toString();
  allpay.aioCheckOut({
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: now,
    TotalAmount: req.body.points,
    TradeDesc: "商城購物測試",
    Items: [{
      name: req.body.points + "KB點數",
      price: req.body.points,
      currency: "元",
      quantity: 1
    }],
    ReturnURL: "http://localhost/receive",
    ChoosePayment: "ALL"
  }, function(err, result) {
    // Do something here...
    if(err) { console.log(err); }
    console.log('result', result);
    return res.status(201).json(result);
    // requestify.post(result.url, result.data, {
    //   headers: {
    //     'Access-Control-Allow-Origin': result.url
    //   }
    // })
    // .then(function(response) {
    //     console.log('response body', response.body);
    //     // Get the response body (JSON parsed or jQuery object for XMLs)
    //     response.getBody();

    //     // Get the raw response body
    //     response.body;
    // });
  });
  //Attach user's id to court's info
  // var userId = { creator: req.user._id };
  // var newCourt = _.merge(req.body, userId);
  // court.create(newCourt, function(err, court) {
  //   if(err) { return handleError(res, err); }
  //   return res.status(201).json(court);
  // });
};


function handleError(res, err) {
  return res.status(500).send(err);
}