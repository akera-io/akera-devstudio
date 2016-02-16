angular.module('AkeraDevStudio')
    .controller('CreateFileDialog', ['$scope', 'DataStore', '$mdDialog', 'FileUtil', '$mdToast', '$rootScope', function($scope, dataStore, $mdDialog, fileUtil, $mdToast, $rootScope) {
        $scope.newType = 'Folder';
        $scope.createItem = function() {
            fileUtil.createFile({
                    path: dataStore.getData('selectedFile').$modelValue.path + '/' + $scope.newName,
                    type: $scope.newType.toLowerCase()
                })
                .then(function() {
                    var isRoot = dataStore.getData('selectedFile').title === 'Root';
                    if (isRoot) {
                        fileUtil.requestRootFileStructure()
                            .then(function(result) {
                                dataStore.storeData('fileTree', result);
                            }, function(err) {
                                throw err;
                            });
                    } else {
                        fileUtil.expandNode(dataStore.getData('selectedFile').$modelValue)
                            .then(null, function(err) {
                                throw err
                            });
                    }
                }, function(err) {
                    $mdToast.show($mdToast.simple().content(err.message));
                });

            if ($scope.edit === true) {
                var path = dataStore.getData('selectedFile').$modelValue.path + '/' + $scope.newName;
                if (path.indexOf('/') === 0) {
                  path = path.substring(1);
                }
                $rootScope.$broadcast('fileOpened', {
                    name: $scope.newName,
                    path: path,
                    content: '\n'
                });
            }
            $mdDialog.hide();
        }

        $scope.cancel = function() {
            $mdDialog.cancel();
        }
    }])
