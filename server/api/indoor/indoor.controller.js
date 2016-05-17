'use strict';

var _ = require('lodash');
var Indoor = require('./indoor.model');
var multiparty = require('multiparty');
var config = require('../../config/environment');
var uuid = require('uuid');
var s3 = require('s3');
var bucket = config.s3.bucket;

var s3Client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: config.s3.key,
    secretAccessKey: config.s3.secret
  }
});

// Upload pictures for indoor court
exports.upload = function(req, res) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if(err) { console.log(err); }
    var file = files.file[0];
    var contentType = file.headers['content-type'];
    var extension = file.path.substring(file.path.lastIndexOf('.'));
    var IndoorCourtId = fields.IndoorCourtId[0];

    var destination = 'pictures/indoor/' + IndoorCourtId + '/' + uuid.v4() + extension;

    var params = {
      localFile: file.path,
      s3Params: {
        Bucket: bucket,
        Key: destination,
        ACL: 'public-read',
        ContentType: contentType
      }
    };

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
      var url = s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key, "ap-northeast-1");
      Indoor.findById(IndoorCourtId, function(err, data) {
        if(data.pictures[0]) {
          data.pictures.push(url);
        } else {
          data.pictures = [url];
        }
        data.save(function() {
          return res.status(201).json(data);
        });
      });
    });
  });//form.parse ends
};

//Delete picture of indoor court
exports.deletePic = function(req, res) {
  Indoor.findById(req.params.id, function (err, indoor) {
    if(err) { return handleError(res, err); }
    if(!indoor) { return res.status(404).send('Not Found'); }
    //Get Object id from url
    var index = req.body.url.indexOf(bucket) + bucket.length + 1;
    var objectId = req.body.url.slice(index, req.body.url.length);

    var deleteParams = {
      Bucket: bucket,
      Delete: {
        Objects: [{
          Key: objectId
        }]
      }
    };
    var deleter = s3Client.deleteObjects(deleteParams);

    deleter.on('error', function(err) {
      console.log('Delete error:', err);
    });

    deleter.on('end', function(data) {
      console.log("DONE: done deleting");
      //Remove the picture url from pictures array 
      var indexOfPic = indoor.pictures.indexOf(req.body.url);
      indoor.pictures.splice(indexOfPic, 1);
      indoor.save(function() {
        return res.status(201).json(indoor);
      });
    });//deleter on end ends 

  });//findById ends
};

//Set picture as the first in array
exports.setCover = function(req, res) {
  Indoor.findById(req.params.id, function (err, indoor) {
    if(err) { return handleError(res, err); }
    if(!indoor) { return res.status(404).send('Not Found'); }
    //Get the index of the picture, remove it, unshift it in the front
    var index = indoor.pictures.indexOf(req.body.url);
    indoor.pictures.splice(index, 1);
    indoor.pictures.unshift(req.body.url);
    indoor.save(function() {
      return res.json(indoor);
    });
  });
};

// Creates a new Indoor in the DB.
exports.create = function(req, res) {
  //Attach user's id to Indoor's info
  var userId = { creator: req.user._id };
  var newIndoor = _.merge(req.body, userId);
  Indoor.create(newIndoor, function(err, indoor) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(indoor);
  });
};

// Get a single Indoor only for the creator or admin
exports.show = function(req, res) {
  Indoor.findById(req.params.id, function (err, indoor) {
    if(err) { return handleError(res, err); }
    if(!indoor) { return res.status(404).send('Not Found'); }
    return res.json(indoor);
  });
};

exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Indoor.findById(req.params.id, function (err, indoor) {
    if (err) { return handleError(res, err); }
    if(!indoor) { return res.status(404).send('Not Found'); }
    var newIndoor = _.merge(indoor, req.body);
    newIndoor.markModified('hours');
    newIndoor.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(newIndoor);
    });
  });
};

// Get list of Indoors
exports.index = function(req, res) {
  Indoor.find(function (err, Indoors) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(Indoors);
  });
};

// Get individual rental court if it's public
exports.getPublic = function(req, res) {
  Indoor.getPublic(req.params.id, function(err, indoor) {
    if(err) { return handleError(res, err); }
    if(!indoor) { console.log('theres no indoor', indoor) }
    return res.status(200).json(indoor);
  })
};

// Query rental courts that's approved and public
exports.queryPublic = function(req, res) {
  Indoor.queryPublic(function(err, indoor) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(indoor);
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}