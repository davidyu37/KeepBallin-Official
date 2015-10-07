'use strict';

var express = require('express');
var controller = require('./upload.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/pictures', controller.index);
router.get('/pictures/:court', controller.getCourtPics);
router.post('/pictures', auth.isAuthenticated(), controller.createCourtPic);
router.delete('/pictures/:id', auth.hasRole('admin') || auth.hasRole('manager'), controller.destroy);
router.post('/pictures/profile', auth.isAuthenticated(), controller.profilepic);
// router.post('/pictures/teampic', auth.isAuthenticated(), controller.teampic);

module.exports = router;