acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var h = mf.require("helpers");

var tests = [
  ["foo", "/bar/baz", {id:"hello"}],
  {s:"foo", p:"/bar/baz", o:{id:"hello"}, mql:{id:"foo", "/bar/baz":{id:"hello"}}},

  ["foo", "/bar/baz", {value:"hello"}],
  {s:"foo", p:"/bar/baz", o:{value:"hello"}, mql:{id:"foo", "/bar/baz":{value:"hello"}}},

  ["foo", "/bar/baz", {value:"hello", lang:"/lang/ko"}],
  {s:"foo", p:"/bar/baz", o:{value:"hello", lang:"/lang/ko"}, mql:{id:"foo", "/bar/baz":{value:"hello", lang:"/lang/ko"}}},

  ["foo", "/bar/baz", {value:"hello", namespace:"/"}],
  {s:"foo", p:"/bar/baz", o:{value:"hello", namespace:"/"}, mql:{id:"foo", "/bar/baz":{value:"hello", namespace:"/"}}},

  ["foo", "/bar/baz", null, "/", "hello"],
  {s:"foo", p:"/bar/baz", o:{value:"hello", namespace:"/"}, mql:{id:"foo", "/bar/baz":{value:"hello", namespace:"/"}}},

  ["foo", "/bar/baz", {value:"hello", link:{target_value:{valud:"hello", lang:"/lang/ko"}}}],
  {s:"foo", p:"/bar/baz", o:{value:"hello", lang:"/lang/ko"}, mql:{id:"foo", "/bar/baz":{value:"hello", lang:"/lang/ko"}}}
];

test("triple", tests, function() {
  for(var i=0,l=tests.length; i<l; i+=2) {
    var triple = h.triple.apply(null, tests[i]);
    triple.mql = JSON.parse(triple.mql);
    deepEqual(triple, tests[i+1]);
  }
});

tests = [
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

test("is_valid", function() {
  equal(h.is_valid({}), true, "valid");
  equal(h.is_valid({valid:false}), false, "invalid");
  equal(h.is_valid({valid:true}), true, "valid");
});

test("valid_class", function() {
  equal(h.valid_class({}), "valid");
  equal(h.valid_class({valid:false}), "invalid");
  equal(h.valid_class({valid:true}), "valid");
});

test("link_class", function() {
  equal(h.link_class({}), "valid");
  equal(h.link_class({valid:false, operation:"foo"}), "invalid foo");
  equal(h.link_class({valid:true, operation:"update"}), "valid update");
});


acre.test.report();
