acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var h = acre.require("helpers_url2");
var scope = this;

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
  var routes_mf = mf.require("routing", "MANIFEST").MF;
  var routes =  mf.require("routing", "app_routes");
  var h_acre = acre.require("helpers_acre");

  if (true || h.is_client()) {
    equal(h.url_for("core", "test_helpers_url"), acre.request.app_url + acre.request.base_path + routes.get_route("core").from + "/test_helpers_url");
    equal(h.url_for("schema", "index"), acre.request.app_url + acre.request.base_path + routes.get_route("schema").from + "/index");
    equal(h.url_for("toolbox", "service", null, "/apps"), acre.request.app_url + acre.request.base_path + routes.get_route("toolbox").from + "/service/apps");
    equal(h.url_for("homepage", "index"), acre.request.app_url + acre.request.base_path + "/");
  }
  else {
    equal(h.url_for("core", "test_helpers_url"),  h.resource_url(h_acre.parse_path(routes_mf.apps["core"] + "/test_helpers_url", scope).id));
    equal(h.url_for("schema", "index"), h.resource_url(h_acre.parse_path(routes_mf.apps["schema"] + "/index", scope).id));
    equal(h.url_for("toolbox", "service", null, "/apps"),  h.resource_url(h_acre.parse_path(routes_mf.apps["toolbox"] + "/service", scope).id) + "/apps");
    equal(h.url_for("homepage", "index"), h.resource_url(h_acre.parse_path(routes_mf.apps["homepage"] + "/index", scope).id));
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


acre.test.report();

