module.exports = DevStudio;

var path = require('path');
var www_path = path.join(path.normalize(path.join(__dirname, '..')), 'www');

function DevStudio(akeraWebApp) {
  this.init = function(config, router) {
    if (!router || !router.__app || typeof router.__app.require !== 'function') {
      throw new Error('Invalid Akera web service router.');
    }

    var akeraApp = router.__app;
    var express = akeraApp.require('express');
    var jade = akeraApp.require('jade');

    config = config || {};
    config.route = akeraApp.getRoute(config.route || '/devstudio/');
    var apiRoute = akeraApp.getRoute(this.getServiceRoute(akeraApp,
        router.__broker, 'akera-rest-api'), router);
    var fileRoute = akeraApp.getRoute(this.getServiceRoute(akeraApp,
        router.__broker, 'akera-rest-file'), router);

    router.use(config.route, express.static(www_path));
    router.get(config.route, function(req, res) {
      var templateFn = jade.compileFile(require.resolve('../www/index.jade'));
      res.status(200).send(templateFn({
        broker : req.broker.alias,
        restApiRoute : apiRoute,
        restFileRoute : fileRoute
      }));
    });
  };

  this.getServiceRoute = function(akeraApp, broker, srvName) {
    try {
      var service = akeraApp.getService(srvName, broker);
      return service.config.route;
    } catch (err) {
      return null;
    }
  }

  if (akeraWebApp !== undefined) {
    throw new Error(
        'Development studio can only be mounted at the broker level.');
  }
}

DevStudio.init = function(config, router) {
  var devStudio = new DevStudio();
  devStudio.init(config, router);
};

DevStudio.dependencies = function() {
  return [ 'akera-rest-api', 'akera-rest-file' ];
};
