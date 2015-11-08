'use strict';
 
angular.module('keepballin')
  .controller('CommentCtrl', ['$scope', '$q', 'socket','Comment', 'Auth', 'CommentSource', function ($scope, $q, socket, Comment, Auth, CommentSource) {
    $scope.newComment = '';
  
    $scope.userNow = Auth.getCurrentUser();

    $scope.profile = 'app/profile/profile.html';

    function checkAllComments(courtId) {
      var deferred = $q.defer();
      Comment.query({courtId: courtId},function(comments) {
          if(comments.length) {
              deferred.resolve(comments.length);
          } else {
            deferred.reject();
          }
      });
      return deferred.promise;
    }
    
    $scope.comments = {};
    var check = checkAllComments($scope.currentcourt._id);
    check.then(function(length) {
      $scope.comments = new CommentSource($scope.currentcourt._id, length);
    });

    $scope.infiniteScrollContainer = document.getElementById('commentContainer');

    // Clean up listeners when the controller is destroyed
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('comment');
    });
 
    // Add comments only if there's a current court
    $scope.addComment = function(event) {

      if(!$scope.currentcourt) {
        return;
      } else {
        var courtID = $scope.currentcourt._id;
        var data = {
          courtId: courtID,
          content: $scope.newComment
        };
        Comment.save(data, function() {
          $scope.newComment = '';
          var check = checkAllComments(courtID);
          check.then(function(length) {
            //Create new comments
            $scope.comments = new CommentSource(courtID, length);
            //Load new comments
            $scope.comments.nextPage();
            //Refocus onto the text area
            event.currentTarget[0].focus();
          });
        });
      }
    };

    //Clear text area
    $scope.clear = function() {
      $scope.newComment = '';
    };

  }]); //CommentCtrl ends