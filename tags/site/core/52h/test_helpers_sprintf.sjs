acre.require('/test/lib').enable(this);

var h = acre.require("helpers_sprintf");


test("sprintf", function() {
  equal(h.sprintf("%s%s%s", 1, 2, 3), "123");
});

acre.test.report();


