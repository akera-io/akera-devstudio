[![Akera Logo](http://akera.io/logo.png)](http://akera.io/)

  Developer Studio module for Akera.io web service - provides a simple web interface for
  working with business logic procedures available on the application server.

## Installation

```bash
$ npm install akera-devstudio
```

## Docs

  * [Website and Documentation](http://akera.io/)

## Quick Start

  This module is designed to only be loaded as broker level service which 
  is usually done by adding a reference to it in `services` section of 
  each broker's configuration in `akera-web.json` configuration file.
   
```json
  "brokers": [
  	{	"name": "demo",
  		"host": "localhost",
		"port": 3737,
		"services": [
			{ 
				"middleware": "akera-devstudio",
				"config": {
					"route": "/devstudio/"
				}
			}
		]
	}
  ]
```
  
  Service options available:

- `route`: the route where the service is going to be mounted (default: '/devstudio/')
  
  This is a simple web user-interface that allows developers to edit or create new business procedures
  on application server `web-path`. Beside editing file's content some helpful functions are also available:

- check syntax 
- compile, file or whole folder
- run business logic procedures by passing any required input/output parameters

## Dependencies
  Although there is no direct dependency of those modules, in order to `mount` the 
  developer studio on an application server web-service the following modules need to be
  mounted as well:

- [akera-rest-api](https://www.npmjs.com/package/akera-rest-api)
- [akera-rest-file](https://www.npmjs.com/package/akera-rest-file)
  	
  If available those will be automatically mounted, otherwise the module will also fail to load. 


## Important
  Please note this module **should NOT be enabled** on `production` environment as it gives access to the
  file system on the application server which is a security risk.
  
## License	
[MIT](https://github.com/akera-io/akera-devstudio/raw/master/LICENSE)  
