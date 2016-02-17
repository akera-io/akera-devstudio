angular.module('AkeraDevStudio')
  .service('AkeraApiUtil', ['$http', '$q', 'DataStore', function($http, $q, dataStore) {
      
      var runProcedure = function runProcedure(proc, params) {
        var defered = $q.defer();
        var call = {
            procedure: proc,
            parameters: params
        };
        
        var path = dataStore.getData('restApiRoute');
        
        $http.post(path, {
            call: call
        }).success(function(result) {
          defered.resolve(result.parameters);
        }).error(function(err) {
          defered.reject(err);
        });
        
        return defered.promise;
      };
      
      var checkSyntax = function checkSyntax(file) {
        var defered = $q.defer();
        var call = {
            procedure: 'io/akera/rest/fs/checkSyntax.p',
            parameters: [{type: 'input', dataType: 'character', alias: 'path', value: file.isNew ? undefined : file.path},
                         {type: 'input', dataType: 'longchar', alias: 'content', value: file.isNew ? file.content : undefined},
                         {type: 'output', dataType: 'longchar', alias: 'errors'}]
        };
        
        var path = dataStore.getData('restApiRoute');
        $http.post(path, {
            call: call
        }).success(function(result) {
          var errors = JSON.parse(result.parameters[0]).errors;
          if (errors.length > 0)
            defered.reject(errors);
          else
            defered.resolve();
          
        }).error(function(err) {
          defered.reject(err);
        });
        
        return defered.promise;
      };
      
      var compile = function compile(file) {
        var defered = $q.defer();
        var call = {
            procedure: 'io/akera/rest/fs/compile.p',
            parameters: [{type: 'input', dataType: 'character', alias: 'path', value: file.path},
                         {type: 'input', dataType: 'logical', alias: 'recursive', value: false},
                         {type: 'input', dataType: 'character', alias: 'compileDir', value: null},
                         {type: 'output', dataType: 'longchar', alias: 'errors'}]
        };
        
        var path = dataStore.getData('restApiRoute');
        $http.post(path, {
          call: call
        }).success(function(result) {
          var errors = JSON.parse(result.parameters[0]).errors;
          if (errors.length > 0)
            defered.reject(errors);
          else
            defered.resolve();
        }).error(function(err) {
          defered.reject(err);
        });
        return defered.promise;
      };
      
      var compileDir = function compileDir(file, recursive, compileDir) {
        var call = {
            procedure: 'io/akera/rest/fs/compile.p',
            parameters: [{type: 'input', dataType: 'character', alias: 'path', value: file.path},
                         {type: 'input', dataType: 'logical', alias: 'recursive', value: recursive !== undefined ? recursive : false},
                         {type: 'input', dataType: 'character', alias: 'compileDir', value: compileDir || ''},
                         {type: 'output', dataType: 'longchar', alias: 'errors'}]
        };
        
        var path = dataStore.getData('restApiRoute');
        var defered = $q.defer();
        $http.post(path, {
          call: call
        }).success(function(result) {
          var errors = JSON.parse(result.parameters[0]).errors;
          if (errors.length > 0)
            defered.reject(errors);
          else
            defered.resolve();
        }).error(function(err) {
          defered.reject(err);
        });
        return defered.promise;
      };
      
      return {
        runProcedure: runProcedure,
        compile: compile,
        compileDir: compileDir,
        checkSyntax: checkSyntax
      };
  }]);