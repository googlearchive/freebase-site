
(function($) {

  // set up freebase namespace, environment variable as found in freebase.mjt and freebase.js
  window.freebase = window.fb = {
    acre: {
      freebase: {
        site_host: "http://devel.SITE_HOST:SERVER_PORT",
        service_url: "http://api.SERVICE_URL"
      },
      request: {
        server_port: "SERVER_PORT",
        script: {app:{path:"//schema.www.trunk.svn.freebase-site.googlecode.dev"}}
      },
      current_script: {
        app:{path:"//lib.www.trunk.svn.freebase-site.googlecode.dev"}
      },
      metadata: {
        libs: {
          foo: {
            base_url: "foo_base/",
            version: "foo_version"
          }
        }
      }
    }
  };

  $(function() {
    run_tests($, window.freebase);
  });
})(jQuery);



function run_tests($, fb) {

  var h  = fb.h;

  test("parse_params", function() {
    same(h.parse_params({}), {});
    same(h.parse_params([]), {});
    equal(h.parse_params(), null);
    equal(h.parse_params(null), null);
    equal(h.parse_params(""), "");
    same(h.parse_params({a:1, b:2}), {a:1, b:2});
    same(h.parse_params([ ["a",1], ["b",2] ]), {a:1, b:2});
  });

  test("build_url", function() {
    equal(h.build_url(), "/");
    equal(h.build_url(null), "/");
    equal(h.build_url(null, null), "/");
    equal(h.build_url(null, ""), "/");
    equal(h.build_url(""), "/");
    equal(h.build_url("", null), "/");
    equal(h.build_url("", ""), "/");

    equal(h.build_url(null, "/path1"), "/path1");
    try {
      h.build_url(null, "path1");
      ok(false, "path must begin with a /");
    }
    catch(e) {
      ok(true, e);
    }
    equal(h.build_url(null, "/path1", "/path2", "/path3"), "/path1/path2/path3");
    equal(h.build_url(null, "/path1", "/path2", {a:1, b:2}),
          "/path1/path2?" + $.param({a:1,b:2}, true));
    equal(h.build_url(null, "/path1", "/path2", "/path3", [ ["a",1], ["b",2] ]),
          "/path1/path2/path3?" + $.param({a:1,b:2}, true));

    try {
      h.build_url("HOST");
      ok(false, "host must contain valid scheme");
    }
    catch (e) {
      ok(true, e);
    }

    equal(h.build_url("http://HOST", "/path1/path2", "/path3", {a:1, b:2}),
          "http://HOST/path1/path2/path3?" + $.param({a:1,b:2}, true));
  });

  test("fb_url", function() {
    equal(h.fb_url(), "/");
    equal(h.fb_url(null), "/");
    equal(h.fb_url(""), "/");
    equal(h.fb_url("/path1", "/path2", {a:1}), "/path1/path2?a=1");
    equal(h.fb_url("/path1", {a:1}, {b:2}), "/path1?a=1&b=2");
    equal(h.fb_url("/path1/path2", [["a",1]]), "/path1/path2?a=1");
  });

  test("resolve_reentrant_path", function() {
    var app_path = fb.acre.request.script.app.path;
    var lib_path = fb.acre.current_script.app.path;

    equal(h.resolve_reentrant_path(), app_path);
    equal(h.resolve_reentrant_path(null), app_path);
    equal(h.resolve_reentrant_path(""), app_path);
    equal(h.resolve_reentrant_path("foo"), app_path + "/foo");
    equal(h.resolve_reentrant_path("/foo"), app_path + "/foo");
    equal(h.resolve_reentrant_path("lib/foo"), lib_path + "/foo");
    equal(h.resolve_reentrant_path("/lib/foo"), app_path + "/lib/foo");

    equal(h.resolve_reentrant_path("//lib/foo"), "//lib/foo");
  });

  test("reentrant_url", function() {
    var app_path = fb.acre.request.script.app.path
      .replace(/^\/\//, "/")
      .replace(".svn.freebase-site.googlecode.dev", "");
    var lib_path = fb.acre.current_script.app.path
      .replace(/^\/\//, "/")
      .replace(".svn.freebase-site.googlecode.dev", "");

    equal(h.reentrant_url("/PREFIX"), "/PREFIX" + app_path);
    equal(h.reentrant_url("/PREFIX", null), "/PREFIX" + app_path);
    equal(h.reentrant_url("/PREFIX", ""), "/PREFIX" + app_path);
    equal(h.reentrant_url("/PREFIX", "foo"), "/PREFIX" + app_path + "/foo");
    equal(h.reentrant_url("/PREFIX", "/foo"), "/PREFIX" + app_path + "/foo");
    equal(h.reentrant_url("/PREFIX", "lib/foo"), "/PREFIX" + lib_path + "/foo");
    equal(h.reentrant_url("/PREFIX", "/lib/foo"), "/PREFIX" + app_path + "/lib/foo");
    equal(h.reentrant_url("/PREFIX", "//schema.www.trunk.svn.freebase-site.googlecode.dev/foo"),
          "/PREFIX/schema.www.trunk/foo");
    equal(h.reentrant_url("/PREFIX", "lib/foo", {a:1}),
          "/PREFIX" + lib_path + "/foo?a=1");
    equal(h.reentrant_url("/PREFIX", "foo/bar", {a:1}),
          "/PREFIX" + app_path + "/foo/bar?a=1");
  });

  test("ajax_url", function() {
    var app_path = fb.acre.request.script.app.path
      .replace(/^\/\//, "/")
      .replace(".svn.freebase-site.googlecode.dev", "");
    var lib_path = fb.acre.current_script.app.path
      .replace(/^\/\//, "/")
      .replace(".svn.freebase-site.googlecode.dev", "");
    var PREFIX = "/ajax";

    equal(h.ajax_url(), PREFIX + app_path);
    equal(h.ajax_url(null), PREFIX + app_path);
    equal(h.ajax_url(""), PREFIX + app_path);
    equal(h.ajax_url("foo"), PREFIX + app_path + "/foo");
    equal(h.ajax_url("/foo"), PREFIX + app_path + "/foo");
    equal(h.ajax_url("lib/foo"), PREFIX + lib_path + "/foo");
    equal(h.ajax_url("/lib/foo"), PREFIX + app_path + "/lib/foo");
    equal(h.ajax_url("//1b.schema.www.trunk.svn.freebase-site.googlecode.dev/foo"),
          PREFIX + "/1b.schema.www.trunk/foo");
    equal(h.ajax_url("lib/permission/has_permission", {id:"foo"}),
          PREFIX + lib_path + "/permission/has_permission?id=foo");
  });

  test("legacy_fb_url", function() {
    equal(h.legacy_fb_url(), "http://www.SITE_HOST");
    equal(h.legacy_fb_url(null), "http://www.SITE_HOST");
    equal(h.legacy_fb_url(""), "http://www.SITE_HOST");
    equal(h.legacy_fb_url("/private/suggest", {prefix:"a"}),
          "http://www.SITE_HOST/private/suggest?prefix=a");
  });

  test("fb_api_url", function() {
    equal(h.fb_api_url(), fb.acre.freebase.service_url);
    equal(h.fb_api_url(null), fb.acre.freebase.service_url);
    equal(h.fb_api_url(""), fb.acre.freebase.service_url);
    equal(h.fb_api_url("/api/service/mqlread", {q:"foo"}),
          fb.acre.freebase.service_url + "/api/service/mqlread?q=foo");
  });

  test("wiki_url", function() {
    equal(h.wiki_url(), "http://wiki.freebase.com/wiki/");
    equal(h.wiki_url(null), "http://wiki.freebase.com/wiki/");
    equal(h.wiki_url(""), "http://wiki.freebase.com/wiki/");
    equal(h.wiki_url("Enumerated_types"), "http://wiki.freebase.com/wiki/Enumerated_types");
  });

  test("lib_base_url", function() {
    equal(h.lib_base_url("foo"), fb.acre.metadata.libs.foo.base_url + fb.acre.metadata.libs.foo.version);
  });
};


