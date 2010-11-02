acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var validators = mf.require("validators");
var Class = validators.Class;
var Validator = validators.Validator;

test("Class.factory", function() {

  function MyClass(foo, bar) {
    this.foo = foo;
    this.bar = bar;
  };
  var inst = Class.factory(MyClass, ["foo", "bar"]);

  equal(inst.foo, "foo");
  equal(inst.bar, "bar");
  ok(inst instanceof MyClass);
  equal(typeof inst, "object");

  function AClass(first, middle, last) {
    this.name = first + middle + last;
  };
  inst = validators.Class.factory(AClass, ["1", "2", "3"]);

  equal(inst.name, "123");
  ok(inst instanceof AClass);
  equal(typeof inst, "object");

});


var scope = this;

test("Validator.factory", function() {
  var v = Validator.factory(scope, "MyValidator", {
    "string": function(val, options) {
      return val;
    }
  });
  equal(v, scope.MyValidator);
  equal(v("foo"), "foo");
  equal(v("foo", {}), "foo");
  equal(v({foo:"bar"}, "foo"), "bar");
  equal(v({foo:"bar"}, "foo", {}), "bar");
});


acre.test.report();
