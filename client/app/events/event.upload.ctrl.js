'use strict';

angular.module('keepballin')
	.controller('EventUploadCtrl', ['$scope', '$window', 'Upload', 'Download', '$timeout', 'socket', 'Lightbox', 'Auth', 'thisEvent', function ($scope, $window, Upload, Download, $timeout, socket, Lightbox, Auth, thisEvent) {
    
    //Log is the progress percentage for upload, empty the courtinfos for other previews
    $scope.log = 0;
    //Clear the preview pictures
    $scope.clearPreview = function() {
        $scope.files = null;
    };
    //Submit pictures
    $scope.submit = function(form) {
      if (form.courtpic.$valid && $scope.files && !$scope.files.$error) {
        $scope.upload($scope.files);
      } else {
        $window.alert('請加檔案');
      }
    };
    
    //Go through the files' array and upload
    $scope.upload = function (files) {        
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

    $scope.uploadCount = 0;

    function upload(file) {
        Upload.upload({
            url: 'api/uploads/pictures/eventpic',
            fields: {
                'eventId': thisEvent._id
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
            // $scope.$emit('eventPicUploaded');
        });
    }

}]);