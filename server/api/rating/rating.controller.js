'use strict';

var _ = require('lodash');
var Rating = require('./rating.model');
var Court = require('../court/court.model');
var Indoor = require('../indoor/indoor.model');

function averageRate(data) {
    var allRates = data.ratings;
    if(allRates.length === 0) {
      return;
    } else {
      var total = 0;
      for(var i=0; i < allRates.length; i++) {
        total += allRates[i].rate;
      }
      var average = total / allRates.length;
      return average;
    }
}

// Get list of ratings
exports.index = function(req, res) {
  Rating.find(function (err, ratings) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(ratings);
  });
};

// Get a single rating
exports.show = function(req, res) {
  Rating.findById(req.params.id, function (err, rating) {
    if(err) { return handleError(res, err); }
    if(!rating) { return res.status(404).send('Not Found'); }
    return res.json(rating);
  });
};

// Creates a new rating in the DB.
exports.create = function(req, res) {

  var userId = { user: req.user._id };
  var rate = _.merge(req.body, userId);
  var newRate = new Rating(rate);
  newRate.save(function(err) {
    if(err) { return handleError(res, err); }
    Court.getRatings(req.body.court, function(err, rates) {
      var average = averageRate(rates);
      rates.averagedRating = average;
      rates.save();
      return res.status(201).json(average);
    });
  });
};

// new rating for indoor court
exports.createIndoor = function(req, res) {
  var userId = { user: req.user._id };
  var rate = _.merge(req.body, userId);
  var newRate = new Rating(rate);
  newRate.save(function(err) {
    if(err) { return handleError(res, err); }
    Indoor.getRatings(req.body.indoor, function(err, rates) {
      var average = averageRate(rates);
      rates.averagedRating = average;
      rates.save();
      return res.status(201).json(average);
    });
  });
};

// Updates an existing rating in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Rating.findById(req.params.id, function (err, rating) {
    if (err) { return handleError(res, err); }
    if(!rating) { return res.status(404).send('Not Found'); }
    var updated = _.merge(rating, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(rating);
    });
  });
};

// Deletes a rating from the DB.
exports.destroy = function(req, res) {
  Rating.findById(req.params.id, function (err, rating) {
    if(err) { return handleError(res, err); }
    if(!rating) { return res.status(404).send('Not Found'); }
    rating.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}