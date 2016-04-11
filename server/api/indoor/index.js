'use strict';

var express = require('express');
var controller = require('./indoor.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

//Create rental court
router.post('/', auth.isAuthenticated(), controller.create);
//View the edit page of the rental court
router.get('/:id', auth.isAuthenticated(), controller.show);
//Update the rental court info
router.put('/:id', auth.isAuthenticated(), controller.update);

module.exports = router;
