/*
* Copyright 2010, Google Inc.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
*     * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above
* copyright notice, this list of conditions and the following disclaimer
* in the documentation and/or other materials provided with the
* distribution.
*     * Neither the name of Google Inc. nor the names of its
* contributors may be used to endorse or promote products derived from
* this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
acre.require('/test/lib').enable(this);

var h = acre.require("helper/helpers.sjs");

var test_helpers = acre.require("handlers/helpers_test.sjs");

var css_handler = acre.require("handlers/css_handler.sjs");

acre.require("handlers/mock_handler.sjs").playback(this, css_handler, {
  to_module: function(result) {
    return result.body;
  }
}, "handlers/playback_test_css_handler.json");

test("quote_url", function() {
  equal(css_handler.quote_url("some url"),   '"some url"');
  equal(css_handler.quote_url('"some url"'), '"some url"');
  equal(css_handler.quote_url("'some url'"), '"some url"');
});


function assert_content(content) {
  // assert transformation of urls in handlers/handle_me.css
  ok(content.indexOf("url(template/ui-icons.png)") === -1, "expected url(template/ui-icons.png) to be transformed");
  ok(content.indexOf('url("' + h.static_url(acre.resolve("template/ui-icons.png")) + '")') >= 0, "expected url(template/ui-icons.png) to be transformed");

  ok(content.indexOf("url(http") === -1, "expected url to be quoted");
  ok(content.indexOf('url("http') >= 0, "expected url to be quoted");
};

var self = this;
test("preprocessor", function() {
  var content = acre.get_source("handlers/handle_me.css");
  var script = {
    get_content: function() {
      return {
        body: acre.get_source("handlers/handle_me.css")
      };
    },
    scope: self
  };

  var result = css_handler.preprocessor(script);
  assert_content(result);
});

test("require", function() {
  var module = acre.require("handlers/handle_me.css", test_helpers.metadata("css", "handlers/css_handler", "handlers/handle_me.css"));
  ok(module.body, "got acre.require module.body");
  assert_content(module.body);
});

test("include", function() {
  var resp = acre.include("handlers/handle_me.css", test_helpers.metadata("css", "handlers/css_handler", "handlers/handle_me.css"));
  ok(resp, "got acre.include response");
  assert_content(resp);
  ok(resp.headers && resp.headers["content-type"] === "text/css", "content-type is text/css");
});


acre.test.report();
