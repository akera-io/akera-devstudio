angular.module('AkeraDevStudio')
  .controller('CheckSyntaxController', ['$scope', '$mdDialog', function($scope, $mdDialog) {
    $scope.columns = [{name: 'File', field: 'errFile'},
                      {name: 'Row', field: 'errRow', numeric: true},
                      {name: 'Col', field: 'errCol', numeric: true},
                      {name: '#', field: 'errNum', numeric: true},
                      {name: 'Message', field: 'errMsg'}];
    
    $scope.close = function() {
      $mdDialog.hide();
    };
  }]);