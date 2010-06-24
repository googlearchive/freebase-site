acre.require('/test/lib').enable(this);

var m = acre.require("MANIFEST");
var h = acre.require("helpers_url");
var scope = this;

test("resource_url", function() {
  var mf = {
    apps: {
      "core": "//core.site.freebase.dev",
      "hello": "//4.app.world.hello.dev",
      "foo": "//app.bar.foo.dev"
    }
  };
  m.extend_manifest(mf, scope);

  var tests = [
    [
      ["hello", "freebase-logo.png"],
      h.resource_url("/hello/world/app/freebase-logo.png", 4)
    ],
    [
      ["icon-chiclet.png"],
      h.resource_url("/freebase/site/core/icon-chiclet.png")
    ],
    [
      ["foo", "baz.gif"],
      h.resource_url("/foo/bar/app/baz.gif",  null)
    ]
  ];

  tests.forEach(function(t) {
    equals(mf.resource_url.apply(mf, t[0]), t[1]);
  });
});

test("css_preprocessor", function() {
  var mf = {
    apps: {
      "core": "//core.site.freebase.dev",
      "hello": "//4.app.world.hello.dev",
      "foo": "//app.bar.foo.dev"
    }
  };
  m.extend_manifest(mf, scope);

  var tests = [
    ["background: url(hello, freebase-logo.png) no-repeat", "background: url(" + h.resource_url("/hello/world/app/freebase-logo.png", 4) + ") no-repeat"],
    ["background: url(icon-chiclet.png)", "background: url(" + h.resource_url("/freebase/site/core/icon-chiclet.png") + ")"],
    ["background: url( foo , baz.gif )", "background: url(" + h.resource_url("/foo/bar/app/baz.gif") + ")"],
    ["background: url(http://www.freebase.com/logo.png)", "background: url(http://www.freebase.com/logo.png)"]

  ];

  tests.forEach(function(t) {
    equals(mf.css_preprocessor(t[0]), t[1]);
  });
});


test("css_src", function() {
  var mf = {
    apps: {
      "core": "//core.site.freebase.dev",
      "hello": "//4.app.world.hello.dev"
    },
    stylesheet: {
      "foo.mf.css": [
        ["hello", "external.css"],
        "local.css"
      ]
    }
  };
  m.extend_manifest(mf, scope);
  equals(mf.css_src("foo.mf.css"), mf.static_base_url + "/foo.mf.css");
});

test("script_src", function() {
  var mf = {
    apps: {
      "core": "//core.site.freebase.dev",
      "hello": "//4.app.world.hello.dev"
    },
    javascript: {
      "foo.mf.js": [
        ["hello", "external.js"],
        "local.js"
      ]
    }
  };
  m.extend_manifest(mf, scope);

  equals(mf.script_src("foo.mf.js"), mf.static_base_url + "/foo.mf.js");
});

test("img_src", function() {
  var mf = {
    apps: {
      "core": "//core.site.freebase.dev",
      "hello": "//5.app.world.hello.dev"
    }
  };
  m.extend_manifest(mf, scope);

  var ext_mf = mf.require("core", "MANIFEST").MF;

  var tests = [
    [
      ["local.png"],
      mf.image_base_url + "/local.png"
    ],
    [
      ["core", "freebase-logo-production.png"],
      ext_mf.image_base_url + "/freebase-logo-production.png"
    ]
  ];

  tests.forEach(function(t) {
    equals(mf.img_src.apply(null, t[0]), t[1]);
  });
});


test("extend_manifest", function() {
  var mf = {
    apps: {
      "core": "//core.site.freebase.dev",
      "hello": "//7.app.world.hello.dev"
    }
  };
  m.extend_manifest(mf, scope);
  equals(mf.static_base_url, acre.current_script.app.base_url +  "/MANIFEST");

  ok(mf.apps);
  equals(mf.apps["hello"], "//7.app.world.hello.dev");
  ok(mf.javascript);
  ok(mf.stylesheet);


  m.extend_manifest(mf, scope, {static_base_url:'foo', image_base_url: 'bar'});
  equals(mf.static_base_url, 'foo');
  equals(mf.image_base_url, 'bar');
});


acre.test.report();

