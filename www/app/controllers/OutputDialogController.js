angular.module('AkeraDevStudio')
    .controller('OutputDialog', ['$scope', '$mdDialog', function($scope, $mdDialog) {
        $scope.close = function() {
            $mdDialog.hide();
        };

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }]);
