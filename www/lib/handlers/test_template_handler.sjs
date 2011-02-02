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
acre.require("/test/lib").enable(this);

var h = acre.require("helper/helpers.sjs");
var test_helpers = acre.require("handlers/helpers_test.sjs");
var deferred = acre.require("promise/deferred.sjs");
var template_handler = acre.require("handlers/template_handler.sjs");
var render = template_handler.render;
var lib = acre.require("handlers/service_lib.sjs");
var validators = acre.require("validator/validators.sjs");

function find(str, start_pattern, end_pattern) {
  var start = str.indexOf(start_pattern);
  if (start !== -1) {
    var end = str.indexOf(end_pattern, start);
    if (end !== -1) {
      return str.substring(start, end + end_pattern.length);
    }
  }
  return null;
};

acre.require("handlers/mock_handler.sjs").playback(this, template_handler, {
  to_js: function(result) {
    var link_href = find(result, "<link href=", ">");
    var script_src = find(result, "<script src=", "</script>");
    return {
      link_href: link_href,
      script_src: script_src
    };
  },
  to_module: function(result) {
    return "nothing important to compare";
  },
  to_http_response: function(result) {
    var body = result.body;
    var link_href = find(body, "<link href=", ">");
    var script_src = find(body, "<script src=", "</script>");
    var content_body = find(body, "<p>content_body id:", "</p>");
    return {
      link_href: link_href,
      script_src: script_src,
      content_body: content_body
    };
  }
}, "handlers/playback_test_template_handler.json");

test("require", function() {
  var module = acre.require("handlers/handle_me.template",
                            test_helpers.metadata("template", "handlers/template_handler",
                                                  "handlers/handle_me.template"));
  ok(module, "got acre.require module");

  console.log("acre.require module", module);
});

test("include", function() {
  var resp = acre.include("handlers/handle_me.template",
                          test_helpers.metadata("template", "handlers/template_handler",
                                                "handlers/handle_me.template"));
  ok(resp, "got acre.include response");

  // make sure <link href> and <script src> have transformed static urls
  var expected;
  expected = "<link href=\"" + h.static_url("handlers/handle_me.css") + "\"";
  ok(resp.indexOf(expected) !== -1, "expected transformed <link href>: " + expected);

  expected = "<script src=\"" + h.static_url("handlers/handle_me.mf.js") + "\"";
  ok(resp.indexOf(expected) !== -1, "expected transformed <script src>: " + expected);

  expected = "<p>content_body id:/en/blade_runner, id2:/en/bob_dylan</p>";
  ok(resp.indexOf(expected) !== -1, "expected content: " + expected);
});

acre.test.report();
