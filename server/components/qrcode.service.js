//AWS uploading for QR code
var config = require('../config/environment');
var uuid = require('uuid');
var AWS = require('aws-sdk');
var qr = require('qr-image');
var s3 = new AWS.S3({
  accessKeyId: config.s3.key,
  secretAccessKey: config.s3.secret
});

module.exports = {
	generateQRCode: function(code, callback) {

	  var png_string = qr.imageSync(code, { type: 'png' });
	  
	  var destination = 'pictures/reservation/' + uuid.v4() + '.png';

	  var params = {
	    Bucket: config.s3.bucket, /* required */
	    Key: destination, /* required */
	    ACL: 'public-read',
	    Body: png_string,
	    ContentType: 'png'
	    // Expires: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789
	  };
	  s3.putObject(params, function(err, data) {
	    if (err) { console.log(err, err.stack); 
	      // an error occurred
	      callback(err);
	    }
	    else { 
	      // successful response
	      s3.getSignedUrl('putObject', params, function (err, url) {

	        var searched = url.search('png');

	        searched += 3;

	        var sliced = url.slice(0, searched);
	        
	        callback(null, sliced);
	      });
	    }          
	  });
	}

}