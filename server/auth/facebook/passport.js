var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: [
      'displayName',
      'profileUrl',
      'email'
      ], 
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {

      if(profile._json.email) {
        
        //Check if there's a user with the email
        User.findOne({'email': profile._json.email}, function(err, user) {
          if(user) {
            //If there's one, attach facebook account to it
            user.facebook = profile._json;
            user.save(function(err) {
              if (err) return done(err);
              done(err, user);
            });
          } else {
            User.findOne({
              'facebook.id': profile.id
            }, function(err, user) {
              if (err) {
                return done(err);
              }
              if (!user) {
                user = new User({
                  name: profile.displayName,
                  email: profile._json.email,
                  role: 'user',
                  provider: 'facebook',
                  facebook: profile._json,
                  fbprofilepic: 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large'
                });
                user.save(function(err) {
                  if (err) return done(err);
                  done(err, user);
                });
              } else {
                return done(err, user);
              }
            })
          }
        });

      } else {

        User.findOne({
          'facebook.id': profile.id
        }, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            user = new User({
              name: profile.displayName,
              email: profile._json.email,
              role: 'user',
              provider: 'facebook',
              facebook: profile._json,
              fbprofilepic: 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large'
            });
            user.save(function(err) {
              if (err) return done(err);
              done(err, user);
            });
          } else {
            return done(err, user);
          }
        })
      }  

    }
  ));
};
