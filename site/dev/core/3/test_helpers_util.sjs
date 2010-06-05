acre.require('/test/lib').enable(this);

var h = acre.require("helpers_util");

test("extend", function() {
  deepEqual(h.extend({foo:"bar"}, {hello:"world"}, {a:{b:"c"}}), {foo:"bar", hello:"world", a: {b:"c"}});

  deepEqual(h.extend({}, {foo:"bar"}, {hello:"world"}, {a:{b:"c"}}), {foo:"bar", hello:"world", a: {b:"c"}});

       function fn() {};
  deepEqual(h.extend({foo:"bar"}, {fn:fn}), {foo:"bar", fn:fn});

  var obj = {};
  var obj2 = h.extend(obj, {foo:"bar"});
  strictEqual(obj2, obj);
});


if (acre.current_script == acre.request.script) {
  acre.test.report();
}
