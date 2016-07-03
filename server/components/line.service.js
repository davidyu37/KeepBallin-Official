//AWS uploading for QR code
var config = require('../config/environment');
var LineBot = require('line-bot-sdk');//https://github.com/runnables/line-bot-sdk-nodejs
var Promise = require('promise');
var agent = require('superagent-promise')(require('superagent'), Promise);
var User = require('../api/user/user.model');
var _ = require('lodash');

var client = LineBot.client({
  channelID: config.line.channelID_BOT,
  channelSecret: config.line.channelSecret_BOT,
  channelMID: config.line.channelMID
});

var MultipleMessages = LineBot.MultipleMessages;

var defaultHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };

var getNewMid = function(user, cb) {
	console.log('getNewMid execute');
	defaultHeaders['X-LINE-ChannelToken'] = user.accessToken;
	var data = {
		refreshToken: user.refreshToken,
		channelSecret: config.line.channelSecret
	};

	agent.post('https://api.line.me/v1/oauth/accessToken', data)
	  .set(defaultHeaders)
	  .end()
	  .then(function(res) {
	    console.log('got new response from line', res.body);
	    cb(res.body);
	  });
};

module.exports = {
	sendMessage: function(mid, message) {
		client.sendText(mid, message);
	},//sendMessage ends

	sendNotification: function(userId, message, qrcode, court, success) {
		var multipleMessages = new MultipleMessages();
		
		if(success) {
			console.log('success line');
			multipleMessages
			  .addText(message)
			  .addImage(qrcode, qrcode)
			  .addLocation(court.address, court.lat, court.lng);
		} else {
			console.log('fail line');
			multipleMessages
			  .addText(message)
			  .addLocation(court.address, court.lat, court.lng);
		}

		User.findById(userId, function(err, user) {
			console.log('line.service found user', user);
			getNewMid(user, function(data) {
				var newUser = {
					line: {
						mid: data.mid
					},
					accessToken: data.accessToken,
					refreshToken: data.refreshToken
				};
				var combined = _.merge(user, newUser);
				combined.save();
				client.sendMultipleMessages(data.mid, multipleMessages);
				
			});
		});
	}

};