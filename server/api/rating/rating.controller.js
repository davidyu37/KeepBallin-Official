'use strict';

var _ = require('lodash');
var Rating = require('./rating.model');
var Court = require('../court/court.model');

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
  // var conditions = { $and:[{court: req.body.court}, {user: req.user._id}]},
  //     update = { 
  //       user: req.user._id,
  //       court: req.body.court,
  //       rate: req.body.rate,
  //       reason: req.body.reason
  //      },
  //     options = { upsert: true };
  // //Relationship plugin needs a fresh new Rating
  // var newRating = new Rating(update);
  
  // Rating.update(conditions, update, options, callback);

  // function callback (err, numAffected) {
  //   // numAffected is the number of updated documents
  //   if (err) { return handleError(res, err); }
  //   //When upserted is undefined, the document already exist
  //   var exist = numAffected.upserted === undefined;
  //   //If doesn't exist, delete the upserted one and save the new rating
  //   if(!exist) {
  //     //ID of rating
  //     var ratingID = numAffected.upserted[0]._id;
  //     //Find, destroy, and make new
  //     Rating.findById(ratingID, function(err, doc) {
  //       if (err) { return handleError(res, err); }
  //       doc.remove(function() {
  //         newRating.save(function(err, data) {
  //           Court.getRatings(req.body.court, function(err, rates) {
  //             var average = averageRate(rates);
  //             rates.averagedRating = average;
  //             rates.save();
  //             return res.status(201).json(average);
  //           });
  //         });
  //       });
  //     });
  //   } else {
  //     Court.getRatings(req.body.court, function(err, rates) {
  //       var average = averageRate(rates);
  //       rates.averagedRating = average;
  //       rates.save();
  //       return res.status(201).json(average);
  //     });
  //   }
  // }

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