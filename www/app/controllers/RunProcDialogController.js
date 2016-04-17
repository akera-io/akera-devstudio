angular.module('AkeraDevStudio').controller(
    'RunProcDialog',
    [
        '$scope',
        '$mdToast',
        '$http',
        'DataStore',
        '$mdDialog',
        function($scope, $mdToast, $http, dataStore, $mdDialog) {
          // retrieve run parameters from parent scope if already ran before
          $scope.params = $scope.$parent.runParams
              && $scope.$parent.runParams[$scope.proc] || [];
          $scope.selected = [];
          $scope.datatypes = [ 'CHARACTER', 'DATASET', 'DATE',
                               'DATETIME', 'DECIMAL', 'INTEGER', 'INT64', 'LOGICAL', 'LONGCHAR', 'TABLE' ];

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
              dataType : 'CHARACTER',
              type : 'input',
              value : null
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
            else
              $scope.selected.splice($scope.selected.indexOf(param), 1);
          }

          $scope.validateParams = function() {
            for ( var i in $scope.params) {
              var param = $scope.params[i];
              if (!param.dataType || !param.type
                  || (param.type === 'input' && !param.value)) {
                return false;
              }
            }
            return true;
          }

          $scope.run = function() {
            // save run parameters in parent scope for later calls
            $scope.$parent.runParams = $scope.$parent.runParams || {};
            $scope.$parent.runParams[$scope.proc] = $scope.params;

            var call = {
              procedure : $scope.proc,
              parameters : $scope.params
            };

            var path = dataStore.getData('restApiRoute');

            $http.post(path, {
              call : call
            }).then(
                function(result) {
                  var childScope = $scope.$parent.$new();
                  childScope.output = JSON.stringify(result.data.parameters);

                  var outputParams = [];
                  $scope.params.forEach(function(param, idx) {
                    if (param.type === 'output' || param.type === 'inout')
                      outputParams.push({
                        value : param.value,
                        alias : param.alias || '[' + idx + '] - ' + param.type
                      });
                  });

                  for ( var i in result.data.parameters) {
                    var param = outputParams[i];
                    param.value = param.dataType === 'DATE'
                        || param.dataType === 'DATETIME' ? new Date(
                        result.data.parameters[i]) : result.data.parameters[i];
                  }
                  childScope.params = outputParams;
                  $mdDialog.hide().then(function() {
                    $mdDialog.show({
                      templateUrl : 'app/html/proc_output_modal.html',
                      scope : childScope,
                      controller : 'OutputDialog'
                    });
                  });
                },
                function(err) {
                  console.error(err);
                  $mdToast.show($mdToast.simple().content(
                      err.data.message || err));
                });
          };

          $scope.close = function() {
            $mdDialog.cancel();
          };
        } ]);
