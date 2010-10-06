acre.require('/test/lib').enable(this);

var h = acre.require("helpers_mql");

test("get_type_role", function() {
  strictEqual(h.get_type_role({}, true), null);
});

test("get_type_role mediator", function() {
  var mediators = [
    {"/freebase/type_hints/mediator": true}
  ];
  mediators.forEach(function(m) {
    equal(h.get_type_role(m, true), "mediator");
  });
});

test("get_type_role enumeration", function() {
  var enums = [
    {"/freebase/type_hints/enumeration": true}
  ];
  enums.forEach(function(enumeration) {
    equal(h.get_type_role(enumeration, true), "enumeration");
  });
});

acre.test.report();


