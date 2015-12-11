'use strict';

angular.module('keepballin')
	.controller('uploadCtrl', ['$scope', '$window', 'Upload', 'Download', '$timeout', 'socket', 'Lightbox', 'Auth', function ($scope, $window, Upload, Download, $timeout, socket, Lightbox, Auth) {
    
    //Log is the progress percentage for upload, empty the courtinfos for other previews
    $scope.log = 0;
    //Clear the preview pictures
    $scope.clearPreview = function() {
        console.log('cleared');
        $scope.files = null;
    };
    //Submit pictures
    $scope.submit = function(form) {
      if (form.courtpic.$valid && $scope.files && !$scope.files.$error) {
        $scope.upload($scope.files, form.courtId);
      } else {
        return;
      }
    };
    
    //Go through the files' array and upload
    $scope.upload = function (files, courtId) {        
        $scope.uploading = true;
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                upload(file, courtId);     
                }
            }
        }
    };

    $scope.uploadCount = 0;

    function upload(file, courtId) {
        console.log(courtId);
        Upload.upload({
            url: 'api/uploads/pictures',
            fields: {
                'courtId': courtId
            },
            file: file
        }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.log = progressPercentage;
        }).success(function () {
            //Clear the files for more uploads
            $scope.uploadCount += $scope.files.length;
            $scope.files = [];
            //Reset the progress bar
            $scope.log = 0;
            $scope.uploading = false;
            $scope.$emit('courtPicUploaded');
        });
    }

    /* For profile picture stuff */
    //Profile pic
    $scope.newpic = '';
    //Loading
    $scope.loading = false;

    $scope.userNow = Auth.getCurrentUser();

    $timeout(function(){
        if(!Auth.getCurrentUser().avatar) {
            if(Auth.getCurrentUser().fbprofilepic) {
                $scope.profilenow = Auth.getCurrentUser().fbprofilepic;
            } else {
                $scope.profilenow = 'assets/images/profile/profile.jpg';
            }
        } else {
            if(Auth.getCurrentUser().avatar !== undefined) {
                $scope.profilenow = Auth.getCurrentUser().avatar.url;
            }
        }
    },1000);

    //Upload for profile picture
    $scope.uploadprofile = function(file) {  
      if (file && !file.$error) {
        
        Upload.upload({
            url: 'api/uploads/pictures/profile',
            file: file
        }).progress(function () {
            $scope.loading = true;
        }).success(function (data) {
            $timeout(function() {
                $scope.profilenow = data.url;
                $scope.loading = false;
            });
        });
      }      
    };

    //Upload for team picture
    $scope.uploadTeam = function(files) {
        var upload = function(file) {
          if (file) {
        
            Upload.upload({
                url: 'api/uploads/pictures/teampic',
                fields: {
                    'teamId': $scope.team._id
                },
                file: file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.log = progressPercentage;
            }).success(function () {
                //Clear the files for more uploads
                $scope.uploadCount += $scope.files.length;
                $scope.files = [];
                //Reset the progress bar
                $scope.log = 0;
                $scope.uploading = false;
                $scope.$emit('teamPicUploaded');
            });
          }        
        };

        $scope.uploading = true;
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
                if (!file.$error) {
                    upload(file);     
                }
            }
        }
    };



}]);