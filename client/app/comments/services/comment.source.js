'use strict';

angular.module('keepballin')
.factory('CommentSource', ['$http', 'Comment', 'socket', function($http, Comment, socket) {
    var CommentSource = function(courtID, totalComments) {
    this.comments = [];
    this.busy = false;
    this.after = 0;
    this.courtID = courtID;
    this.totalComments = totalComments;
    this.commentsLoaded = 0;
  };

  CommentSource.prototype.nextPage = function() {
    if (this.busy) {return;}
    //If the comments are complete loaded, don't make request
    if (this.commentsLoaded >= this.totalComments) {return;}
    this.busy = true;
    Comment.query({index: this.after, courtId: this.courtID}, function(comments) {
        for (var i = 0; i < comments.length; i++) {
            this.comments.push(comments[i]);
        }
        this.after =  this.comments.length - 1;
        this.busy = false;
        this.commentsLoaded += this.comments.length;

        socket.syncUpdates('comment', this.comments, function(event, comment, comments) {
        // This callback is fired after the comments array is updated by the socket listeners

            // sort the array every time its modified
            comments.sort(function(a, b) {
              a = new Date(a.date);
              b = new Date(b.date);
              return a>b ? -1 : a<b ? 1 : 0;
            });//comments sort ends
        });//syncUpdates ends
        
    }.bind(this));
  };

  return CommentSource;
  
}]);