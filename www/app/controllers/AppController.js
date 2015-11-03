angular.module('AkeraDevStudio')
    .controller('AppCtrl', ['$scope', '$mdToast', '$mdSidenav', 'DataStore', 'FileUtil', '$mdDialog', function($scope, $mdToast, $mdSideNav, dataStore, fileUtil, $mdDialog) {
        $scope.editorChanged = function() {
            $scope.fileModified = true;
        }
        dataStore.storeData('brokerName', brokerName);
        brokerName = null;
        $scope.editors = [];
        $scope.$on('fileOpened', function(ev, data) {
            for (var i in $scope.editors) {
                var editor = $scope.editors[i];
                if (editor.file.path === data.path) {
                    $scope.selectedEditor = i;
                    $scope.closeFolderNav();
                    return;
                }
            }
            $scope.editors.push({
                file: data
            });
            $scope.closeFolderNav();
            $scope.selectedEditor = $scope.editors.length - 1;
            if (!$scope.$$phase)
                $scope.$apply();
        })
        $scope.openFolderSideNav = function() {
            $mdSideNav('folderActions').open();
        }

        $scope.closeFolderNav = function() {
            $mdSideNav('folderActions').close();
        }

        $scope.save = function() {
            fileUtil.saveFile(dataStore.getData('brokerName'), $scope.editors[$scope.selectedEditor].file).then(function() {
                $mdToast.show($mdToast.simple().content($scope.editors[$scope.selectedEditor].file.name + ' was successfully saved.'));
            }, function(err) {
                $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || 'There was an error saving changes to ' + $scope.editors[$scope.selectedEditor].file.name)));
            })
        }

        $scope.runProcedure = function() {
            var childScope = $scope.$new();
            childScope.proc = $scope.editors[$scope.selectedEditor].file.path;
            $mdDialog.show({
                templateUrl: './app/html/run_proc_modal.html',
                scope: childScope,
                controller: 'RunProcDialog',
            });
        }

        $scope.closeEditor = function(editor) {
            $scope.editors.splice($scope.editors.indexOf(editor), 1);
        }
    }])
