acre.require('/test/lib').enable(this);

var h = acre.require("helpers_url");

var mf = acre.require("MANIFEST").MF;

test("url_for", function() {
  var routes_mf = acre.require("/freebase/site/routing/MANIFEST", mf.version["/freebase/site/routing"]).MF;

  if (h.is_client()) {
    equals(h.url_for("/freebase/site/core/test_helpers_url"), acre.request.app_url + acre.request.base_path + routes.get_route("/freebase/site/core").path + "/test_helpers_url");
  }
  else {
    equals(h.url_for("/freebase/site/core/test_helpers_url"),  h.resource_url("/freebase/site/core/test_helpers_url", routes_mf.version["/freebase/site/core"]));
    equals(h.url_for("/freebase/site/schema/index"), h.resource_url("/freebase/site/schema/index", routes_mf.version["/freebase/site/schema"]));
  }
});

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
