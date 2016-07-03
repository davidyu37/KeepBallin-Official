var passport = require('passport');
var LineStrategy = require('passport-line').Strategy;

exports.setup = function (User, config) {
  passport.use(new LineStrategy({
      channelID: config.line.channelID,
      channelSecret: config.line.channelSecret,
      callbackURL: config.line.callbackURL,
      //Will be replaced with real state of session
      state: 'placeholder'
    },
    function(accessToken, refreshToken, profile, done) {
      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      console.log('profile', profile);
      User.findOne({ lineID: profile.id }, function(err, user) {
        if(err) { console.log(err); return done(err); }
        if(!user) {
          user = new User({
            name: profile.displayName,
            role: 'vip',
            provider: 'line',
            lineProfilepic: profile._json.pictureUrl,
            lineID: profile.id,
            line: profile._json,
            refreshToken: refreshToken,
            accessToken: accessToken
          });
          user.save(function(err) {
            if (err) return done(err);
            done(err, user);
          });
        } else {
          user.line = profile._json;
          user.name = profile.displayName;
          user.refreshToken = refreshToken;
          user.accessToken = accessToken;
          user.lineProfilepic = profile._json.pictureUrl;
          user.save(function(err) {
            if (err) return done(err);
            done(err, user);
          });
        }
      });
    }
  ));
};
