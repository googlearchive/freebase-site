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
var test_helpers = acre.require("handlers/test/helpers.sjs");

var tagged_static_handler = acre.require("handlers/tagged_static_handler.sjs");

acre.require("handlers/test/mock_handler.sjs").playback(this, tagged_static_handler, {
  to_http_response: function(result) {
    result.headers.expires = "in the future";
    return result;
  }
}, "handlers/test/playback_test_tagged_static_handler.json");

function assert_content(content) {
  ok(content.indexOf('var name = "handle_me.js";') >= 0);
};

test("require", function() {
  var module = acre.require("handlers/test/handle_me.js", test_helpers.metadata("js", "handlers/tagged_static_handler", "handlers/test/handle_me.js"));
  ok(module.body, "got acre.require module.body");
  assert_content(module.body);
});

test("include", function() {
  var resp = acre.include("handlers/test/handle_me.js", test_helpers.metadata("js", "handlers/tagged_static_handler", "handlers/test/handle_me.js"));
  ok(resp, "got acre.include response");
  assert_content(resp);
  ok(resp.headers, "got headers");
  ok(resp.headers.expires, "got expires header");
  ok(/public\,\s*max\-age\s*:\s*\d+/.test(resp.headers["cache-control"]), "got cache-control header");
  equal(resp.headers["content-type"], "application/x-javascript");
});

acre.test.report();
