'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'keepballin-secret'
  },
  // process.env.SESSION_SECRET
  // List of user roles
  userRoles: ['guest', 'user', 'vip', 'manager', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
  },

  s3: {
    key: process.env.S3_KEY || 'key',
    secret: process.env.S3_SECRET || 'secret',
    bucket: process.env.S3_BUCKET || 'keepballin-dev'
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_APIKEY || 'apikey'
  },

  email: {
    me: process.env.COMPANY_EMAIL || 'email'
  },

  prerender: {
    token: process.env.PRERENDER_TOKEN || 'token'
  },

  allpay: {
    merchantID: process.env.MERCHANT_ID || 'merchantID',
    hashKey: process.env.HASH_KEY || 'hashKey',
    hashIV: process.env.HASH_IV || 'hashIV',
    mode: process.env.MODE || 'test',
    apiURL:  (process.env.DOMAIN || '') + '/api/checkouts/complete',
    clientURL: (process.env.DOMAIN || '') + '/payment/complete'
  },

  line: {
    channelID: process.env.CHANNEL_ID || 'channelID',
    channelSecret: process.env.CHANNEL_SECRET || 'channelSecret',
    channelID_BOT: process.env.CHANNEL_ID_BOT || 'channel id for bot',
    channelSecret_BOT: process.env.CHANNEL_SECRET_BOT || 'channel secret for bot',
    channelMID: process.env.CHANNEL_MID || 'channelMID',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/line/callback'
  }


};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
