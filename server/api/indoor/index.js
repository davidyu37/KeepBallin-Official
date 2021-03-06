'use strict';

var express = require('express');
var controller = require('./indoor.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

//Create rental court
router.post('/', auth.isAuthenticated(), controller.create);
//View the edit page of the rental court
router.get('/:id/getPopulated', auth.isAuthenticated(), controller.getPopulated);
//View individual rental court, anyone can view
router.get('/:id/getPublic', controller.getPublic);
//View all the rental courts
router.get('/', auth.hasRole('admin'), controller.index);
//Query rental courts that's public and approved
router.get('/all/queryPublic', controller.queryPublic);
//Get ratings
router.get('/:id/getRating', controller.getRating);
//Update the rental court info
router.put('/:id', auth.isAuthenticated(), controller.update);
//Update creator of the court
router.put('/:id/changeCreator', auth.hasRole('admin'), controller.changeCreator);
//Upload pictures
router.post('/pictures', auth.isAuthenticated(), controller.upload);
//Delete pictures
router.post('/:id/deletePicture', auth.isAuthenticated(), controller.deletePic);
//Set cover photo
router.post('/:id/setCover', auth.isAuthenticated(), controller.setCover);
//Close timeslots
router.post('/:id/closeTimeslot', auth.isAuthenticated(), controller.closeTimeslot);

module.exports = router;
