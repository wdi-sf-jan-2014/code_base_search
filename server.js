var _ = require('underscore');
var fs = require('fs');

var lines = [];
SuffixTree = function() {

};

var tree = new SuffixTree();
var delimiter = "$";

var express = require('express');
var app = express();

SuffixTree.prototype.learn = function(suffix) {
  // add a delimiter to the end of the line that isn't in
  // the alphabet of characters of code; we'll use the g clef
  var delimited_suffix = suffix + delimiter;
  if (this[delimiter]===undefined) {
    // if we don't have our first node
    // create our first node at the delimiter
    this[delimiter] = new SuffixTree();
  }
  
  // iterate over characters of delimited suffix
  for (var i=suffix.length-1;i>=0;i--) {
    // reference to the current suffix
    var current_suffix = delimited_suffix.slice(i); 
    
    var node = this.add(current_suffix);
  }
};

SuffixTree.prototype.add = function(suffix) {
  var keys=_.keys(this);
  // iterate over the keys
  for(var i=0;i<keys.length;i++) {
    if(keys[i][0]===suffix[0]) {
      // if the current key's 0th character
      // matches the passed in suffix's 0th character
      // we need to find the split point 
      // it is the first character that isn't matched
      for(var j=1,split_index=1;j<suffix.length;j++) {
        if(keys[i][j]===suffix[j]) {
          split_index=j+1;
        } else {
          break;
        }
      } 

      // everything to the right of the suffix's 
      // split index, is the right node's key 
      var right_node_key = suffix.slice(split_index);
      // everything to the left of the suffix's
      // split index is the current node's key
      var current_node_key = keys[i].slice(0,split_index);
      // everything to the right of the key's
      // split index is the left node's key 
      var left_node_key = keys[i].slice(split_index);

      // keep the node, we'll reuse it
      var old_node = this[keys[i]];
      // delete the key
      delete this[keys[i]];
      // reattach the old node at the current node key
      this[current_node_key] = new SuffixTree(); 
      // make the left node
      this[current_node_key][left_node_key] = old_node;
      // make the right node
      this[current_node_key][right_node_key] = new SuffixTree();
      return this[current_node_key];
    }
    // update keys, because we may have inserted a new key
    keys=_.keys(this);
  }
  this[suffix] = new SuffixTree();
  return this;
};

var start = function() {
  fs.readFile('./test', 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    _.each(data.split('\n'), tree.learn, tree);
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
