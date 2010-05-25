acre.require('/test/lib').enable(this);

var m = acre.require("MANIFEST");
var h = acre.require("helpers_url");
var scope = this;

test("_resource_info", function() {
  var mf = {
    version: {
      "/hello/world/app": "4",
      "/foo/bar/app": null
    }
  };
  m.extend_manifest(mf, scope);

  equals(mf._resource_info("/hello/world/app/foo.css").id, "/hello/world/app/foo.css");
  equals(mf._resource_info("/hello/world/app/foo.css").version, "4");
  equals(mf._resource_info("/foo/bar/app/foo.js").id, "/foo/bar/app/foo.js");
  equals(mf._resource_info("/foo/bar/app/foo.js").version, null);
  equals(mf._resource_info("foo.png").id, "/freebase/site/core/foo.png");
  equals(mf._resource_info("foo.png").version, null);
  try {
    mf._resource_info("/xxx/yyy/zzz/foo.less");
    ok(false, "expected an exception for an unknown resource");
  }
  catch (ex) {
    ok(true, "got exception for an unkonwn resource");
  }
});

test("resource_url", function() {
  var mf = {
    version: {
      "/hello/world/app": "4",
      "/foo/bar/app": null
    }
  };
  m.extend_manifest(mf, scope);

  var tests = [
    ["/hello/world/app/freebase-logo.png",
     h.resource_url("/hello/world/app/freebase-logo.png", mf.version["/hello/world/app"])],
    ["icon-chiclet.png",
     h.resource_url("/freebase/site/core/icon-chiclet.png")],
    ["/foo/bar/app/baz.gif",
     h.resource_url("/foo/bar/app/baz.gif",  mf.version["/foo/bar/app"])]
  ];

  tests.forEach(function(t) {
    equals(mf.resource_url(t[0]), t[1]);
  });
});


test("css_preprocessor", function() {
  var mf = {
    version: {
      "/hello/world/app": "4",
      "/foo/bar/app": null
    }
  };
  m.extend_manifest(mf, scope);

  var tests = [
    ["background: url(/hello/world/app/freebase-logo.png) no-repeat", "background: url(" + h.resource_url("/hello/world/app/freebase-logo.png", mf.version["/hello/world/app"]) + ") no-repeat"],
    ["background: url(icon-chiclet.png)", "background: url(" + h.resource_url("/freebase/site/core/icon-chiclet.png") + ")"],
    ["background: url(/foo/bar/app/baz.gif)", "background: url(" + h.resource_url("/foo/bar/app/baz.gif",  mf.version["/foo/bar/app"]) + ")"],
    ["background: url(http://www.freebase.com/logo.png)", "background: url(http://www.freebase.com/logo.png)"]

  ];

  tests.forEach(function(t) {
    equals(mf.css_preprocessor(t[0]), t[1]);
  });
});


test("img_src", function() {
  var mf = {
    version: {
      "/hello/world/app": "4",
      "/foo/bar/app": null,
      "/freebase/site/homepage": "5"
    }
  };
  m.extend_manifest(mf, scope);

  var tests = [
    ["/hello/world/app/freebase-logo.png", h.resource_url("/hello/world/app/freebase-logo.png", mf.version["/hello/world/app"])],
    ["icon-chiclet.png", h.resource_url("/freebase/site/core/icon-chiclet.png")],
    ["/foo/bar/app/baz.gif", h.resource_url("/foo/bar/app/baz.gif", mf.version["/foo/bar/app"])]
  ];

  tests.forEach(function(t) {
    equals(mf.img_src(t[0]), t[1]);
  });
});


test("extend_manifest", function() {
  var mf = {
    version: {
      "/hello/world/app": "7"
    },
    static_base_url: "foo/"
  };
  m.extend_manifest(mf, scope);
  equals(mf.static_base_url, "foo/");
  equals(mf.link_href("bar.css"), "foo/bar.css");
  equals(mf.script_src("bar.js"), "foo/bar.js");
  equals(mf._resource_info("/hello/world/app/foo").version, "7");
  try {
    mf.resource_version("/hello/world/bap/foo");
    ok(false, "expected exception since /hello/world/bap is not defined in mf.version");
  }
  catch(ex) {
    ok(true, ex);
  }
});


if (acre.current_script == acre.request.script) {
  acre.test.report();
}

