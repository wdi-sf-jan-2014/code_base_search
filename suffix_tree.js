SuffixTree = (function() {
  function SuffixTree() {
  }

  Object.defineProperty(SuffixTree, "delimiter", {
    // the property created here is used in server.js
    // it's used for delimiting lines of input
    get: function delimiter() {
      return SuffixTree.__delimiter || "$";
    },
    set: function delimiter(d) {
      SuffixTree.__delimiter = d;
    }
  });

  Object.defineProperty(SuffixTree, "delimiter_filename_hash", {
    get: function delimiter_filename_hash() {
      SuffixTree.__dfh = SuffixTree.__dfh || {}; 
      return SuffixTree.__dfh;
    }
  });

  Object.defineProperty(SuffixTree, "filename", {
    // the property created here is used in server.js
    // it's used for keeping track of the filename on which
    // we are operating. it creates and intializes a hash
    // which you may use to set filenames on the leaves
    // once you get to that point
    get: function filename() {
      return SuffixTree.__filename || "";
    },
    set: function filename(f) {
      SuffixTree.__filename = f;
      SuffixTree.delimiter_filename_hash[SuffixTree.delimiter] = f;
    }
  });

  // use this to return the suffixes of a given node
  // this is a utility function, that omits other functions
  // because we are using the keys of the js object as suffix identifiers
  SuffixTree.prototype.suffixes = function() {
    return _.keys(
      _.omit(
        this,
        ['discovered','suffixes','search','leaves','learn','add','is_leaf','filename']
      )
    );
  };

  // this utility function is going to return true
  // when the current node has no suffixes
  SuffixTree.prototype.is_leaf = function() {
    return this.suffixes().length === 0;
  };

  // Match p on a path starting from root
  //  3 cases:
  //  a. query does not match: query does not occur in T
  //  b. query ends in a node of the tree. 
  //    all leaves below node are occurrences of query
  //  c. query ends in an edge of the tree
  //    all leaves below node pointed to by edge are occurrences of query
  //
  //  an edge is a key of the node
  SuffixTree.prototype.search = function(query) {
    // first remove delimiter from the query
    query = query.remove(SuffixTree.delimiter);

    if (query.length===0) {
      // if query is empty return undefined
      return void 0;
    } 

    // a query is a substring of s iff it's a prefix
    // of a suffix of s
    SuffixTree.results = [];

    var node,suffix="";
   
    // go through the keys of the current node
    for(var i=0,keys=this.suffixes();i<keys.length;i++){
      if(keys[i][0]===query[0]){
        // if any of the current keys starts with
        // the first character of the query string
        // we need to check if this key contains 
        // the query. if so, we are on an exact match
        // and don't need to traverse further
        if(keys[i].has(query)) {
          // if current edge (key) contains query
          node=this[keys[i]]; 
          // if the current edge contains query, we are 
          // on an edge leading to a leaf
          suffix = keys[i];
        } else if (query.has(keys[i]) && !keys[i].has(SuffixTree.delimiter)) {
          // if query contains key, and key does not point to a leaf 
          // perform the search on the unmatched part of the string
          // on the node pointed to by the key (traverse down)
          node=this[keys[i]].search(query.remove(keys[i]));
        }
      } 
    }
    
    if (node instanceof SuffixTree) {
      // if we have a node, let's grab its leaves
      // pass in SuffixTree.results and the suffix
      node.leaves(SuffixTree.results,suffix);
    }
    return SuffixTree.results;
  };

  // Return the leaf nodes for the sub tree
  // on which this function is called
  // you should consider implementing a depth
  // first traversal to the leaf nodes
  SuffixTree.prototype.leaves = function(leaves,_suffix) {
    _.each(this.suffixes(), function(suffix) {
      this[suffix].leaves(leaves,suffix);
    },this);

    if (this.is_leaf()) {
      leaves.push(_.extend(this,{ 
        filename: SuffixTree.delimiter_filename_hash[_suffix.last(1)] 
      }));
    }

    return leaves;
  };

  // This should be the entry point into the suffix
  // tree's learning abilities. This function is called
  // from server.js. Find where it's called in server.js.
  // Basically, in server.js, we are calling this function
  // for each line in an input file

  // However, this should work just as easily for a simple
  // word, like banana :)
  // the meat and potatoes are cooked by SuffixTree.prototype.add
  SuffixTree.prototype.learn = function(suffix) {
    // add a delimiter to the end of the line that isn't in
    // the alphabet of characters of code; we'll use the g clef
    var delimited_suffix = suffix + SuffixTree.delimiter;
    if (this[SuffixTree.delimiter]===undefined) {
      // if we don't have our first node
      // create our first node at the delimiter
      this[SuffixTree.delimiter] = new SuffixTree();
    }
    
    // iterate over characters of delimited suffix
    for (var i=suffix.length-1;i>=0;i--) {
      // reference to the current suffix
      var current_suffix = delimited_suffix.slice(i); 
      
      // add the suffix
      this.add(current_suffix);
    }
  };

  // this is the meat and potatoes function that cooks this excellent meal
  SuffixTree.prototype.add = function(suffix) {
    var keys = this.suffixes();
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

        // let's store a reference to the current node
        var current_node = this[current_node_key];

        // everything to the right of the key's
        // split index is the left node's key 
        var left_node_key = keys[i].slice(split_index);

        if (current_node&&current_node.suffixes().length > 0) {
          // if the current node has keys
          // we need to have that node perform the add
          return current_node.add(right_node_key); 
        }

        // keep the node, we'll reuse it
        var old_node = this[keys[i]];
        // delete the key
        delete this[keys[i]];
        // current node becomes a new node
        this[current_node_key] = new SuffixTree(); 
        // reattach the old node at the current node's left key
        this[current_node_key][left_node_key] = old_node;
        // current node's right node becomes a new node
        this[current_node_key][right_node_key] = new SuffixTree();
        return this[current_node_key];
      }
      // update keys, because we may have inserted a new key
      keys=this.suffixes();
    }
    // when all else fails make a new tree at this suffix
    this[suffix] = new SuffixTree();
  };
  
  // this just returns the SuffixTree to the outside world for usage
  return SuffixTree;
})();
