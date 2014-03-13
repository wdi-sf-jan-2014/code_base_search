var path = require('path');
var fs = require('fs');

GLOBAL._ = require('underscore');

var express = require('express');
var app = express();

require('./sugar-min.js');
require('./suffix_tree.js');

var tree = new SuffixTree();

var read_files = function(error, results) {
   _.filter(
    results,
    function(file) {
      return _.indexOf(
        [".js", ".rb"], 
        path.extname(file)) !== -1;
    }
  ).forEach(function(file) {
    fs.readFile(file, 'utf8', function(err, data) {
      if (err) {
        return console.log(err);
      }

      console.log(file);
      _.each(data.split('\n'), tree.learn, tree);
    });
  });
};

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    _.each(list, function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

app.get('/', function(req, res) {
  res.send(tree);
});

app.get('/learn', function(req, res) {
  tree = undefined;
  tree = new SuffixTree();
  walk('../contacts', read_files);
  res.send(tree);
});

app.get('/search/:q', function(req, res) {
  res.send(tree.search(req.params.q));
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

console.log(process.argv[2]);
walk(process.argv[2], read_files);
