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
var Conversation = require('../api/conversation/conversation.model');
var Event = require('../api/event/event.model');
var Team = require('../api/team/team.model');
var Lobby = require('../api/lobby/lobby.model');
var Invite = require('../api/invite/invite.model');
var Global = require('../api/global/global.model');
var Indoor = require('../api/indoor/indoor.model');
var Timeslot = require('../api/timeslot/timeslot.model');
var Point = require('../api/point/point.model');

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

var random = randomDate(new Date(1950, 0, 1), new Date());

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
    role: 'vip',
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
    password: 'admin',
    lineProfilepic: 'http://dl.profile.line-cdn.net/0m029f953b72517ab944945e27c637754c1ef7c371ea2b',
    line: {
      pictureUrl: "http://dl.profile.line-cdn.net/0m029f953b72517ab944945e27c637754c1ef7c371ea2b",
      mid: "u3fd615cf13008a22715f42a19029fd59",
      displayName: "David Yu"
    }
  }, function() {
      console.log('finished populating users');
      User.findOne({ name: 'Admin'}, function(err, user) {
        Point.create({Points: 100000, User: user._id}, function(err, point) {
          console.log('points added to', user.name);
        });
      });
    }
  );
});

Indoor.find({}).remove(function() {
  var start = new Date(2016, 6, 5, 9, 0, 0, 0);
  var end = new Date(2016, 6, 5, 21, 0, 0, 0);
  Indoor.create({
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
    bench: true,
    rentprice: 2000,
    perPersonPrice: 200,
    views: 0,
    minCapacity: 10,
    maxCapacity: 20,
    hoursBeforeReserve: 5,
    isPublic: true,
    approved: true,
    telnumber: '02-29384938',
    hours : {
      "sunday" : {
        "isOpen" : true,
        "end" : end,
        "begin" : start,
        "day" : "sunday"
      },
      "saturday" : {
        "isOpen" : true,
        "end" : end,
        "begin" : start,
        "day" : "saturday"
      },
      "friday" : {
        "isOpen" : true,
        "end" : end,
        "begin" : start,
        "day" : "friday"
      },
      "thursday" : {
        "isOpen" : true,
        "end" : end,
        "begin" : start,
        "day" : "thursday"
      },
      "wednesday" : {
        "isOpen" : true,
        "end" : end,
        "begin" : start,
        "day" : "wednesday"
      },
      "tuesday" : {
        "isOpen" : true,
        "end" : end,
        "begin" : start,
        "day" : "tuesday"
      },
      "monday" : {
        "isOpen" : true,
        "end" : end,
        "begin" : start,
        "day" : "monday"
      }
    }
  }, function(err, data) {
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
            rent: false,
            canRent: true,
            indoorId: data._id
          }, function() {
              console.log('finished populating mapMarker');
            }
        );//Court create ends
      });//Court remove ends
    }//Indoor create cb
  );//Indoor create ends
});



Global.find({}).remove(function() {
  console.log('Global cleared');
});

Timeslot.find({}).remove(function() {
  console.log('Timeslot cleared');
});

Invite.find({}).remove(function() {
  console.log('Invites cleared');
});

Lobby.find({}).remove(function() {
  console.log('Lobby cleared');
});

Conversation.find({}).remove(function() {
  console.log('conversation cleared');
});

Rating.find({}).remove(function() {
  console.log('ratings cleared');
});

Upload.find({}).remove(function() {
  console.log('uploads cleared');
});

Comment.find({}).remove(function() {
  console.log('cleared comments');
});




