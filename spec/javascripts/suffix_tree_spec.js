GLOBAL._ = require('underscore');
require('../../lib/sugar-min.js');

require('../../suffix_tree.js');

describe("SuffixTree", function() {
  var t;

  beforeEach(function() {
    t = new SuffixTree();
  });

  it("can be initialized", function() {
    expect(t).toEqual(jasmine.any(SuffixTree));
  });

  describe("given the word banana to learn", function() {
    beforeEach(function() {
      spyOn(t, 'add');
      t.learn('banana');
    });

    it("invokes the add function for each delimited suffix of the word",
      function() {
        expect(
          t.add.calls.map(
            function(spy_call){return spy_call.args;}
          )
        ).toEqual(
          [['a$'], ['na$'], ['ana$'], ['nana$'], ['anana$'], ['banana$']]
        );
      }
    );
  });

  describe("learning banana suffix by suffix",function() {
    it("learns a",function() {
      t.learn('a');
      expect(t.a$).toEqual(jasmine.any(SuffixTree));
    });
    it("learns na after a",function() {
      t.learn('a');
      t.learn('na');
      expect(t.na$).toEqual(jasmine.any(SuffixTree));
    });
    it("learns ana after na",function() {
      t.learn('a');
      t.learn('na');
      t.learn('ana');
      expect(t.a.$).toEqual(jasmine.any(SuffixTree));
      expect(t.na$).toEqual(jasmine.any(SuffixTree));
      expect(t.a.na$).toEqual(jasmine.any(SuffixTree));
    });
    it("learns nana after ana",function() {
      t.learn('a');
      t.learn('na');
      t.learn('ana');
      t.learn('nana');
      expect(t.a.$).toEqual(jasmine.any(SuffixTree));
      expect(t.a.na$).toEqual(jasmine.any(SuffixTree));
      expect(t.na.$).toEqual(jasmine.any(SuffixTree));
      expect(t.na.na$).toEqual(jasmine.any(SuffixTree));
    });
    it("learns anana after nana",function() {
      t.learn('a');
      t.learn('na');
      t.learn('ana');
      t.learn('nana');
      t.learn('anana');
      expect(t.a.$).toEqual(jasmine.any(SuffixTree));
      expect(t.na.$).toEqual(jasmine.any(SuffixTree));
      expect(t.na.na$).toEqual(jasmine.any(SuffixTree));
      expect(t.a.na.$).toEqual(jasmine.any(SuffixTree));
      expect(t.a.na.na$).toEqual(jasmine.any(SuffixTree));
    });
    it("learns banana after anana",function() {
      t.learn('a');
      t.learn('na');
      t.learn('ana');
      t.learn('nana');
      t.learn('anana');
      t.learn('banana');
      expect(t.a.$).toEqual(jasmine.any(SuffixTree));
      expect(t.na.$).toEqual(jasmine.any(SuffixTree));
      expect(t.na.na$).toEqual(jasmine.any(SuffixTree));
      expect(t.a.na.$).toEqual(jasmine.any(SuffixTree));
      expect(t.a.na.na$).toEqual(jasmine.any(SuffixTree));
      expect(t.banana$).toEqual(jasmine.any(SuffixTree));
    });
  });

  it("should construct the tree without anything extra", function() {
    t.learn('banana');
    expect(JSON.stringify(t)).toEqual(
      '{"$":{},"a":{"$":{},"na":{"$":{},"na$":{}}},"na":{"$":{},"na$":{}},"banana$":{}}'
    );
  });

  describe("Searching for substrings of banana", function() {
    beforeEach(function() {
      t.learn('banana');
    });

    describe("searching for 'a'", function() {
      it("should find the leaves of t.a", function() {
        expect(t.search('a')).toEqual([t.a.$, t.a.na.$, t.a.na.na$]);
      });
    });

    describe("searching for 'b'", function() {
      it("should find the leaves of t.banana$", function() {
        expect(t.search('b')).toEqual([t.banana$]);
      });
    });

    describe("searching for 'n'", function() {
      it("should find the leaves of t.na", function() {
        expect(t.search('n')).toEqual([t.na.$, t.na.na$]);
      });
    });

    describe("searching for 'na'", function() {
      it("should find the leaves of t.na", function() {
        expect(t.search('na')).toEqual([t.na.$, t.na.na$]);
      });
    });

    describe("searching for 'ana'", function() {
      it("should find the leaves of t.a.na", function() {
        expect(t.search('ana')).toEqual([t.a.na.$, t.a.na.na$]);
      });
    });

    describe("searching for 'nana'", function() {
      it("should find the leaves of t.na.na", function() {
        expect(t.search('nana')).toEqual([t.na.na$]);
      });
    });

    describe("searching for 'anana'", function() {
      it("should find the leaves of t.a.na.na", function() {
        expect(t.search('anana')).toEqual([t.a.na.na$]);
      });
    });

    describe("searching for 'banana'", function() {
      it("should find the leaves of t.banana", function() {
        expect(t.search('banana')).toEqual([t.banana$]);
      });
    });
  });
});
