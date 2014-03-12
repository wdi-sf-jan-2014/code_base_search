GLOBAL._ = require('underscore');
var fs = require('fs');

var express = require('express');
var app = express();

require('./suffix_tree.js');

var tree = new SuffixTree();

var start = function() {
  fs.readdir('../contacts', function(err, files){
    files.forEach(function(file) {
      fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
          return console.log(err);
        }

        _.each(data.split('\n'), tree.learn, tree);
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
  start();
  res.send(tree);
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

start();
