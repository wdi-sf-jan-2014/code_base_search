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
    it("invokes the add function on '$'", function() {
      expect(t.add).toHaveBeenCalledWith('$');
    });
  });
});
