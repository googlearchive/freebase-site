acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var h = mf.require("helpers");

var tests = [
  0, "<10",
  5, "<10",
  10, "10+",
  19, "10+",
  45, "40+",
  100, "100+",
  150, "100+",
  1000, "1k",
  1500, "1.5k",
  9149, "9.1k",
  9150, "9.2k",
  9999, "10k",
  10000, "10k",
  10001, "10k",
  10101, "10k",
  14999, "15k",
  19499, "19k",
  99999, "100k",
  999999, "1,000k"
];


test("format_number", tests, function() {

  for(var i=0,l=tests.length; i<l; i+=2) {
    equal(h.format_number(tests[i]), tests[i+1]);
  }

});



acre.test.report();
