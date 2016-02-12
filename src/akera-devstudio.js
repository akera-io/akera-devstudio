var express = require('express');
var path = require('path');
var www_path = path.join(path.normalize(path.join(__dirname, '..')), 'www');

function DevStudio() {

}

DevStudio.prototype.init = function(config, router) {
  router.use('/', express.static(www_path));
  router.get('/', function(req, res) {
    console.log('devstudio get');
    var templateFn = require('jade').compileFile(
        require.resolve('../www/index.jade'));
    res.status(200).send(templateFn({
      broker : config.broker,
      restRoute : config.restRoute
    }));
  });
};

module.exports = DevStudio;
