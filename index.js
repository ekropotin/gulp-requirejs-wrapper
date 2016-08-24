'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var rjs = require('requirejs');
var fs = require('fs');

module.exports = function(rjsOptions) {
  var dir = rjsOptions.dir;
  var baseUrl = rjsOptions.baseUrl;
  if (!rjsOptions) {
    throw new PluginError('gulp-requirejs-wrapper', 'Missing RequireJs options!');
  }

  function pushResultFiles(context) {
    for(var i = 0; i < rjsOptions.modules.length; i++) {
      var moduleName = rjsOptions.modules[i].name;
      var filePath = path.join(process.cwd(), dir, baseUrl, moduleName) + '.js';
      var file = new File({path: filePath, contents: fs.createReadStream(filePath)});
      context.push(file);
    }
  }

  function endStream(cb) {
    var self = this;
    rjs.optimize(rjsOptions,
      function(result) {
        pushResultFiles(self);
        cb();
      },

      function(error) {
        gutil.log(error);
        this.emit('error', new PluginError('gulp-requirejs-wrapper', error));
        cb();
      });
  }

  return through.obj(function(chunk, enc, callback) {callback();}, endStream);
};
