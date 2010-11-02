acre.require('/test/lib').enable(this);

var h = acre.require("helpers_mql");


function role(mediator, enumeration) {
  return {
    mediator: mediator === true,
    enumeration: enumeration === true
  };
}

var role_tests = [
  {},
  role(false, false),

  {"/freebase/type_hints/mediator": true},
  role(true, false),

  {"/freebase/type_hints/mediator": false, "/freebase/type_hints/enumeration": true},
  role(false, true),

  {"/freebase/type_hints/mediator": true, "/freebase/type_hints/enumeration": true},
  role(true, true)

];

test("get_type_role", role_tests, function() {

  for (var i=0,l=role_tests.length; i<l; i+=2) {
    deepEqual(h.get_type_role(role_tests[i]), role_tests[i+1]);
  }

});


acre.test.report();


