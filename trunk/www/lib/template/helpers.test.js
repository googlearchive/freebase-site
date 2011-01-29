
(function($) {

  // set up freebase namespace, environment variable as found in freebase.mjt and freebase.js
  window.freebase = window.fb = {
    acre: {
      freebase: {
        site_host: "http://devel.SITE_HOST:SERVER_PORT",
        service_url: "http://api.SERVICE_URL"
      },
      request: {
        server_port: "SERVER_PORT"
      }
    },
    ajax: {
      app: "/AJAX/APP",
      lib: "/AJAX/LIB"
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
    equal(h.fb_url("/path1/path2", [["a",1]]), "/path1/path2?a=1");
  });

  test("ajax_app_url", function() {
    equal(h.ajax_url(), fb.ajax.app);
    equal(h.ajax_app_url(), fb.ajax.app);
    equal(h.ajax_app_url(null), fb.ajax.app);
    equal(h.ajax_app_url(""), fb.ajax.app);
    equal(h.ajax_app_url("/service.ajax", {a:1}), fb.ajax.app + "/service.ajax?a=1");
    equal(h.ajax_app_url("/path1/path2", "/service.ajax", [["a",1]]),
          fb.ajax.app + "/path1/path2/service.ajax?a=1");
  });

  test("ajax_lib_url", function() {
    equal(h.ajax_lib_url(), fb.ajax.lib);
    equal(h.ajax_lib_url(null), fb.ajax.lib);
    equal(h.ajax_lib_url(""), fb.ajax.lib);
    equal(h.ajax_lib_url("/service.ajax", {a:1}), fb.ajax.lib + "/service.ajax?a=1");
    equal(h.ajax_lib_url("/path1/path2", "/service.ajax", [["a",1]]),
          fb.ajax.lib + "/path1/path2/service.ajax?a=1");
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
};


