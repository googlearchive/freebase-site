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
var ajax_handler = acre.require("handlers/ajax_handler.sjs");
var lib = acre.require("handlers/service_lib.sjs");
var validators = acre.require("validator/validators.sjs");

acre.require("handlers/test/mock_handler.sjs").playback(this, ajax_handler, {
  to_module: function(result) {
    return JSON.stringify(result.SPEC);
  },
  to_http_response: function(result) {
    delete result.headers["expires"];  // expires datestring is variable from record to playback
    return result;
  }
}, "handlers/test/playback_test_ajax_handler.json");

var mock_script = {
  scope: this
};
function no_op() {};


test("to_ajax_response", function() {
  function check_response(resp, jsonp) {
    ok(resp && typeof resp === "object", "got to_ajax_response");
    ok(resp.body && typeof resp.body === "string", "got to_ajax_response.body");
    ok(resp.headers && typeof resp.headers === "object", "got to_ajax_response.headers");
    ok(/text\/javascript;\s*charset=utf\-8/.test(resp.headers["content-type"]));
    var body = resp.body;
    if (jsonp) {
      var rjsonp = new RegExp(["^\\s*", jsonp, "\\s*\\(\\s*"].join(""));
      body = body.replace(rjsonp, "").replace(/\s*\)\s*;\s*$/, "");
    }
    var json = JSON.parse(body);
    ok(json.transaction_id, "expected transaction_id in response");
    equal(json.status, "200 OK");
    equal(json.code, "/api/status/ok");
    same(json.result, {foo:"bar"});
  };

  // no callback
  delete acre.request.params.callback;
  var resp = ajax_handler.to_ajax_response(new lib.ServiceResult({foo:"bar"}));
  check_response(resp);

  // with callback
  try {
    acre.request.params.callback = "foo";
    resp = ajax_handler.to_ajax_response(new lib.ServiceResult({foo:"bar"}));
    check_response(resp, "foo");
  }
  finally {
    // remove callback param
    delete acre.request.params.callback;
  }

  function check_error(resp, jsonp) {
    ok(resp, "got to_ajax_response");
    ok(resp.body && typeof resp.body === "string", "got to_ajax_response.body");
    ok(resp.headers && typeof resp.headers === "object", "got to_ajax_response.headers");
    ok(/text\/javascript;\s*charset=utf\-8/.test(resp.headers["content-type"]));
    var body = resp.body;
    if (jsonp) {
      var rjsonp = new RegExp(["^\\s*", jsonp, "\\s*\\(\\s*"].join(""));
      body = body.replace(rjsonp, "").replace(/\s*\)\s*;\s*$/, "");
    }
    var json = JSON.parse(body);
    ok(json.transaction_id, "expected transaction_id in response");
    equal(json.status, "500 Internal Server Error");
    equal(json.code, "/api/status/error");
    ok(json.messages && json.messages.length === 1);
    same(json.messages[0], "some message");
  };

  // error - no callback
  resp = ajax_handler.to_ajax_response(new lib.ServiceError(null, null, "some message"));
  check_error(resp, null);

  // error - with callback
  try {
    acre.request.params.callback = "foo";
    resp = ajax_handler.to_ajax_response(new lib.ServiceError(null, null, "some message"));
    check_error(resp, "foo");
  }
  finally {
    // remove callback param
    delete acre.request.params.callback;
  }
});

test("require", function() {
  var module = acre.require("handlers/test/handle_me.ajax",
                            test_helpers.metadata("ajax", "handlers/ajax_handler", "handlers/test/handle_me.ajax"));
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
  function check_response(resp, jsonp) {
    ok(/text\/javascript;\s*charset=utf\-8/.test(resp.headers["content-type"]), resp.headers["content-type"]);
    if (jsonp) {
      ok(resp.status == null, "status should not be set for jsonp");
      var rjsonp = new RegExp(["^\\s*", jsonp, "\\s*\\(\\s*"].join(""));
      resp = resp.replace(rjsonp, "").replace(/\s*\)\s*;\s*$/, "");
    }
    else {
      equal(resp.status, "200", "status 200");
    }
    var json = JSON.parse(resp);
    ok(json, "acre.include response is proper JSON");
    equal(json.status, "200 OK");
    equal(json.code, "/api/status/ok");
    ok(json.transaction_id, "got transaction_id");
    same(json.result, {topic1:"/en/blade_runner", topic2:"/en/bob_dylan"});
  };

  var resp = acre.include("handlers/test/handle_me.ajax",
                          test_helpers.metadata("ajax", "handlers/ajax_handler", "handlers/test/handle_me.ajax"));
  ok(resp, "got acre.include response");
  check_response(resp);

  try {
    // callback
    acre.request.params.callback = "foo";
    resp = acre.include("handlers/test/handle_me.ajax",
                        test_helpers.metadata("ajax", "handlers/ajax_handler", "handlers/test/handle_me.ajax"));
    ok(resp, "got acre.include response");
    check_response(resp, "foo");
  }
  finally {
    // remove callback param
    delete acre.request.params.callback;
  }
});

test("include error", function() {
  function check_response(resp, jsonp) {
    ok(/text\/javascript;\s*charset=utf\-8/.test(resp.headers["content-type"]));
    if (jsonp) {
      ok(resp.status == null, "status should not be set for jsonp");
      var rjsonp = new RegExp(["^\\s*", jsonp, "\\s*\\(\\s*"].join(""));
      resp = resp.replace(rjsonp, "").replace(/\s*\)\s*;\s*$/, "");
    }
    else {
      equal(resp.status, "400", "status 400");
    }
    var json = JSON.parse(resp);
    ok(json, "acre.include response is proper JSON");
    equal(json.status, "400 Bad Request");
    equal(json.code, "/api/status/error");
    ok(json.transaction_id, "got transaction_id");
  };

  var resp = acre.include("handlers/test/handle_me.error.ajax",
                          test_helpers.metadata("ajax", "handlers/ajax_handler", "handlers/test/handle_me.error.ajax"));
  ok(resp, "got acre.include response");
  check_response(resp);

  try {
    // callback
    acre.request.params.callback = "foo";
    resp = acre.include("handlers/test/handle_me.error.ajax",
                        test_helpers.metadata("ajax", "handlers/ajax_handler", "handlers/test/handle_me.error.ajax"));
    ok(resp, "got acre.include response");
    check_response(resp, "foo");
  }
  finally {
    // remove callback param
    delete acre.request.params.callback;
  }
});

acre.test.report();
