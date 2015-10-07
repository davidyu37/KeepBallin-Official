'use strict';

angular.module('keepballin')
  .controller('TeamSignUpCtrl', function () {
  	// '$scope','$timeout' ,'Auth', 'User', 'Team', 'Upload'
    // we will store all of our form data in this object
 //    $scope.formData = {};
 //    // Empty object for coach
 //    $scope.coach = {};
 //    $scope.availablePeople = User.searchParams();
    
 //    $scope.preview = '';
 //    $scope.load = false;

 //    // function to process the form
 //    $scope.processForm = function() {
 //        console.log($scope.formData);
 //        Team.save($scope.formData);
 //        $scope.formData = {};
 //    };
    
 //    //Picture user selects
 //    $scope.picture ='';
 //    //Upload on select
 //    $scope.upload = function(file) {
 //    	if (file && !file.$error) {
	//     	$scope.load = true;
	//     	Upload.upload({
	//             url: 'api/uploads/pictures/teampic',
	//             file: file
	//         }).progress(function () {
	            
	//         }).success(function (data, status, headers, config) {
	//             $timeout(function() {
	//                console.log(data._id);
	//                $scope.formData.teampic = data._id;
	//                $scope.preview = data.url;
	//                $scope.load = false;
	//             });
	//         });	
 //    	}
 //    };
 //    //Empty object for a new member
 //    $scope.member = {};
 //    $scope.formData.members = [];
 //    //Preview list of members
 //    $scope.list = [];
	// //Add member to members and send with form data    
 //    $scope.addMember = function(member) {

 //    	if(member) {
 //    		if(checkMember(member, $scope.list)) {
 //    			return
 //    		} else {
	// 	        $scope.formData.members.push(member._id);
	// 	        $scope.list.push(member);
	// 	        console.log(member);
 //    		}
 //    	} else {
 //    		return
 //    	}
 //    };

 //    function checkMember(member, list) {
 //    	if(list.length) {
	//     	for(var i=0; i < list.length; i++) {
	//     		if (list[i]._id === member._id) {
	//     			return true
	//     		} else {
	//     			return false
	//     		}
	//     	}
 //    	} else {
 //    		return false
 //    	}
 //    };

  });//TeamSignUpCtrl ends