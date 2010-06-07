acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;

var h = acre.require("helpers_url2");

test("app_url", function() {
  var expected = acre.host.protocol + "://foo.daepark.user." + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "");
  equal(h.app_url("/user/daepark/foo"), expected);
  equal(h.app_url("/user/daepark/foo", null), expected);
  expected = acre.host.protocol + "://2.foo.daepark.user." + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "");
  equal(h.app_url("/user/daepark/foo", "2"), expected);
});

test("resource_url", function() {
  var expected = acre.host.protocol + "://foo.daepark.user." + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "") + "/bar";
  equal(h.resource_url("/user/daepark/foo/bar"), expected);
  equal(h.resource_url("/user/daepark/foo/bar", null), expected);
  expected = acre.host.protocol + "://2.foo.daepark.user." + acre.host.dev_name + (acre.host.port !== 80 ? (":" + acre.host.port) : "") + "/bar";
  equal(h.resource_url("/user/daepark/foo/bar", "2"), expected);
});

test("parse_params", function() {
  deepEqual(h.parse_params({a:1,b:2}), {a:1,b:2});
  deepEqual(h.parse_params([['a',1],['b',2]]), {a:1,b:2});
  strictEqual(h.parse_params(), undefined);
  deepEqual(h.parse_params({}), {});
  deepEqual(h.parse_params([]), {});
});

test("url_for", function() {
  var routes_mf = acre.require("/freebase/site/routing/MANIFEST", mf.version["/freebase/site/routing"]).MF;

  if (h.is_client()) {
    equal(h.url_for("/freebase/site/core/test_helpers_url"), acre.request.app_url + acre.request.base_path + routes.get_route("/freebase/site/core").path + "/test_helpers_url");
  }
  else {
    equal(h.url_for("/freebase/site/core/test_helpers_url"),  h.resource_url("/freebase/site/core/test_helpers_url", routes_mf.version["/freebase/site/core"]));
    equal(h.url_for("/freebase/site/schema/index"), h.resource_url("/freebase/site/schema/index", routes_mf.version["/freebase/site/schema"]));
  }
});

test("freebase_url", function() {
  equal(h.freebase_url(), acre.freebase.service_url);
  equal(h.freebase_url(null), acre.freebase.service_url);
  equal(h.freebase_url(""), acre.freebase.service_url);
  equal(h.freebase_url("/foo/bar"), acre.freebase.service_url + "/foo/bar");
  equal(h.freebase_url("/foo/bar", {a:1,b:2}), acre.freebase.service_url + "/foo/bar?a=1&b=2");
  equal(h.freebase_url(null, {a:1,b:2}), acre.freebase.service_url + "?a=1&b=2");
});

test("freebase_static_resource_url", function() {
  equal(h.freebase_static_resource_url(), mf.freebase.resource.base_url);
  equal(h.freebase_static_resource_url(null), mf.freebase.resource.base_url);
  equal(h.freebase_static_resource_url("/resources/images/chrome/metaweb-logo.png"), mf.freebase.resource.base_url + "/resources/images/chrome/metaweb-logo.png");
});


if (acre.current_script == acre.request.script) {
  acre.test.report();
}
