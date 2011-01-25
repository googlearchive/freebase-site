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

var h = acre.require("core/helpers");

var test_helpers = acre.require("handlers/helpers_test");

var css_manifest_handler = acre.require("handlers/css_manifest_handler");

acre.require("handlers/mock_handler").playback(this, css_manifest_handler, "handlers/playback_test_css_manifest_handler.json");

function assert_content(content, lessified) {
  if (lessified) {
    ok(content.indexOf("@") === -1, "did not expect mixin variables");
  }
  else {
    ok(content.indexOf("@") >= 0, "expected mixin variables");
  }
  ok(content.indexOf("#global-search-input") >= 0, "expected concatenated content");
};

test("require", function() {
  var module = acre.require("handlers/handle_me.mf.css", test_helpers.metadata("mf.css", "handlers/css_manifest_handler", "handlers/handle_me.mf.css"));
  ok(module.body, "got acre.require module.body");
  assert_content(module.body, false);
});

test("include", function() {
  var resp = acre.include("handlers/handle_me.mf.css", test_helpers.metadata("mf.css", "handlers/css_manifest_handler", "handlers/handle_me.mf.css"));
  ok(resp, "got acre.include response");
  equal(acre.response.headers["content-type"], "text/css");
  assert_content(resp, true);
});


acre.test.report();
