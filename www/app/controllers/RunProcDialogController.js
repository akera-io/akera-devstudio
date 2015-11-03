angular.module('AkeraDevStudio')
    .controller('RunProcDialog', ['$scope', '$mdToast', '$http', 'DataStore', '$mdDialog', function($scope, $mdToast, $http, dataStore, $mdDialog) {
        $scope.params = [];
        $scope.selected = [];
        var datatypes = ['CHARACTER', 'LOGICAL', 'INTEGER', 'INT64', 'DATE', 'DATETIME', 'LONGCHAR', 'DECIMAL'];
        $scope.columns = [{
            name: 'Alias'
        }, {
            name: 'Data Type'
        }, {
            name: 'Value'
        }, {
            name: 'Type'
        }];
        $scope.getDataTypes = function(text) {
            var results = [];
            datatypes.forEach(function(dt) {
                if (dt.indexOf(text.toUpperCase()) >= 0)
                    results.push(dt);
            });
            return results;
        }
        $scope.addParam = function() {
            var newParam = {
                dataType: 'CHARACTER',
                type: 'input'
            };
            $scope.params.push(newParam);
        }

        $scope.removeParams = function() {
            $scope.selected.forEach(function(param) {
                $scope.params.splice($scope.params.indexOf(param), 1);
            });
            $scope.selected = [];
        }

        $scope.updateSelection = function(param) {
            if (param.selected)
                $scope.selected.push(param);
            else $scope.selected.splice($scope.selected.indexOf(param), 1);
        }

        $scope.validateParams = function() {
            for (var i in $scope.params) {
                var param = $scope.params[i];
                if (!param.dataType || !param.type || (param.type === 'input' && !param.value)) {
                    return false;
                }
            }
            return true;
        }

        $scope.run = function() {
            if (!$scope.validateParams()) {
                $mdToast.show($mdToast.simple().content('Cannot run because some parameters are not correctly configured.'));
                return;
            }
            var call = {
                procedure: $scope.proc,
                parameters: $scope.params
            };

            $http.post('../../rest/' + dataStore.getData('brokerName') + '/api', {
                call: call
            }).then(function(result) {
                var childScope = $scope.$parent.$new();
                childScope.output = JSON.stringify(result.data.parameters);

                var outputParams = [];
                $scope.params.forEach(function(param) {
                    if (param.type === 'output')
                        outputParams.push(param);
                });

                for (var i in result.data.parameters) {
                    outputParams[i].value = result.data.parameters[i];
                }
                childScope.params = outputParams;
                $mdDialog.hide().then(function() {
                    $mdDialog.show({
                        templateUrl: 'app/html/proc_output_modal.html',
                        scope: childScope,
                        controller: 'OutputDialog'
                    });
                });
            }, function(err) {
                $mdToast.show($mdToast.simple().content(err.data.message || err));
            });
        };

        $scope.close = function() {
            $mdDialog.cancel();
        };
    }]);
