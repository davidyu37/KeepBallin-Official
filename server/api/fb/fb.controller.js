'use strict';

var config = require('../../config/environment');



// Get list of events
exports.index = function(req, res) {
  return res.status(200).json(config.facebook);
};