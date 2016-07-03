'use strict';

var _ = require('lodash');
var Point = require('./point.model');

exports.add = function(req, res) {
  Point.getPointsAndUpdate(req.body.User, req.body.Points, function(data) {
    res.status(200).json(data);
  });
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}