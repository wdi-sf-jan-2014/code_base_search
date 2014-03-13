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
      SuffixTree.__delimiter_filename_hash = SuffixTree.__delimiter_filename_hash || {};
      SuffixTree.__delimiter_filename_hash[SuffixTree.__delimiter] = f;
    }
  });

  Object.defineProperty(SuffixTree, "delimiter_filename_hash", {
    get: function delimiter_filename_hash() {
      return SuffixTree.__delimiter_filename_hash || {};
    }
  });

  // use this to return the suffixes of a given node
  // this is a utility function, that omits other functions
  // because we are using the keys of the js object as suffix identifiers
  SuffixTree.prototype.suffixes = function() {
    return _.keys(
      _.omit(
        this,
        ['discovered','suffixes','search','leaves','learn','add','is_leaf']
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
  };

  // Return the leaf nodes for the sub tree
  // on which this function is called
  // you should consider implementing a depth
  // first traversal to the leaf nodes
  SuffixTree.prototype.leaves = function(leaves) {
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
  };

  // this is the meat and potatoes function that cooks this excellent meal
  SuffixTree.prototype.add = function(suffix) {
  };

  // this just returns the SuffixTree to the outside world for usage
  return SuffixTree;
})();

