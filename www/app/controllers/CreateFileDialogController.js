angular.module('AkeraDevStudio')
    .controller('CreateFileDialog', ['$scope', 'DataStore', '$mdDialog', 'FileUtil', '$mdToast', '$rootScope', function($scope, dataStore, $mdDialog, fileUtil, $mdToast, $rootScope) {
        $scope.newType = 'Folder';
        $scope.createItem = function() {
            fileUtil.createFile(dataStore.getData('brokerName'), {
                    path: dataStore.getData('selectedFile').$modelValue.path + '/' + $scope.newName,
                    type: $scope.newType.toLowerCase()
                })
                .then(function() {
                    var isRoot = dataStore.getData('selectedFile').title === 'Root';
                    if (isRoot) {
                        fileUtil.requestRootFileStructure(dataStore.getData('brokerName'))
                            .then(function(result) {
                                dataStore.storeData('fileTree', result);
                            }, function(err) {
                                throw err;
                            });
                    } else {
                        fileUtil.expandNode(dataStore.getData('brokerName'), dataStore.getData('selectedFile').$modelValue)
                            .then(null, function(err) {
                                throw err
                            });
                    }
                }, function(err) {
                    $mdToast.show($mdToast.simple().content(err.message));
                });

            if ($scope.edit === true)
                $rootScope.$broadcast('fileOpened', {
                    name: $scope.newName,
                    path: dataStore.getData('selectedFile').$modelValue.path + $scope.newName,
                    content: '\n'
                });
            $mdDialog.hide();
        }

        $scope.cancel = function() {
            $mdDialog.cancel();
        }
    }])
