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

var lib = acre.require("handlers/ajax_lib");
var h = acre.require("helper/helpers.sjs");

test("ServiceResult", function() {
  var sr = new lib.ServiceResult();
  equal(sr.status, "200 OK");
  equal(sr.code, "/api/status/ok");

  sr = new lib.ServiceResult({foo:"bar"});
  same(sr.result, {foo:"bar"});
});

test("ServiceError", function() {
  var se = new lib.ServiceError();
  equal(se.status, "500 Internal Server Error");
  equal(se.code, "/api/status/error");
  ok(se instanceof Error, "expected ServiceError instanceOf Error");
  ok(h.isArray(se.messages), "messages should be an array");
  equal(se.messages.length, 0, "expected empty message array");

  se = new lib.ServiceError(null, null, "message1");
  equal(se.status, "500 Internal Server Error");
  equal(se.code, "/api/status/error");
  equal(se.messages.length, 1, "expected 1 message");
  equal(se.messages[0], "message1");

  se = new lib.ServiceError("401 Auth Required", "/api/some/error", {code:"foo", message:"message1", info:"bar"}, {code:"bar", message:"message2", info:"foo"});
  equal(se.status, "401 Auth Required");
  equal(se.code, "/api/some/error");
  equal(se.messages.length, 2, "expected 2 messages");
  ok(se.messages[1]);
  equal(se.messages[1].code, "bar");
  equal(se.messages[1].message, "message2");
  equal(se.messages[1].info, "foo");
});

test("check_user", function() {
  try {
    var user = lib.check_user();
    ok(user && user.id && user.guid && user.username, "check_user returned valid user");
    equal(user.status, "200 OK");
    equal(user.code, "/api/status/ok");
  }
  catch(e if e instanceof lib.ServiceError) {
    equal(e.status, "401 User Authorization Required");
    equal(e.code, "/api/status/error/auth");
    equal(e.messages.length, 1);
    equal(e.messages[0].code, "/api/status/error/auth/required");
  }
});

test("to_http_response", function() {
  function check_response(resp, jsonp) {
    ok(resp && typeof resp === "object", "got to_http_response");
    ok(resp.body && typeof resp.body === "string", "got to_http_response.body");
    ok(resp.headers && typeof resp.headers === "object", "got to_http_response.headers");
    equal(resp.headers["content-type"], "text/javascript; charset=utf-8");
    var body = resp.body;
    if (jsonp) {
      var rjsonp = new RegExp(["^\\s*", jsonp, "\\s*\\(\\s*"].join(""));
      console.log("rjsonp", rjsonp);
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
  var resp = lib.to_http_response(new lib.ServiceResult({foo:"bar"}));
  check_response(resp);

  // with callback
  try {
    acre.request.params.callback = "foo";
    resp = lib.to_http_response(new lib.ServiceResult({foo:"bar"}));
    check_response(resp, "foo");
  }
  finally {
    // remove callback param
    delete acre.request.params.callback;
  }

  function check_error(resp, jsonp) {
    ok(resp, "got to_http_response");
    ok(resp.body && typeof resp.body === "string", "got to_http_response.body");
    ok(resp.headers && typeof resp.headers === "object", "got to_http_response.headers");
    equal(resp.headers["content-type"], "text/javascript; charset=utf-8");
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
  resp = lib.to_http_response(new lib.ServiceError(null, null, "some message"));
  check_error(resp, null);

  // error - with callback
  try {
    acre.request.params.callback = "foo";
    resp = lib.to_http_response(new lib.ServiceError(null, null, "some message"));
    check_error(resp, "foo");
  }
  finally {
    // remove callback param
    delete acre.request.params.callback;
  }
});

test("instanceof_service_error", function() {
  ok(lib.instanceof_service_error(new lib.ServiceError()));
  ok(lib.instanceof_service_error(new acre.freebase.Error()));
  ok(lib.instanceof_service_error(new acre.errors.URLError()));
  ok(lib.instanceof_service_error("error"));
  ok(!lib.instanceof_service_error(""));
  ok(!lib.instanceof_service_error(null));
  ok(!lib.instanceof_service_error());
  ok(!lib.instanceof_service_error(new Error("foo")));
  function MyClass() {};
  ok(!lib.instanceof_service_error(new MyClass()));
  function MyServiceError() {};
  MyServiceError.prototype = new lib.ServiceError();
  ok(lib.instanceof_service_error(new MyServiceError()));
});

test("handle_service_error", function() {
  var se, e;
  // ServiceError
  e = new lib.ServiceError();
  same(lib.handle_service_error(e), e);

  // acre.freebase.Error
  e = new acre.freebase.Error();
  e.response = {
    "code": "/api/status/error",
    "messages": [
      {
        "code": "/api/status/error/input/invalid",
        "info": {
          "value": null
        },
        "message": "one of query=, or queries= must be provided"
      }
    ],
    "status": "400 Bad Request",
    "transaction_id": "cache;cache03.p01.sjc1:8101;2011-01-25T00:37:10Z;0044"
  };
  same(lib.handle_service_error(e), e.response);

  // acre.error.URLError
  e = new acre.errors.URLError("'url' argument (1st) to acre.urlfetch() must be a string");
  se = lib.handle_service_error(e);
  equal(se.code, "/api/status/error");
  equal(se.status, "500 Service Error");
  ok(se.messages && se.messages.length === 1, "expected 1 message");
  equal(se.messages[0].code, "/api/status/error/service/external");

  // string
  se = lib.handle_service_error("foo");
  equal(se.code, "/api/status/error");
  equal(se.status, "400 Bad Request");
  ok(se.messages && se.messages.length === 1, "expected 1 message");
  equal(se.messages[0].code, "/api/status/error/input/validation");
  equal(se.messages[0].message, "foo");

  // unrecognized error
  e = new Error("unknown error");
  equal(lib.handle_service_error(e), e);
});

acre.test.report();
