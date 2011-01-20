acre.require('/test/lib').enable(this);

var h = acre.require("core/helpers");

var self = this;
var css_handler = acre.require("handlers/css_handler");
var handler = css_handler.handler();

test("quote_url", function() {
  equal(css_handler.quote_url("some url"),   '"some url"');
  equal(css_handler.quote_url('"some url"'), '"some url"');
  equal(css_handler.quote_url("'some url'"), '"some url"');
});

test("resource_url", function() {
  var url = "static:///resources/images/ui/sprite-vert.png";
  var expected = '"' + h.freebase_resource_url(url.substring(9)) + '"';
  equal(css_handler.resource_url(url), expected);
  equal(css_handler.resource_url("'" + url + "'"), expected);
  equal(css_handler.resource_url('"' + url + '"'), expected);
});

test("preprocessor", function() {
   var css = [
     "div { background: url(template/ui-icons.png) no-repeat; display: inline-block;}",
     "p { opacity: 0.8; background: #fff url(static:///resources/images/ui/sprite-vert.png) 0 -100px;}",
     "img { background: url(http://www.google.com/logo.png); }"
   ];

  var script = {
    get_content: function() {
      return {
        body: css.join("\n")
      };
    },
    scope: self
  };

  var expected = css.join("\n");
  expected = expected.replace("url(template/ui-icons.png)", "url(\"" + h.static_url(acre.resolve("template/ui-icons.png")) + "\")")
    .replace("url(static:///resources/images/ui/sprite-vert.png)", "url(\"" + h.freebase_resource_url("/resources/images/ui/sprite-vert.png") + "\")")
    .replace("url(http://www.google.com/logo.png)", "url(\"http://www.google.com/logo.png\")");

  equal(css_handler.preprocessor(script), expected);
});


acre.test.report();
