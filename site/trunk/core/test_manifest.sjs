acre.require('/test/lib').enable(this);

var m = acre.require("MANIFEST");
var scope = this;

test("require_args", function() {
  var mf = {};
  m.extend_manifest(mf, scope);
  deepEqual(mf.require_args("bar"), {app:null,file:"bar",local:true});
  deepEqual(mf.require_args("foo", "bar"), {app:"foo",file:"bar",local:false});
  deepEqual(mf.require_args("foo", "bar", "baz"), {app:"foo",file:"bar",local:false});
  deepEqual(mf.require_args(null, "bar"), {app:null,file:"bar",local:true});
  deepEqual(mf.require_args("foo", null), {app:null,file:"foo",local:true});
  var ex = "bad require args";
  try { mf.require_args(); ok(false, "expected " + ex); } catch(e) { equal(e, ex); }
  try { mf.require_args(null); ok(false, "expected " + ex); } catch(e) { equal(e, ex); }
  try { mf.require_args(null, null); ok(false, "expected " + ex); } catch(e) { equal(e, ex); }
});

test("css_preprocessor", function() {
  var mf = {
    apps: {
      "core": "//core.site.freebase.dev",
      "routing": "//release.routing.site.freebase.dev"
    }
  };
  m.extend_manifest(mf, scope);

  var tests = [
    ["background: url(core, freebase-logo.png) no-repeat", "background: url(" + mf.img_src("core", "freebase-logo.png") + ") no-repeat"],
    ["background: url(icon-chiclet.png)", "background: url(" + mf.img_src("icon-chiclet.png") + ")"],
    ["background: url( routing , baz.gif )", "background: url(" + mf.img_src("routing", "baz.gif") + ")"],
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

test("js_src", function() {
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

  equals(mf.js_src("foo.mf.js"), mf.static_base_url + "/foo.mf.js");
});

test("img_src", function() {
  var mf = {
    apps: {
      "core": "//core.site.freebase.dev",
      "hello": "//5.app.world.hello.dev"
    }
  };
  m.extend_manifest(mf, scope);

  var ext_mf = mf.require("core", "MANIFEST").mf;

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
  equals(mf.static_base_url, mf.get_app_base_url() +  "/MANIFEST");

  ok(mf.apps);
  equals(mf.apps["hello"], "//7.app.world.hello.dev");
  ok(mf.javascript);
  ok(mf.stylesheet);


  m.extend_manifest(mf, scope, {static_base_url:'foo', image_base_url: 'bar'});
  equals(mf.static_base_url, 'foo');
  equals(mf.image_base_url, 'bar');
});


acre.test.report();

