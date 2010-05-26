acre.require('/test/lib').enable(this);

var h = acre.require("helpers_url");

test("app_url", function() {
  var expected = acre.host.protocol + "://foo.daepark.user." + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "");
  equals(h.app_url("/user/daepark/foo"), expected);
  equals(h.app_url("/user/daepark/foo", null), expected);
  expected = acre.host.protocol + "://2.foo.daepark.user." + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "");
  equals(h.app_url("/user/daepark/foo", "2"), expected);
});

test("resource_url", function() {
  var expected = acre.host.protocol + "://foo.daepark.user." + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "") + "/bar";
  equals(h.resource_url("/user/daepark/foo/bar"), expected);
  equals(h.resource_url("/user/daepark/foo/bar", null), expected);
  expected = acre.host.protocol + "://2.foo.daepark.user." + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "") + "/bar";
  equals(h.resource_url("/user/daepark/foo/bar", "2"), expected);
});


if (acre.current_script == acre.request.script) {
  acre.test.report();
}
