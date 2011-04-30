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

var lib = acre.require("handlers/service_lib");
var h = acre.require("helper/helpers.sjs");
var validators = acre.require("validator/validators.sjs");
var deferred = acre.require("promise/deferred.sjs");

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
    ok(user && user.id, "check_user returned valid user");
  }
  catch(e if e instanceof lib.ServiceError) {
    equal(e.status, "401 User Authorization Required");
    equal(e.code, "/api/status/error/auth");
    equal(e.messages.length, 1);
    equal(e.messages[0].code, "/api/status/error/auth/required");
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



var mock_script = {
  scope: this
};
function no_op() {};

test("handle_service undefined SPEC", function() {
  expect(3);
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  ok(!result, "expected error");
  ok(error, "expected error");
  ok(error instanceof lib.ServiceError, "expected ServiceError:" + error);
});

test("handle_service undefined SPEC.validate", function() {
  expect(2);
  var module = {
    SPEC: {
      run: no_op
    }
  };
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  ok(result, "use default of no params");
  ok(!error, "shouldn't error");
});

test("handle_service undefined SPEC.run", function() {
  expect(3);
  var module = {
    SPEC: {
      validate: no_op
    }
  };
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  ok(!result, "expected error");
  ok(error, "expected error");
  ok(error instanceof lib.ServiceError, "expected ServiceError:" + error);
});

test("handle_service method", function() {
  expect(8);

  var orig_method = acre.request.method;
  var module = {
    SPEC: {
      method: "POST",
      validate: no_op,
      run: no_op
    }
  };
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  ok(!result, "expected error");
  ok(error, "expected error");
  ok(error instanceof lib.ServiceError, "expected ServiceError:" + error);
  equal(error.status, "405 Method Not Allowed", "expected status: 405 Method Not Allowed");


  // fake a POST w/o x-requested-with
  result = null;
  error = null;
  try {
    acre.request.method = "POST";
    lib.handle_service(module, mock_script)
      .then(function(r) {
        result = r;
      }, function(e) {
        error = e;
      });
    ok(!result, "expected error");
    ok(error, "expected error");
    ok(error instanceof lib.ServiceError, "expected ServiceError:" + error);
    equal(error.status, "400 Bad Request", "expected status: 400 Bad Request");
  }
  finally {
    acre.request.method = orig_method;
  }
});


test("handle_service auth", function() {
  var user = acre.freebase.get_user_info();
  var module = {
    SPEC: {
      auth: true,
      validate: no_op,
      run: no_op
    }
  };
  if (user) {
    expect(2);
    var result, error;
    lib.handle_service(module, mock_script)
      .then(function(r) {
        result = r;
      }, function(e) {
        error = e;
      });
    ok(result, "auth check succeeded");
    ok(!error, "no errors");
  }
  else {
    expect(4);
    var result, error;
    lib.handle_service(module, mock_script)
      .then(function(r) {
        result = r;
      }, function(e) {
        error = e;
      });
    ok(!result, "expected error");
    ok(error, "expected error");
    ok(error instanceof lib.ServiceError, "expected ServiceError:" + error);
    equal(error.status,  "401 User Authorization Required", "expected status: 401 User Authorization Required");
  }
});

test("handle_service validate", function() {
  expect(5);
  var module = {
    SPEC: {
      validate: function(params) {
        throw new validators.Invalid("invalid");
      },
      run: no_op
    }
  };
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  ok(!result, "expected error");
  ok(error, "expected error");
  ok(error instanceof lib.ServiceError, "expected ServiceError:" + error);
  equal(error.status,  "400 Bad Request", "expected status: 400 Bad Request");
  ok(error.messages && error.messages.length && error.messages[0].code === "/api/status/error/input/validation",
    "expected /api/status/error/input/validation");
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
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    });
  ok(result.result, "expected run result");
  same(result.result, {p1:"p1", p2:"p2"});
});

test("handle_service run error", function() {
  var module = {
    SPEC: {
      validate: function(params) {
        return ["p1", "p2"];
      },
      run: function(p1, p2) {
        throw "catch me";
      }
    }
  };
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  ok(!result, "expected error");
  ok(error, "expected error: " + error.toString());
  equal(error.message, "catch me", "expected error: " + error);
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
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    });
  ok(result.result, "expected run result");
  same(result.result, {p1:"p1", p2:"p2"});
});

test("handle_service run promise error", function() {
  var module = {
    SPEC: {
      validate: function(params) {
        return ["p1", "p2"];
      },
      run: function(p1, p2) {
        return deferred.resolved()
          .then(function() {
            throw "catch me";
          });
      }
    }
  };
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  ok(!result, "expected error");
  ok(error, "expected error: " + error.toString());
  equal(error.message, "catch me", "expected error: " + error);
});


test("handle_service run promise dictionary", function() {
  var module = {
    SPEC: {
      validate: function(params) {
        return ["p1", "p2"];
      },
      run: function(p1, p2) {
        return {
          p1: p1,
          p2: deferred.resolved(p2)
        };
      }
    }
  };
  var result;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    });
  ok(result.result, "expected run result");
  same(result.result, {p1:"p1", p2:"p2"});
});

test("handle_service run promise dictionary error", function() {
  var module = {
    SPEC: {
      validate: function(params) {
        return ["p1", "p2"];
      },
      run: function(p1, p2) {
        return {
          p1: p1,
          p2: deferred.resolved()
            .then(function() {
              throw "catch me";
            })
        };
      }
    }
  };
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  console.log("result", result, "error", error);
  ok(!result, "expected error");
  ok(error, "expected error: " + error.toString());
  equal(error.message, "catch me", "expected error: " + error);
});

test("handle_service run promise array", function() {
  var module = {
    SPEC: {
      validate: function(params) {
        return ["p1", "p2"];
      },
      run: function(p1, p2) {
        return [deferred.resolved(p1), p2];
      }
    }
  };
  var result;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    });
  ok(result.result, "expected run result");
  same(result.result, ["p1", "p2"]);
});

test("handle_service run promise array error", function() {
  var module = {
    SPEC: {
      validate: function(params) {
        return ["p1", "p2"];
      },
      run: function(p1, p2) {
        return [deferred.resolved(p1).then(function() {
          throw "catch me";
        }), p2];
      }
    }
  };
  var result, error;
  lib.handle_service(module, mock_script)
    .then(function(r) {
      result = r;
    }, function(e) {
      error = e;
    });
  console.log("result", result, "error", error);
  ok(!result, "expected error");
  ok(error, "expected error: " + error.toString());
  equal(error.message, "catch me", "expected error: " + error);
});

acre.test.report();
