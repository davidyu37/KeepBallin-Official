'use strict';

var _ = require('lodash'),
Upload = require('./upload.model'),
mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = Schema.ObjectId,
path = require('path'),
config = require('../../config/environment');

console.log(config);
var uuid = require('uuid'); // https://github.com/defunctzombie/node-uuid
var multiparty = require('multiparty'); // https://github.com/andrewrk/node-multiparty
var s3 = require('s3'); // https://github.com/andrewrk/node-s3-client

var s3Client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: config.s3.key,
    secretAccessKey: config.s3.secret
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  }
});

//Upload user's profile picture
exports.profilepic = function(req, res) {
  var category = 'profile';
  uploadTos3AndRecordOnDB (req, res, category);
};

// Upload court pictures
exports.createCourtPic = function(req, res) {
  var category = 'courts';
  uploadTos3AndRecordOnDB (req, res, category);
};

// Get uploads by courtId
exports.getCourtPics = function(req, res) {
  Upload.loadByCourtId(req.params.court, function(err, upload) {
    if(!upload) { return }
    if(err) { return handleError(res, err); }
    return res.status(200).json(upload);
  });
};

// Deletes a upload from the DB.
exports.destroy = function(req, res) {
  Upload.findById(req.params.id, function (err, upload) {
    if(err) { return handleError(res, err); }
    if(!upload) { return res.status(404).send('Not Found'); }
    var s3Params = upload.s3Params;
    var deleteParams = {
      Bucket: s3Params.Bucket,
      Delete: {
        Objects: [{
          Key: s3Params.Key
        }]
      }
    };
    var deleter = s3Client.deleteObjects(deleteParams);

    deleter.on('error', function(err) {
      console.log('Delete error:', err);
    });

    deleter.on('end', function(data) {
      console.log("DONE: done deleting");
      upload.remove(function(err) {
        if(err) { return handleError(res, err); }
        return res.status(204).send('No Content');
      });//upload remove ends    
    });//deleter on end ends 
  });//findById ends
};

//Upload function to be used multiple times
function uploadTos3AndRecordOnDB (req, res, category) {
  var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
      var file = files.file[0];
      var contentType = file.headers['content-type'];
      var extension = file.path.substring(file.path.lastIndexOf('.'));
      var destPath = '';
      var courtId, userId;
      if(category === 'courts') {
        console.log(fields.courtId);
        courtId = fields.courtId;
        destPath = 'pictures/' + category + '/' + courtId + '/' + uuid.v4() + extension;
      }
      if(category === 'profile') {
        userId = req.user._id;
        destPath = 'pictures/' + category + '/' + userId + '/' + uuid.v4() + extension;
      }
      //Params to upload to s3
      var params = {
        localFile: file.path,
        s3Params: {
          Bucket: 'keepballin',
          Key: destPath,
          ACL: 'public-read',
          ContentType: contentType
        }
      };
      var otherData = {
        user : req.user._id
      };
      var record = _.merge(params, otherData);

      if(category === 'courts') {
        courtId = {court: fields.courtId[0]};
        record = _.merge(record, courtId);
      }
      if(category === 'profile') {
        var avatar = {avatarOf: req.user._id};
        record = _.merge(record, avatar);
      }

      var uploader = s3Client.uploadFile(params);
      
      uploader.on('error', function(err) {
        console.log(err);
      });

      uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount,
        uploader.progressAmount, uploader.progressTotal);
      })

      uploader.on('end', function(data) {
        console.log("DONE: done uploading");
        var url = s3.getPublicUrlHttp(params.s3Params.Bucket, params.s3Params.Key);
        record = _.merge(record, {url: url});
        Upload.create(record, function(err, upload) {
          if(err) { return handleError(res, err); }

          return res.status(201).json(upload);
        })
      });
    });
}
 


// Get list of uploads
exports.index = function(req, res) {
  Upload.find(function (err, uploads) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(uploads);
  });
};

// Creates a new upload in the DB.
// exports.create = function(req, res, next) {
//   var file = req.files.file;
//   var courtId = req.body.courtId;
//   var userId = req.user._id;
//   var filename = path.join('./client/assets/uploads/images/courts', file.name);

//   // Information saving along with file
//   var courtpic = {
//     courtId: courtId,
//     filename: file.name,
//     url: path.join('assets/uploads/images/courts', file.name),
//     mimetype: file.mimetype,
//     user: userId
//   };
//   writeFile(filename, file.data, courtpic, res);
// };


// Deletes a upload from the DB.
// exports.destroy = function(req, res) {
//   var filename = path.join('./client/assets/uploads/images/courts', req.params.filename);
//   fs.unlink(filename, function (err) {
//     if (err) {
//       console.error("delete error:  " + err.message);
//     } else {
//       console.log('successfully deleted ' + filename);
//       Upload.findById(req.params.id, function (err, upload) {
//         if(err) { return handleError(res, err); }
//         if(!upload) { return res.status(404).send('Not Found'); }
        
//         upload.remove(function(err) {
//           if(err) { return handleError(res, err); }
//           return res.status(204).send('No Content');
//         });
//       });
//     }
//   });
// };


//Upload team photo
// exports.teampic = function(req, res) {
  
//   var file = req.files.file;
//   var user_id = req.user._id;
//   var filename = path.join('./client/assets/uploads/images/team', file.name);

//   // Information saving along with file
//   var teamPic = {
//     filename: file.name,
//     url: path.join('assets/uploads/images/team', file.name),
//     mimetype: file.mimetype,
//     user: user_id
//   };
//   writeFile(filename, file.data, teamPic, res);
// };

// function writeFile(url, data, objectForUpload, res) {
//   fs.writeFile(url, data, function(err) {
//     if (err) {
//      console.error("write error:  " + err.message);
//     } else {
//      console.log("Successful Write to " + url);
//       Upload.create(objectForUpload, function(error, upload) {
//         if(error) { return handleError(res, error); }
//         return res.status(201).json(upload);
//       });
//     }
//   });
// }


function handleError(res, err) {
  return res.status(500).send(err);
}