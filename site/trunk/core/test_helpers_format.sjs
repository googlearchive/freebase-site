acre.require('/test/lib').enable(this);

var h = acre.require("helpers_format");

test("commafy", function() {
  equals(h.commafy(1000), "1,000");
  equals(h.commafy(100), "100");
  equals(h.commafy(1234567890), "1,234,567,890");
  equals(h.commafy(-1000), "-1,000");
  equals(h.commafy(-100), "-100");
  equals(h.commafy(-1234567890), "-1,234,567,890");
  equals(h.commafy(0), "0");
  equals(h.commafy(1), "1");
});


test("round", function() {
  equals(h.round(149, 2), 100);
  equals(h.round(1150, 2), 1200);
  equals(h.round(11111, 3), 11000);
});


acre.test.report();


