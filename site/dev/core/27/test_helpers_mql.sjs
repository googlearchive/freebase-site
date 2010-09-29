acre.require('/test/lib').enable(this);

var h = acre.require("helpers_mql");

test("get_type_role", function() {
  strictEqual(h.get_type_role({}, true), null);
});

test("get_type_role mediator", function() {
  var mediators = [
    {"/freebase/type_hints/mediator": true},
    {"/freebase/type_hints/role": "/freebase/type_role/mediator"},
    {"/freebase/type_hints/role": {id: "/freebase/type_role/mediator"}},
    {"/freebase/type_hints/mediator": null, "/freebase/type_hints/role": "/freebase/type_role/mediator"}
  ];
  mediators.forEach(function(m) {
    equal(h.get_type_role(m, true), "mediator");
  });
});

test("get_type_role cvt", function() {
  var cvts = [
    {"/freebase/type_hints/mediator": null, "/freebase/type_hints/role": "/freebase/type_role/cvt"},
    {"/freebase/type_hints/role": "/freebase/type_role/cvt"},
    {"/freebase/type_hints/role": {id: "/freebase/type_role/cvt"}},
    {"/freebase/type_hints/mediator": true, "/freebase/type_hints/role": "/freebase/type_role/cvt"}
  ];
  cvts.forEach(function(cvt) {
    equal(h.get_type_role(cvt, true), "cvt");
  });
});

test("get_type_role enumeration", function() {
  var enums = [
    {"/freebase/type_hints/enumeration": true},
    {"/freebase/type_hints/role": "/freebase/type_role/enumeration"},
    {"/freebase/type_hints/role": {id: "/freebase/type_role/enumeration"}},
    {"/freebase/type_hints/enumeration": null, "/freebase/type_hints/role": "/freebase/type_role/enumeration"}
  ];
  enums.forEach(function(enumeration) {
    equal(h.get_type_role(enumeration, true), "enumeration");
  });
});

acre.test.report();


