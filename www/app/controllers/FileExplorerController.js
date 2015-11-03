angular.module('AkeraDevStudio')
    .controller("FileExplorer", ['$scope', '$rootScope', 'DataStore', '$mdToast', '$mdDialog', 'FileUtil', function($scope, $rootScope, dataStore, $mdToast, $mdDialog, fileUtil) {
        $scope.$on('treeChanged', function() {
            $scope.data = dataStore.getData('fileTree');
        });

        if (dataStore.brokerConfigured === true) {
            fileUtil.requestRootFileStructure(dataStore.getData('brokerName')).then(function(tree) {
                $scope.data = tree;
                dataStore.storeData('fileTree', $scope.data);
            }, function(err) {
                $mdToast.show($mdToast.simple().content(err.message || 'There was an error getting the server file structure.'));
            });
        }

        $scope.newType = 'Folder';

        $scope.edit = function(scope) {
            fileUtil.requestFileContent(dataStore.getData('brokerName'), scope.$modelValue.path).then(function(response) {
                $rootScope.$broadcast('fileOpened', {
                    name: scope.$modelValue.title,
                    content: response,
                    path: scope.$modelValue.path
                });
            }, function(err) {
                $mdToast.show($mdToast.simple().content('There was an error getting contents of file ' + scope.$modelValue.title));
            });
        }

        $scope.toggleTreeItem = function(scope) {
            if (scope.$modelValue.type === 'file') {
                $scope.edit(scope);
                return;
            }

            if (scope.collapsed) {
                fileUtil.expandNode(dataStore.getData('brokerName'), scope.$modelValue).then(function(result) {
                }, function(err) {
                    $mdToast.show($mdToast.simple().content(err.message || 'There was an error getting contents of the ' + scope.$modelValue.title + ' directory.'));
                });
            }
            scope.toggle();
        }

        $scope.newSubItem = function(scope) {
            dataStore.storeData('selectedFile', scope);
            $mdDialog.show({
                templateUrl: './app/html/new_item_modal.html',
                parent: document.getElementById('folderNav'),
                controller: 'CreateFileDialog',
            });
        }

        $scope.removeItem = function(scope) {
            fileUtil.deleteFile(dataStore.getData('brokerName'), scope.$modelValue).then(function() {
                scope.remove();
                $mdToast.show($mdToast.simple().content(scope.$modelValue.title + ' sucessfully deleted.'));
            }, function(err) {
                $mdToast.show($mdToast.simple().content('There was an error deleting ' + $scope.file.name));
            });
        }
    }])
