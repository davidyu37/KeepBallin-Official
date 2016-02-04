var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

exports.setup = function (User, config, socket) {
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
      //If user's fb email is provided
      if(profile._json.email) {
        
        //Check if there's a user with the email
        User.findOne({'email': profile._json.email}, function(err, user) {
          if(user) {
            //If there's one, attach facebook account to it
            user.facebook = profile._json;
            user.save(function(err) {
              if (err) return done(err);
              console.log('attached facebook account', socket);
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
                  role: 'vip',
                  provider: 'facebook',
                  facebook: profile._json,
                  fbprofilepic: 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large'
                });
                user.save(function(err) {
                  if (err) return done(err);
                  console.log('created new user', socket);
                  done(err, user);
                });
              } else {
                console.log('login with old fb account', socket);
                return done(err, user);
              }
            })
          }
        });
      //When fb account doesn't provide email
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
              role: 'vip',
              provider: 'facebook',
              facebook: profile._json,
              fbprofilepic: 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large'
            });
            user.save(function(err) {
              if (err) return done(err);
              console.log('new facebook account', user);
              done(err, user);
            });
          } else {
            console.log('log in to old fb account', socket);
            return done(err, user);
          }
        })
      }  

    }
  ));
};
