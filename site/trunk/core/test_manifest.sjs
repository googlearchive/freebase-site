acre.require('/test/lib').enable(this);

var m = acre.require("MANIFEST");
var scope = this;

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
  equals(mf.resource_version("/hello/world/app/foo"), "7");
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

