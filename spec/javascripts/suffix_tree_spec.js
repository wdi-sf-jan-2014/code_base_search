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
});
