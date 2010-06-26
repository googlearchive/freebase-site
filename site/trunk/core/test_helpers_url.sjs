acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").MF;
var h = acre.require("helpers_url");
var scope = this;

test("parse_params", function() {
  deepEqual(h.parse_params({a:1,b:2}), {a:1,b:2});
  deepEqual(h.parse_params([['a',1],['b',2]]), {a:1,b:2});
  strictEqual(h.parse_params(), undefined);
  deepEqual(h.parse_params({}), {});
  deepEqual(h.parse_params([]), {});
});

function resource_url(apppath, file, params, extra_path) {
  var url = acre.host.protocol + ":" + apppath + acre.host.name + (acre.host.port !== 80 ? (":" + acre.host.port) : "") + "/" + file + (extra_path || "");
  return acre.form.build_url(url, params);
};

test("url_for", function() {
  var routes_mf = mf.require("routing", "MANIFEST").MF;
  var routes =  mf.require("routing", "app_routes");

  if (h.is_client()) {
    equal(h.url_for("core", "test_helpers_url"), acre.request.app_url /*+ acre.request.base_path*/ + routes.get_route("core").from + "/test_helpers_url");
    equal(h.url_for("schema", "index"), acre.request.app_url /*+ acre.request.base_path*/ + routes.get_route("schema").from + "/index");
    equal(h.url_for("toolbox", "service", null, "/apps"), acre.request.app_url /*+ acre.request.base_path*/ + routes.get_route("toolbox").from + "/service/apps");
    equal(h.url_for("homepage", "index"), acre.request.app_url /*+ acre.request.base_path*/ + "/");
  }
  else {
    equal(h.url_for("core", "test_helpers_url"),  resource_url(routes_mf.apps["core"],  "test_helpers_url"));
    equal(h.url_for("schema", "index"), resource_url(routes_mf.apps["schema"], "index"));
    equal(h.url_for("toolbox", "service", null, "/apps"),  resource_url(routes_mf.apps["toolbox"], "service", null, "/apps"));
    equal(h.url_for("homepage", "index"), resource_url(routes_mf.apps["homepage"], "index"));
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

