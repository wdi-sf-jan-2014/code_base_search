SuffixTree = (function() {
  function SuffixTree() {
  }

  Object.defineProperty(SuffixTree, "delimiter", {
    get: function delimiter() {
      return SuffixTree.__delimiter || "$";
    },
    set: function delimiter(d) {
      SuffixTree.__delimiter = d;
    }
  });

  Object.defineProperty(SuffixTree, "filename", {
    get: function filename() {
      return SuffixTree.__filename || "";
    },
    set: function filename(f) {
      SuffixTree.__filename = f;
      SuffixTree.__delimiter_filename_hash = SuffixTree.__delimiter_filename_hash || {};
      SuffixTree.__delimiter_filename_hash[SuffixTree.__delimiter] = f;
    }
  });

  Object.defineProperty(SuffixTree, "delimiter_filename_hash", {
    get: function delimiter_filename_hash() {
      return SuffixTree.__delimiter_filename_hash || {};
    }
  });

  SuffixTree.prototype.suffixes = function() {
    return _.keys(
      _.omit(
        this,
        ['discovered','suffixes','search','leaves','learn','add','is_leaf']
      )
    );
  };

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

    var node;
   
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
      node.leaves(SuffixTree.results);
    }
    return SuffixTree.results;
  };

  SuffixTree.prototype.leaves = function(leaves) {
    _.each(this.suffixes(), function(suffix) {
      this[suffix].leaves(leaves);
    },this);

    if (this.is_leaf()) {
      leaves.push(this);
    }

    return leaves;
  };

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
  return SuffixTree;
})();
