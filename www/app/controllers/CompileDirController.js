angular.module('AkeraDevStudio')
  .controller('CompileDirController', ['$scope', '$mdDialog', 'AkeraApiUtil', '$mdToast', 'FileUtil', function($scope, $mdDialog, apiUtil, $mdToast, fileUtil) {
    console.log($scope.selectedNode);
    if ($scope.selectedNode.path.indexOf('/') === 0)
      $scope.selectedNode.path = $scope.selectedNode.path.substring(1);
    $scope.compileFolder = function() {
        apiUtil.compileDir($scope.selectedNode, $scope.recursive, $scope.compileDir).then(function() {
          $mdToast.show($mdToast.simple().content('Compile successful'));
          fileUtil.expandNode(null, $scope.selectedNode).then(function() {
            $mdDialog.cancel();
          });
        }, function(err) {
          if (!err.length) {
            $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || 'Compile failed')));
          } else {
            if (err.length === 0) {
              $mdToast.show($mdToast.simple().content('Compile successful'));
              $mdDialog.cancel();
              return;
            }
            //$mdDialog.cancel();
            var errors = err;
            var chldScope = $scope.$new();
            chldScope.errors = errors;
            $mdDialog.show({
              scope: chldScope,
              controller: 'CheckSyntaxController',
              templateUrl: './app/html/check_syntax_modal.html'
            });
          }
        });
      };
      
      $scope.close = function() {
        $mdDialog.hide();
      };
  }]);