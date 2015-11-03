angular.module('AkeraDevStudio')
    .service('DataStore', ['$rootScope', function($rootScope) {
        return {
            data: [],
            storeData: function(key, value) {
                this.data[key] = value;
                switch (key) {
                    case 'fileContent':
                        {
                            $rootScope.$broadcast('fileChanged');
                            $rootScope.editorChanged = false;
                            break;
                        }
                    case 'fileTree':
                        {
                            $rootScope.$broadcast('treeChanged');
                            break;
                        }
                    case 'brokerName':
                        {
                            $rootScope.$broadcast('brokerConfigured');
                            this.brokerConfigured = true;
                            console.log('broadcast broker configured event');
                            break;
                        }
                }

            },
            getData: function(key) {
                return this.data[key];
            }
        }
    }]);
