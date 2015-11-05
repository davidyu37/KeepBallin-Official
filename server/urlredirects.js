module.exports = sanitizeURLs;

var env = require('./config/environment');

/**
 * 1. Redirect all request from www.* to the naked domain.
 * 2. Redirect any HTTP request to HTTPS. (turned off at the moment)
 */


function sanitizeURLs(req, res, next) {

  var host = req.headers.host;
  var protocol = req.protocol;
  var redirectNeeded = false;

  // Remove WWW
  if (host.slice(0, 4) === 'www.') {
    host = req.headers.host.slice(4);
    redirectNeeded = true;
  }

  // Force HTTPS (allowing internal requests through)
  if (protocol === 'http' && req.hostname !== '127.0.0.1') {
    protocol = 'https';
    redirectNeeded = true;
  }

  if(redirectNeeded) {
    res.redirect(301, protocol + '://' + host + req.originalUrl);
  } else {
    next();
  }
}