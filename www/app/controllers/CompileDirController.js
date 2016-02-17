angular.module('AkeraDevStudio')
  .controller('CompileDirController', ['$scope', '$mdDialog', 'AkeraApiUtil', '$mdToast', 'FileUtil', function($scope, $mdDialog, apiUtil, $mdToast, fileUtil) {
    if ($scope.selectedNode.path.indexOf('/') === 0)
      $scope.selectedNode.path = $scope.selectedNode.path.substring(1);
    
    $scope.recursiveCompile = false;
    
    $scope.compileFolder = function() {
        apiUtil.compileDir($scope.selectedNode, $scope.recursiveCompile, $scope.compileDir).then(function() {
          $mdToast.show($mdToast.simple().content('Compile successful'));
          fileUtil.expandNode($scope.selectedNode).then(function() {
            $mdDialog.cancel();
          });
        }, function(err) {
          if (!err.length || err.length === 0) {
            $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || 'Compile failed')));
            $mdDialog.cancel();
          } else {
            $mdDialog.hide(err);
          }
        });
      };
      
      $scope.ok = function() {
        $mdDialog.hide();
      };
  }]);