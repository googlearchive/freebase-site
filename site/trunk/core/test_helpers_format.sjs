acre.require('/test/lib').enable(this);

var h = acre.require("helpers_format");

test("commafy", function() {
  equals("1,000", h.commafy(1000));
  equals("100", h.commafy(100));
  equals("1,234,567,890", h.commafy(1234567890));
  equals("-1,000", h.commafy(-1000));
  equals("-100", h.commafy(-100));
  equals("-1,234,567,890", h.commafy(-1234567890));
  equals("0", h.commafy(0));
  equals("1", h.commafy(1));
});


test("round", function() {
  equals(100, h.round(149, 2));
  equals(1200, h.round(1150, 2));
  equals(11000, h.round(11111, 3));
});


if (acre.current_script == acre.request.script) {
  acre.test.report();
}


