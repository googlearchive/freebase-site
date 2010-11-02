acre.require('/test/lib').enable(this);

var h = acre.require("helpers");

test("split_path", function() {
  var s = h.split_path;

  deepEqual(s("/script/extra/path"), ["script", "/extra/path", null]);
  deepEqual(s("/script/extra/path?foo=bar&hello=world"), ["script", "/extra/path", "foo=bar&hello=world"]);
  deepEqual(s("/script/extra/path?"), ["script", "/extra/path", ""]);

  deepEqual(s("/script.sjs"), ["script.sjs", "/", null]);
  deepEqual(s("/script.sjs/extra"), ["script.sjs", "/extra", null]);
  deepEqual(s("/script.sjs/extra?foo=bar"), ["script.sjs", "/extra", "foo=bar"]);

  deepEqual(s("/index"), ["index", "/", null]);
  deepEqual(s("/index?a=b&c=d"), ["index", "/", "a=b&c=d"]);

  deepEqual(s("/"), ["index", "/", null]);
  deepEqual(s("/?a=b&c=d"), ["index", "/", "a=b&c=d"]);

  deepEqual(s(""), ["index", "/", null]);
  deepEqual(s("?a=b&c=d"), ["index", "/", "a=b&c=d"]);
});


test("slit_extension", function() {
  var s = h.split_extension;

  deepEqual(s("foo.bar"), ["foo", "bar"]);
  deepEqual(s("foo"), ["foo", "sjs"]);

  deepEqual(s("/a/b/foo.bar"), ["/a/b/foo", "bar"]);
  deepEqual(s("/a/b/foo"), ["/a/b/foo", "sjs"]);

  deepEqual(s("/"), ["/", "sjs"]);
  deepEqual(s(""), ["", "sjs"]);
  deepEqual(s("/."), ["/", ""]);
  deepEqual(s("."), ["", ""]);
  deepEqual(s("/.mjt"), ["/", "mjt"]);
  deepEqual(s(".png"), ["", "png"]);
});


acre.test.report();

