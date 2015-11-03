angular.module('AkeraDevStudio')
    .service('FileUtil', ['$http', '$q', function($http, $q) {
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
            for (var i in nds) {
                if (nds[i] !== 'Root') {
                    path += nds[i];
                    if (i < (nds.length - 1)) path += '/';
                }
            }
            return path;
        }

        var convertFileStructure = function(struct) {
            var nodes = [];
            struct.forEach(function(itm) {
                console.log(itm);
                var converted = {
                    path: itm.path || '/' + itm.name,
                    type: itm.type || (itm.isDir ? 'folder' : 'file'),
                    title: itm.name || itm.title
                }
                nodes.push(converted);
            });
            return nodes;
        }

        var requestRootFileStructure = function(brokerName) {
            var rootNode = [];
            rootNode.push({
                title: 'Root',
                type: 'folder',
                path: '/'
            });
            var deferred = $q.defer();
            requestFileStructure(brokerName, '/').then(function(result) {
                rootNode[0].nodes = result;
                deferred.resolve(result);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        var requestFileStructure = function(brokerName, path) {
            var deferred = $q.defer();
            $http.get('../../rest/' + brokerName + '/file' + (path.indexOf('/') === 0 ? '' : '/') + path)
                .success(function(result) {
                    deferred.resolve(convertFileStructure(result));
                })
                .error(function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        var expandNode = function(brokerName, struct, node) {
            var deferred = $q.defer();
            requestFileStructure(brokerName, struct.path).then(function(result) {
                struct.nodes = convertFileStructure(result);
                deferred.resolve(struct);
            }, function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        var requestFileContent = function(brokerName, path) {
            var deferred = $q.defer();
            $http.get('../../rest/' + brokerName + '/file' + (path.indexOf('/') === 0 ? '' : '/') + path)
                .success(function(result) {
                    deferred.resolve(result);
                })
                .error(function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        var createFile = function(brokerName, file) {
            var deferred = $q.defer();
            console.log(file);
            $http.put('../../rest/' + brokerName + '/file' + (file.path.indexOf('/') === 0 ? '' : '/') + file.path, {
                    isDir: file.type === 'folder'
                })
                .success(function(result) {
                    deferred.resolve(result);
                })
                .error(function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        var saveFile = function(brokerName, file) {
            var deferred = $q.defer();
            $http.post('../../rest/' + brokerName + '/file' + (file.path.indexOf('/') === 0 ? '' : '/') + file.path, {
                    content: file.content
                })
                .success(function(result) {
                    deferred.resolve(result);
                })
                .error(function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        var deleteFile = function(brokerName, file) {
            var deferred = $q.defer();
            $http.delete('../../rest/' + brokerName + '/file' + (file.path.indexOf('/') === 0 ? '' : '/') + file.path)
                .success(function(result) {
                    deferred.resolve(result);
                })
                .error(function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }

        return {
            getFilePath: getFilePath,
            expandNode: expandNode,
            requestRootFileStructure: requestRootFileStructure,
            requestFileStructure: requestFileStructure,
            requestFileContent: requestFileContent,
            createFile: createFile,
            saveFile: saveFile,
            deleteFile: deleteFile
        }
    }]);
