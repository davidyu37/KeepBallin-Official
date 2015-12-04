'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var relationship = require('mongoose-relationship');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }],
  memberOf: [{
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }],
  intro: String,
  profession: [String],
  open: {type: Boolean, default: false},
  position: String,
  jerseynumber: Number,
  experience: Number,
  height: Number,
  weight: Number,
  birthday: Date,
  avatar: {
    type: Schema.ObjectId,
    ref: 'Upload'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  courtRatings: [{
    type: Schema.ObjectId, 
    ref: 'Rating'
  }],
  fbprofilepic: String,
  facebook: {},
  google: {},
  github: {},
  createdOn: { type: Date, default: Date.now },
  courtCreated: [{ type:Schema.ObjectId, ref:"Court" }],
  eventsJoined: [{ type:Schema.ObjectId, ref:"Event" }]
});

UserSchema.set('versionKey', false);

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, '此信箱已註冊\nThe specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

UserSchema.plugin(deepPopulate, {
  populate: {
    'courtRatings': {
      select: 'rate court'
    },
    'courtRatings.court': {
      select: 'court address pictures'
    },
    'courtRatings.court.pictures': {
      select: 'url'
    },
    'courtCreated.pictures': {
      select: 'url'
    },
    'courtCreated': {
      select: 'court address averagedRating pictures'
    }
  }
});

UserSchema.statics = {
  findByIdAndPopulate: function(userId, cb) {
    this.findOne({_id: userId})
      .populate({path:'avatar', select: 'url date'})
      .select('-salt -hashedPassword')
      .exec(cb);
  },
  managerSearch: function(cb) {
    this.find( {$or: [{role: 'user'}, {role: 'vip'}]} )
    .populate({path:'avatar', select: 'url date'})
    .select('-salt -hashedPassword')
    .exec(cb);
  }, 
  getMyCourt: function(userId, cb) {
    this.findOne({_id: userId})
      // .populate('courtCreated courtRatings')
      // .select('name courtRatings courtCreated')
      .deepPopulate('courtRatings courtRatings.court courtRatings.court.pictures courtCreated courtCreated.pictures')
      .select('name courtRatings courtCreated')
      .exec(cb);
  },
  adminSearch: function(cb) {
    this.find()
    .deepPopulate('courtRatings courtRatings.court courtCreated')
    .select('-salt -hashedPassword')
    .exec(cb);
  }
};


module.exports = mongoose.model('User', UserSchema);
