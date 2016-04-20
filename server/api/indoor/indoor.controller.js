'use strict';

var _ = require('lodash');
var Indoor = require('./Indoor.model');



// Creates a new Indoor in the DB.
exports.create = function(req, res) {
  //Attach user's id to Indoor's info
  var userId = { creator: req.user._id };
  var newIndoor = _.merge(req.body, userId);
  Indoor.create(newIndoor, function(err, indoor) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(indoor);
  });
};

// Get a single Indoor only for the creator or admin
exports.show = function(req, res) {
  Indoor.findById(req.params.id, function (err, indoor) {
    if(err) { return handleError(res, err); }
    if(!indoor) { return res.status(404).send('Not Found'); }
    return res.json(indoor);
  });
};

exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Indoor.findById(req.params.id, function (err, indoor) {
    if (err) { return handleError(res, err); }
    if(!indoor) { return res.status(404).send('Not Found'); }
    var newIndoor = _.merge(indoor, req.body);
    newIndoor.markModified('hours');
    newIndoor.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(newIndoor);
    });
  });
};

// Get list of Indoors
exports.index = function(req, res) {
  Indoor.find(function (err, Indoors) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(Indoors);
  });
};

// Get individual rental court if it's public
exports.getPublic = function(req, res) {
  Indoor.getPublic(req.params.id, function(err, indoor) {
    if(err) { return handleError(res, err); }
    if(!indoor) { console.log('theres no indoor', indoor) }
    return res.status(200).json(indoor);
  })
};

// Query rental courts that's approved and public
exports.queryPublic = function(req, res) {
  Indoor.queryPublic(function(err, indoor) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(indoor);
  });
}


// exports.chosenIndoor = function(req, res) {
//   Indoor.findOneAndPopulate(req.params.id, function (err, Indoor) {
//     if(err) { return handleError(res, err); }
//     if(!Indoor) { return res.status(404).send('Not Found'); }
   
//     return res.json(Indoor);
//   });
// };

// // Get ratings of the Indoor
// exports.getRating = function(req, res) {
//   Indoor.getRatings(req.params.id, function (err, Indoor) {
//     if(err) { return handleError(res, err); }
//     if(!Indoor) { return res.status(404).send('Not Found'); }
//     return res.json(Indoor);
//   });
// };

// exports.searchResult = function(req, res) {
//   Indoor.search(req.query, function (err, Indoors) {
//     if(err) { return handleError(res, err); }
//     return res.status(200).json(Indoors);
//   });
// }

// // Updates an existing Indoor in the DB.
// exports.update = function(req, res) {
//   if(req.body._id) { delete req.body._id; }
//   Indoor.findById(req.params.id, function (err, Indoor) {
//     if (err) { return handleError(res, err); }
//     if(!Indoor) { return res.status(404).send('Not Found'); }
//      //Attach user's id to Indoor's info
//     var userId = { lastEditedBy: req.user._id };
//     var newIndoor = _.merge(req.body, userId);
//     var updated = _.merge(Indoor, newIndoor);
//     updated.save(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.status(200).json(Indoor);
//     });
//   });
// };

// // Deletes a Indoor from the DB.
// exports.destroy = function(req, res) {
//   Indoor.findById(req.params.id, function (err, Indoor) {
//     if(err) { return handleError(res, err); }
//     if(!Indoor) { return res.status(404).send('Not Found'); }
//     Indoor.remove(function(err) {
//       if(err) { return handleError(res, err); }
//       return res.status(204).send('No Content');
//     });
//   });
// };

function handleError(res, err) {
  return res.status(500).send(err);
}