/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Court = require('../api/court/court.model');
var Upload = require('../api/upload/upload.model');
var Comment = require('../api/comment/comment.model');
var Rating = require('../api/rating/rating.model');

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

var random = randomDate(new Date(1950, 0, 1), new Date());


Rating.find({}).remove(function() {
  console.log('ratings cleared');
});

Upload.find({}).remove(function() {
  console.log('uploads cleared');
});

Comment.find({}).remove(function() {
  console.log('cleared comments');
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    role: 'manager',
    name: '林小胖',
    email: 'fat@fat.com',
    password: 'fat',
    position: 'C-中鋒',
    jerseynumber: 65,
    height: 170,
    weight: 80,
    birthday: new Date('01/01/1990')
  },
  {
    provider: 'local',
    name: '鐘高個',
    email: 'tall@tall.com',
    password: 'tall',
    position: 'PF-大前鋒',
    jerseynumber: 80,
    height: 193,
    weight: 100,
    birthday: new Date('04/01/1990')
  },
  {
    provider: 'local',
    name: '陳細哥',
    email: 'skinny@skinny.com',
    password: 'skinny',
    position: 'PG-控球後衛',
    jerseynumber: 12,
    height: 183,
    weight: 60,
    birthday: new Date('05/23/1990')
  },
  {
    provider: 'local',
    name: '林小支',
    email: 'small@small.com',
    password: 'small',
    position: 'SG-得分後衛',
    jerseynumber: 23,
    height: 175,
    weight: 69,
    birthday: new Date('05/23/1990')
  },
  {
    provider: 'local',
    name: '尼大大',
    email: 'big@big.com',
    password: 'big',
    position: 'SF-小前鋒',
    jerseynumber: 43,
    height: 190,
    weight: 80,
    birthday: new Date('05/23/1990')
  },
  {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});

Court.find({}).remove(function() {
  Court.create({
    country: 'Taiwan',
    court: '台北科技大學',
    city: '台北市',
    district: '大安區',
    lat: 25.043204,
    long: 121.537544,
    address: '106台北市大安區建國南路一段81號',
    desc: '偶爾辦系隊比賽',
    hours: {begin: new Date('January 01, 1990 07:00:00'), end: new Date('January 01, 1990 22:00:00')},
    peaktime: {begin: new Date('January 01, 1990 18:00:00'), end: new Date('January 01, 1990 20:00:00')},
    net: true,
    nettype: '繩網',
    basketnumber: 11,
    floor: '水泥地',
    water: {exist: true, desc: '在宿舍旁'},
    toilet: {exist: false},
    ceiling: false,
    lights: true,
    likes: 300,
    bench: true,
    rent: false
  }, function() {
      console.log('finished populating mapMarker');
    }
  );
});

