angular.module('AkeraDevStudio')
    .controller("FileExplorer", ['$scope', '$rootScope', 'DataStore', '$mdToast', '$mdDialog', 'FileUtil', function($scope, $rootScope, dataStore, $mdToast, $mdDialog, fileUtil) {
        $scope.$on('treeChanged', function() {
            $scope.data = dataStore.getData('fileTree');
        });

        if (dataStore.brokerConfigured === true) {
            fileUtil.requestRootFileStructure().then(function(tree) {
                $scope.data = tree;
                dataStore.storeData('fileTree', $scope.data);
            }, function(err) {
                $mdToast.show($mdToast.simple().content(err.message || 'There was an error getting the server file structure.'));
            });
        }
        
        $scope.newType = 'Folder';

        $scope.edit = function(scope) {
            fileUtil.requestFileContent(scope.$modelValue.path).then(function(response) {
                $rootScope.$broadcast('fileOpened', {
                    name: scope.$modelValue.title,
                    content: response || '\n',
                    path: scope.$modelValue.path,
                    parent: scope.$modelValue.parent
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
                fileUtil.expandNode(scope.$modelValue).then(function(result) {
                  dataStore.storeData('fileTree', $scope.data);
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
            }).then(function() {
              dataStore.storeData('fileTree', $scope.data);
            });
        }

        $scope.removeItem = function(scope) {
          fileUtil.confirm({
            content: 'Are you sure you want to delete \"' + scope.$modelValue.title + '\"?',
            ok: 'Yes',
            cancel: 'No',
            title: 'Confirm Delete'
          }).then(function() {
              fileUtil.deleteFile(scope.$modelValue).then(function() {
                  scope.remove();
                  $mdToast.show($mdToast.simple().content(scope.$modelValue.title + ' sucessfully deleted.'));
                  //dataStore.storeData('fileTree', $scope.data);
              }, function(err) {
                  $mdToast.show($mdToast.simple().content('There was an error deleting ' + scope.$modelValue.title));
              });
          });
        }
        
        $scope.showCompileMenu = function(node, event, menuFn) {
            $scope.compileMenuAction = function() {
             var chldScope = $scope.$new();
              chldScope.selectedNode = node;
              $mdDialog.show({
                templateUrl: './app/html/compile_dir_modal.html',
                controller: 'CompileDirController',
                scope: chldScope
              }).then(function(err) {
                if (err) {
                  var errors = err;
                  var chld = $scope.$new();
                  chld.errors = errors;
                  chld.isDir = true;
                  $mdDialog.show({
                    scope: chld,
                    controller: 'CheckSyntaxController',
                    templateUrl: './app/html/check_syntax_modal.html'
                  });
                }
              });
            };
            menuFn(event);
        };
    }]);
