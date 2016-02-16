angular.module('AkeraDevStudio').service('FileUtil',
    [ '$http', '$q', 'DataStore', function($http, $q, dataStore) {
      var data = {};

      var getFilePath = function(node) {
        var path = node.$modelValue.title;
        var parentNode = node;
        while (parentNode) {
          parentNode = parentNode.$parentNodeScope;
          if (parentNode)
            path += '/' + parentNode.$modelValue.title;
        }
        var nds = path.split('/');
        nds.reverse();
        path = '';
        for ( var i in nds) {
          if (nds[i] !== 'Root') {
            path += nds[i];
            if (i < (nds.length - 1))
              path += '/';
          }
        }
        return path;
      }

      var convertFileStructure = function(struct, parent) {
        var nodes = [];
        struct.forEach(function(itm) {
          var converted = {
            path : itm.path || '/' + itm.name,
            type : itm.type || (itm.isDir ? 'folder' : 'file'),
            title : itm.name || itm.title,
            parent : parent
          };
          nodes.push(converted);
        });
        return nodes;
      }

      var requestRootFileStructure = function() {
        var rootNode = [];
        rootNode.push({
          title : 'Root',
          type : 'folder',
          path : '/'
        });
        var deferred = $q.defer();
        requestFileStructure('/').then(function(result) {
          rootNode[0].nodes = result;
          deferred.resolve(result);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

      var requestFileStructure = function(path) {
        var deferred = $q.defer();
        $http.get(getFileRestPath(path)).success(function(result) {
          deferred.resolve(convertFileStructure(result));
        }).error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

      var expandNode = function(struct, node) {
        var deferred = $q.defer();
        requestFileStructure(struct.path).then(function(result) {
          struct.nodes = convertFileStructure(result, struct);
          deferred.resolve(struct);
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

      var requestFileContent = function(path) {
        var deferred = $q.defer();
        $http.get(getFileRestPath(file)).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

      var createFile = function(file) {
        var deferred = $q.defer();
        $http.put(getFileRestPath(file), {
          isDir : file.type === 'folder'
        }).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

      var saveFile = function(file) {
        var deferred = $q.defer();
        $http.post(getFileRestPath(file), {
          content : file.content
        }).success(function(result) {
          requestRootFileStructure().then(function(tree) {
            dataStore.storeData('fileTree', tree);
            deferred.resolve(result);
          }, function(err) {
            deferred.resolve(result);
          });
        }).error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

      var deleteFile = function(file) {
        var deferred = $q.defer();
        $http['delete'](getFileRestPath(file)).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }

      var baseDir = function(file) {
        var name = file.name;
        var path = file.path;
        if (path.indexOf(name) >= 0) {
          path = path.substring(0, path.length - name.length - 1);
        }
        return path;
      }

      var getNode = function(baseNode, path) {
        var nodes = baseNode.nodes;
        for (var i = 0; i < nodes.length; i++) {
          var nd = nodes[i];
          if (nd.path === path) {
            return nd;
          }
        }
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[i];
          return getNode(n, path);
        }
        return null;
      }

      var getFileRestPath = function(file) {
        var restPath = dataStore.getData('restFileRoute');

        if (file) {
          file = file.path || file;

          if (file.indexOf('/') !== -1)
            restPath += file.substring(1);
          else
            restPath += file;
        }

        return restPath;
      }

      return {
        getFilePath : getFilePath,
        expandNode : expandNode,
        requestRootFileStructure : requestRootFileStructure,
        requestFileStructure : requestFileStructure,
        requestFileContent : requestFileContent,
        createFile : createFile,
        saveFile : saveFile,
        deleteFile : deleteFile,
        baseDir : baseDir,
        getNode : getNode
      };
    } ]);
