angular.module('AkeraDevStudio')
  .controller('CheckSyntaxController', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    delete $scope.close;
    
    $scope.close = function() {
      $mdDialog.hide();
    };
  }]);