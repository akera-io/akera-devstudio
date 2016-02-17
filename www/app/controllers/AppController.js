angular.module('AkeraDevStudio')
    .controller('AppCtrl', ['$scope', '$mdToast', '$mdSidenav', 'DataStore', 'FileUtil', '$mdDialog', '$rootScope', '$http', 'AkeraApiUtil', function($scope, $mdToast, $mdSideNav, dataStore, fileUtil, $mdDialog, $rootScope, $http, apiUtil) {
        
      $scope.editorChanged = function(event) {
          var editor = event[1];
            if (editor.isDirrty === undefined && editor.isBeforeInit === undefined) {
              editor.isBeforeInit = false;
              editor.isDirrty = false;
              return;
            }
            if (editor.isDirrty === false) {
              editor.isDirrty = true;
              $scope.editors[$scope.selectedEditor].isDirrty = true;
            }
        };
        
        dataStore.storeData('restApiRoute', restApiRoute);
        dataStore.storeData('restFileRoute', restFileRoute);
        dataStore.storeData('brokerName', brokerName);
        
        restApiRoute = null; 
        restFileRoute = null; 
        
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
                file: data,
                isDirrty: false,
                isBeforeInit: true,
                edId: new Date().getTime()
            });
            $scope.closeFolderNav();
            $scope.selectedEditor = $scope.editors.length - 1;
            if (!$scope.$$phase)
                $scope.$apply();
        });
        
        $scope.newFile = function() {
          $rootScope.$broadcast('fileOpened', {
            name: 'Untitled',
            path: 'N/A',
            content: '\n',
            isNew: true,
            isDir: false
          });
        };
        
        $scope.openFolderSideNav = function() {
            $mdSideNav('folderActions').open();
        };

        $scope.closeFolderNav = function() {
            $mdSideNav('folderActions').close();
        };

        $scope.save = function() {
           var file = $scope.editors[$scope.selectedEditor].file;
           if (file.isNew) {
             $mdDialog.show({
               templateUrl: './app/html/new_file_save_modal.html',
               controller: 'SaveAsController'
             }).then(function(props) {
               file.name = props.name;
               file.path = props.path;

               fileUtil.createFile(file).then(function() {
                 $mdToast.show($mdToast.simple().content(file.name + ' was successfully saved.'));
                 file.isNew = false;
                 $scope.save();
               }, function(err) {
                 $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || file.name + 'could not be saved.')));
               });
             });
           } else {
          fileUtil.saveFile($scope.editors[$scope.selectedEditor].file).then(function() {
              $scope.editors[$scope.selectedEditor].isDirrty = false;
              $mdToast.show($mdToast.simple().content($scope.editors[$scope.selectedEditor].file.name + ' was successfully saved.'));
          }, function(err) {
              $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || 'There was an error saving changes to ' + $scope.editors[$scope.selectedEditor].file.name)));
          });
         }
        };

        $scope.runProcedure = function() {
         var file = $scope.editors[$scope.selectedEditor].file;
          if (file.isNew) {
            $mdDialog.show({
              templateUrl: './app/html/new_file_save_modal.html',
              controller: 'SaveAsController'
            }).then(function(props) {
              file.name = props.name;
              file.path = props.path;
              fileUtil.createFile(file).then(function() {
                $mdToast.show($mdToast.simple().content(file.name + ' was sucessfully saved.'));
                file.isNew = false;
                fileUtil.saveFile(file).then(function() {
                  $scope.runProcedure();
                }, function(err) {
                  $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || file.name + 'could not be saved.')));
                });
              }, function(err) {
                $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || file.name + 'could not be saved.')));
              });
            });           
          } else {
           var childScope = $scope.$new();
            childScope.proc = $scope.editors[$scope.selectedEditor].file.path;
            $mdDialog.show({
                templateUrl: './app/html/run_proc_modal.html',
                scope: childScope,
                controller: 'RunProcDialog',
            });
          }
        };

        $scope.run4Gl = function() {
          
        };
        
        $scope.checkSyntax = function() {
          var file = $scope.editors[$scope.selectedEditor].file;
         
            apiUtil.checkSyntax(file).then(function() {
              $mdToast.show($mdToast.simple().content('Syntax check: OK'));   
          }, function(err) {
            if (!err.length)
              $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || 'There was a problem processing your request.')));
            else {
              var chldScope = $scope.$new();
              chldScope.errors = err;
              $mdDialog.show({
                scope: chldScope,
                controller: 'CheckSyntaxController',
                templateUrl: './app/html/check_syntax_modal.html'
              });
            }
          });
        };
        
        $scope.compile = function() {
          var file = $scope.editors[$scope.selectedEditor].file;
          if (file.isNew) {
            $mdDialog.show({
              templateUrl: 'app/html/new_file_save_modal.html',
              controller: 'SaveAsController'
            }).then(function(props) {
              file.name = props.name;
              file.path = props.path;
              fileUtil.createFile(file).then(function() {
                $mdToast.show($mdToast.simple().content(file.name + ' was sucessfully saved.'));
                file.isNew = false;
                fileUtil.saveFile(file).then(function() {
                  $scope.compile();
                }, function(err) {
                  $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || file.name + 'could not be saved.')));
                });
              }, function(err) {
                $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || file.name + 'could not be saved.')));
              });
            });         
          } else {
            apiUtil.compile(file).then(function() {
              $mdToast.show($mdToast.simple().content('Compile successful'));
              fileUtil.expandNode(file.parent);
            }, function(err) {
              if (!err.length)
                $mdToast.show($mdToast.simple().content(err.data ? err.data.message : (err.message || 'There was a problem processing your request.')));
              else {
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
          }
        };
        
        $scope.closeEditor = function(editor) {
            if (editor.isDirrty === true || editor.file.isNew === true) {
              fileUtil.confirm({
                content: 'Warning: Any unsaved data will be lost!',
                ok: 'OK',
                cancel: 'Cancel'
              }).then(function() {
                $scope.editors.splice($scope.editors.indexOf(editor), 1);
              });
            } else 
              $scope.editors.splice($scope.editors.indexOf(editor), 1);
        };
        
        //If there is an active editor, attempt to save
        //when pressing CTRL + S
        $(document).bind('keydown', function(event) {
          if (!(event.which === 115 && (event.ctrlKey || event.metaKey)) &&
              !(event.which === 19 && (event.ctrlKey || event.metaKey)) && 
              !(event.which === 83 && (event.ctrlKey || event.metaKey)))
            return true;
            event.preventDefault();
            if (!(isNaN($scope.selectedEditor)) && $scope.editors[$scope.selectedEditor]) {
                $scope.save();
            }
          return false;
        });
    }]);
