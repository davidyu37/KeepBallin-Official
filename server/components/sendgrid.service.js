var config = require('../config/environment'),
sendgrid  = require('sendgrid')(config.sendgrid.apiKey),
hogan = require('hogan.js'),
fs = require('fs'),
//For reservation success template
template = fs.readFileSync('server/api/reservation/success.hjs', 'utf-8'),
//For partial success template
partialSuccessTemplate = fs.readFileSync('server/api/reservation/partial-success.hjs', 'utf-8'),
//For reservation fail template
failTemplate = fs.readFileSync('server/api/reservation/failure.hjs', 'utf-8'),
compiledTemplate = hogan.compile(template),
compiledPartialTemplate = hogan.compile(partialSuccessTemplate),
compiledFailTemplate = hogan.compile(failTemplate),

moment = require('moment');

module.exports = {
	//send reservation result notice
	sendNotice:function(reserve, code, url, template, partial, callback) {

		var dateString = moment(reserve.dateReserved).format("MM-DD-YYYY");
		switch(template) {
			case 'success':
			    //Successful reservation
			    sendgrid.send({
			        to:       reserve.contactEmail,
			        from:     config.email.me,
			        subject:  '預約成功',
			        html: compiledTemplate.render({
			          name: reserve.whoReserved, 
			          confirmationCode: code, 
			          dateReserved: dateString,
			          startTime: reserve.beginString,
			          endTime: reserve.endString,
			          numOfPeople: reserve.numOfPeople,
			          courtName: reserve.courtName,
			          courtAddress: reserve.courtAddress,
			          pricePaid: reserve.pricePaid,
			          url: url
			        })
			      }, function(err, json) {
			        if (err) { return console.error(err); }
			        console.log('success email sent');
			        callback();
			    });
				break;
			case 'partial-success':
				//Partial-Success reservation
			    sendgrid.send({
			        to:       reserve.contactEmail,
			        from:     config.email.me,
			        subject:  '預約成功',
			        html: compiledTemplate.render({
			          name: reserve.whoReserved, 
			          confirmationCode: code, 
			          dateReserved: dateString,
			          startTime: reserve.beginString,
			          endTime: reserve.endString,
			          numOfPeople: reserve.numOfPeople,
			          courtName: reserve.courtName,
			          courtAddress: reserve.courtAddress,
			          pricePaid: reserve.pricePaid,
			          url: url,
			          successTimeslot: partial
			        })
			      }, function(err, json) {
			        if (err) { return console.error(err); }
			        console.log('success email sent');
			        callback();
			    });
				break;
			case 'fail':
			    //Failed reservation
			    sendgrid.send({
			       	to:       reserve.contactEmail,
			        from:     config.email.me,
			        subject:  '預約失敗',
			        html: compiledFailTemplate.render({
			          name: reserve.whoReserved, 
			          confirmationCode: code, 
			          dateReserved: dateString,
			          startTime: reserve.beginString,
			          endTime: reserve.endString,
			          numOfPeople: reserve.numOfPeople,
			          courtName: reserve.courtName,
			          courtAddress: reserve.courtAddress,
			          pricePaid: reserve.pricePaid
			        })
			      }, function(err, json) {
			        if (err) { return console.error(err); }
			        console.log('fail email sent');
			        callback();
			    });
				break;
			default:
				console.log('no template provided');
		}	  
	}//sendNotice ends
}