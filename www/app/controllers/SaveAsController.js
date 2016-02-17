angular.module('AkeraDevStudio')
  .controller('SaveAsController', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    
    $scope.save = function() {
      if ($scope.path.indexOf('/') === 0)
        $scope.path = $scope.path.substring(1);
      if ($scope.path.indexOf('/') !== $scope.path.length - 1)
          $scope.path += '/';
        if ($scope.path.substring($scope.path.length - $scope.name.length) !== $scope.name)
          $scope.path += $scope.name;
        
        
       $mdDialog.hide({
         name: $scope.name,
         path: $scope.path
         });
       };
  }]);
  