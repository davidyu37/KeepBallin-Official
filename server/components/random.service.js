//AWS uploading for QR code
var crypto = require('crypto');

module.exports = {
	generate: function(len) {
		return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
	}
}