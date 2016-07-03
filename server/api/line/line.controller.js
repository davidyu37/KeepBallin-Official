'use strict';


var _ = require('lodash');
var moment = require("moment");
var Line = require('../../components/line.service');

// Receive line message
exports.create = function(req, res) {
  console.log('things from line', req.body);
  var result = req.body.result;
  var data = result[0]['content'];
  console.log('receive: ', data);
  Line.sendMessage(data.from, 'Sup boy, this is a test message', function() {
    console.log('line message sent');
  });
  res.status(201);
};

function handleError(res, err) {
  return res.status(500).send(err);
}