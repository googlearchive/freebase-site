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

var test_helpers = acre.require("handlers/test/helpers.sjs");
var deferred = acre.require("promise/deferred.sjs");
var controller_handler = acre.require("handlers/controller_handler.sjs");
var render = controller_handler.render;
var lib = acre.require("handlers/service_lib.sjs");
var validators = acre.require("validator/validators.sjs");

acre.require("handlers/test/mock_handler.sjs").playback(this, controller_handler, {
  to_module: function(result) {
    return JSON.stringify(result.SPEC);
  },
  to_http_response: function(result) {
    var body = result.body;
    var index = body.indexOf("<p>content_body topic:");
    if (index !== -1) {
      var index2 = body.indexOf("</p>", index);
      if (index2 !== -1) {
        body = body.substring(index, index2+4);
        return body;
      }
    }
    return body;
  }
}, "handlers/test/playback_test_controller_handler.json");

var self = this;

test("render", function() {
  var result;

  // render template using template/freebase.mjt as base template
  var service_result = {
    topic: "Blade Runner",
    topic2: "Bob Dylan",
    template: "handlers/test/handle_me.mjt"
  };
  render(service_result, null, self)
    .then(function(render_result) {
      result = acre.markup.stringify(render_result);
    });
  acre.async.wait_on_results();
  ok(result, "got render result");
  var expected = "<p>content_body topic:Blade Runner, topic2:Bob Dylan</p>";
  ok(result.indexOf(expected) !== -1, "expected content: " + expected);

  // render def in template
  service_result = {
    topic: "Sakuragi",
    template: "handlers/test/handle_me.mjt",
    def: "render_def",
    def_args: [
      deferred.resolved("Hanamichi")
    ]
  };
  result = null;
  render(service_result, null, self)
    .then(function(render_result) {
      result = acre.markup.stringify(render_result);
    });
  acre.async.wait_on_results();
  ok(result, "got render result");
  expected = "<b>render_def topic:Sakuragi, topic2:Hanamichi</b>";
  ok(result.indexOf(expected) !== -1, "expected content: " + expected);

  // render def with SPEC.template
  service_result = {
    topic: "Led",
    def: "render_def",
    def_args: [
      deferred.resolved("Zeppelin")
    ]
  };
  var spec = {
    template: "handlers/test/handle_me.mjt"
  };
  result = null;
  render(service_result, spec, self)
    .then(function(render_result) {
      result = acre.markup.stringify(render_result);
    });
  acre.async.wait_on_results();
  ok(result, "got render result");
  expected = "<b>render_def topic:Led, topic2:Zeppelin</b>";
  ok(result.indexOf(expected) !== -1, "expected content: " + expected);
});


test("require", function() {
  var module = acre.require("handlers/test/handle_me.controller",
                            test_helpers.metadata("controller", "handlers/controller_handler",
                                                  "handlers/test/handle_me.controller"));
  ok(module, "got acre.require module");
  ok(module.SPEC && typeof module.SPEC === "object", "got module.SPEC");
  ["method", "auth"].forEach(function(m) {
    ok(m in module.SPEC, "got module.SPEC." + m);
  });
  ["validate", "run"].forEach(function(m) {
    ok(typeof module.SPEC[m] === "function", "got module.SPEC." + m);
  });
});

test("include", function() {
  var resp = acre.include("handlers/test/handle_me.controller",
                          test_helpers.metadata("controller", "handlers/controller_handler",
                                                "handlers/test/handle_me.controller"));
  ok(resp, "got acre.include response");
  var expected = "<p>content_body topic:Blade Runner, topic2:Bob Dylan</p>";
  ok(resp.indexOf(expected) !== -1, "expected content: " + expected);
});

acre.test.report();
