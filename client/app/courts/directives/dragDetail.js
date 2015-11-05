'user strict';

app.directive('dragMe', ['$drag', function($drag){
  return {
    templateUrl: 'app/courts/temp/court.detail.html',
    controller: function($scope, $element) {
      $drag.bind($element, 
        {
          transform: $drag.TRANSLATE_VERTICAL,
          end: function(drag) {
            
            if(drag.distanceY < -100) {
              //Expand the court detail the viewport
              var y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
              drag.reset();
              $element[0].style.height = y + 'px';
              $element[0].style.color = 'white';
              $element[0].style.overflowY = 'scroll';
              $scope.scrolled = true;
              $scope.$apply();

              
            } else if(drag.distanceY > 100) {
              drag.reset();
              $element[0].style.height = '50px';
              $element[0].style.color = 'black';
              $element[0].style.overflowY = 'visible';
              $scope.scrolled = false;
              $scope.$apply();
            } else {
              drag.reset();
            }

          }
        },
        { // release touch when movement is outside bounduaries
          sensitiveArea: $element.parent()
        }
      );
    }
  };
}]);