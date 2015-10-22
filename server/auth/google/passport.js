var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../../config/environment');

exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {

      if(profile.emails[0].value) {

        //Check if there's a user with the email
        User.findOne({'email': profile.emails[0].value}, function(err, user) {
          if(user) {
            //If there's one, attach google account to it
            user.google = profile._json;
            user.save(function(err) {
              if (err) return done(err);
              done(err, user);
            });
          } else {
            //Then check if there's a google account created
            User.findOne({
              'google.id': profile.id
            }, function(err, user) {
              if (!user) {
                user = new User({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  provider: 'google',
                  google: profile._json
                });
                user.save(function(err) {
                  if (err) return done(err);
                  done(err, user);
                });
              } else {
                return done(err, user);
              }
            });
          }
        });
      } else {
        User.findOne({
          'google.id': profile.id
        }, function(err, user) {
          if (!user) {
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              provider: 'google',
              google: profile._json
            });
            user.save(function(err) {
              if (err) return done(err);
              done(err, user);
            });
          } else {
            return done(err, user);
          }
        });
      }
            
    }
  ));
};
