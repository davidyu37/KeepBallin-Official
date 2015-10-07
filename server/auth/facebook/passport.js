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
      ]
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      User.findOne({
        'facebook.id': profile.id
      },
      function(err, user) {
        if (err) {
          return done(err);
        }
        
        if (!user) {
          user = new User({
            name: profile.displayName,
            // email: profile.emails[0].value,
            email: profile._json.email,
            role: 'user',
            username: profile.username,
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
  ));
};
