SuffixTree = (function() {
  function SuffixTree() {}

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
        this, ['discovered', 'suffixes', 'search', 'leaves', 'learn', 'add', 'is_leaf', 'matching_key']
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
    query = query.remove(SuffixTree.delimiter);

    if (query.length === 0) {
      // if query is empty return undefined
      return void 0;
    }

    // a query is a substring of s iff it's a prefix
    // of a suffix of s
    SuffixTree.results = [];

    var node, suffix = "";

    // go through the keys of the current node
    for (var i = 0, keys = this.suffixes(); i < keys.length; i++) {
      if (keys[i][0] === query[0]) {
        // if any of the current keys starts with
        // the first character of the query string
        // we need to check if this key contains 
        // the query. if so, we are on an exact match
        // and don't need to traverse further
        if (keys[i].has(query)) {
          // if current edge (key) contains query
          node = this[keys[i]];
          // if the current edge contains query, we are 
          // on an edge leading to a leaf
          suffix = keys[i];
        } else if (query.has(keys[i]) && !keys[i].has(SuffixTree.delimiter)) {
          // if query contains key, and key does not point to a leaf 
          // perform the search on the unmatched part of the string
          // on the node pointed to by the key (traverse down)
          node = this[keys[i]].search(query.remove(keys[i]));
        }
      }
    }

    if (node instanceof SuffixTree) {
      // if we have a node, let's grab its leaves
      // pass in SuffixTree.results and the suffix
      node.leaves(SuffixTree.results, suffix);
    }
    return SuffixTree.results;
  };

  // Return the leaf nodes for the sub tree
  // on which this function is called
  // you should consider implementing a depth
  // first traversal to the leaf nodes
  SuffixTree.prototype.leaves = function(leaves) {
    _.each(this.suffixes(), function(suffix) {
      this[suffix].leaves(leaves, suffix);
    }, this);

    if (this.is_leaf()) {
      leaves.push(_.extend(this, {
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

  SuffixTree.prototype.learn = function(word) {
    //iterate over word and for each suffix of word, call add function
    //the learn function is called on the root node

    if (this.$ === undefined) {
      this.$ = new SuffixTree();
    }

    word += "$";

    var suffix = "$";

    for (var i = word.length - 2; i >= 0; i--) {
      suffix = word[i] + suffix;
      this.add(suffix);
    }
  };
  // this function returns the key that starts with the same letter as the word or the number 0 if there are none
  SuffixTree.prototype.matching_key = function(word) {
    var suffixes = this.suffixes();
    for (var i = 0; i < suffixes.length; i++) {
      var suffix = suffixes[i];
      if (suffix[0] === word[0]) {
        return suffix;
      }
    }
    return null;
  };
  // method to count how many letters two words start with in common
  var num_begin_match = function(word1, word2) {
    for (var i = 0; i < word1.length && i < word2.length; i++) {
      if (word1[i] !== word2[i]) {
        return i;
      }
    }
    return Math.min(word1.length, word2.length);
  };

  var add = function(a, b) {
    return a + b;
  };

  // this is the meat and potatoes function that cooks this excellent meal
  SuffixTree.prototype.add = function(suffix) {

    var length = suffix.length;

    var key = this.matching_key(suffix);

    if (key === null) {
      this[suffix] = new SuffixTree();
    } else if (key !== '$') {
      //we are in this part of the loop when there is already a key starting with the same letter as suffic
      //key is the key of the node
      var num_match = num_begin_match(suffix, key);

      var new_key = suffix.substring(0, num_match);
      var left_key = key.substring(num_match, key.length);
      var right_key = suffix.substring(num_match, suffix.length);

      var node = this[key];
      delete this[key];
      this[new_key] = node;

      if (left_key !== '') {
        node.add(left_key);
      }
      if (right_key !== '') {
        node.add(right_key);
      }
    }
  };

  // this just returns the SuffixTree to the outside world for usage
  return SuffixTree;
})();