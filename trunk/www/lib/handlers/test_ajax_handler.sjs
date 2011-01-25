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

var test_helpers = acre.require("handlers/helpers_test");
var deferred = acre.require("promise/deferred");
var ajax_handler = acre.require("handlers/ajax_handler");
var lib = acre.require("handlers/ajax_lib");
var validators = acre.require("validator/validators");

//acre.require("handlers/mock_handler").record(this, ajax_handler, "handlers/playback_test_ajx_handler.json");

var mock_script = {
  scope: this
};
function no_op() {};

test("handle_service undefined SPEC", function() {
  expect(1);
  try {
    ajax_handler.handle_service({SPEC:null}, mock_script);
  }
  catch(e if e instanceof lib.ServiceError) {
    ok(e, "expected ServiceError: " + e);
  }
});

test("handle_service undefined SPEC.validate", function() {
  expect(1);
  var module = {
    SPEC: {
      run: no_op
    }
  };
  try {
    ajax_handler.handle_service(module, mock_script);
  }
  catch(e if e instanceof lib.ServiceError) {
    ok(e, "expected ServiceError: " + e);
  }
});

test("handle_service undefined SPEC.run", function() {
  expect(1);
  var module = {
    SPEC: {
      validate: no_op
    }
  };
  try {
    ajax_handler.handle_service(module, mock_script);
  }
  catch(e if e instanceof lib.ServiceError) {
    ok(e, "expected ServiceError: " + e);
  }
});

test("handle_service method", function() {
  expect(2);

  var orig_method = acre.request.method;
  var module = {
    SPEC: {
      method: "POST",
      validate: no_op,
      run: no_op
    }
  };
  try {
    ajax_handler.handle_service(module, mock_script);
  }
  catch(e if e instanceof lib.ServiceError) {
    ok(e && e.status === "405 Method Not Allowed", "expected 405");
  }

  // fake a POST w/o x-requested-with
  try {
    acre.request.method = "POST";
    ajax_handler.handle_service(module, mock_script);
  }
  catch(e if e instanceof lib.ServiceError) {
    ok(e && e.status === "400 Bad Request", "expected 400");
  }
  finally {
    acre.request.method = orig_method;
  }
});


test("handle_service auth", function() {
  expect(1);
  var user = acre.freebase.get_user_info();
  var module = {
    SPEC: {
      auth: true,
      validate: no_op,
      run: no_op
    }
  };
  if (user) {
    ajax_handler.handle_service(module, mock_script);
    ok(true, "auth check succeeded");
  }
  else {
    try {
      ajax_handler.handle_service(module, mock_script);
    }
    catch(e if e instanceof lib.ServiceError) {
      ok(e && e.status === "401 User Authorization Required", "expected 401");
    }
  }
});

test("handle_service validate", function() {
  expect(2);
  var module = {
    SPEC: {
      validate: function(params) {
        throw new validators.Invalid("invalid");
      },
      run: no_op
    }
  };
  try {
    ajax_handler.handle_service(module, mock_script);
  }
  catch(e if e instanceof lib.ServiceError) {
    ok(e && e.status === "400 Bad Request", "expected 400");
    ok(e.messages && e.messages.length && e.messages[0].code === "/api/status/error/input/validation", "expected /api/status/error/input/validation");
  }
});

test("handle_service run", function() {
  var module = {
    SPEC: {
      validate: function(params) {
        return ["p1", "p2"];
      },
      run: function(p1, p2) {
        return {p1:p1, p2:p2};
      }
    }
  };
  var result;
  ajax_handler.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    });
  ok(result.result, "expected run result");
  same(result.result, {p1:"p1", p2:"p2"});
});

test("handle_service run promise", function() {
  var module = {
    SPEC: {
      validate: function(params) {
        return ["p1", "p2"];
      },
      run: function(p1, p2) {
        return deferred.resolved({p1:p1, p2:p2});
      }
    }
  };
  var result;
  ajax_handler.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    });
  ok(result.result, "expected run result");
  same(result.result, {p1:"p1", p2:"p2"});
});


acre.test.report();
