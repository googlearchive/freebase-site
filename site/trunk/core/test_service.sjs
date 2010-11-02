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

var mf = acre.require("MANIFEST").mf;
var service = mf.require("service");
var h = mf.require("helpers");
var scope = this;
var deferred = mf.require("promise", "deferred");

function MockServiceError(error) {
  this.error = error;
};
function MockSuccess(result) {
  this.result = result;
};
function MockError(error) {
  this.error = error;
};

service.mock = {
  handle_service_error: function(e) {
    throw new MockServiceError(e);
  },
  success: function(result) {
    throw new MockSuccess(result);
  },
  error: function(e) {
    throw new MockError(e);
  }
};

function init_request(options) {
  return h.extend(scope.acre.request, options);
};


test("ApiNotFoundError", 2, function() {
  init_request({
    path_info: "/foo"
  });
  try {
    service.main(scope, null);
  }
  catch(e if e instanceof service.ApiNotFoundError) {
    ok(e, JSON.stringify(e));
  }
  try {
    service.main(scope, {});
  }
  catch(e if e instanceof service.ApiNotFoundError) {
    ok(e, JSON.stringify(e));
  }
});

test("required args", 7, function() {
  init_request({
    path_info: "/foo"
  });
  var api = {
    foo: function() {return true;}
  };
  api.foo.args = ["bar"];
  try {
    service.main(scope, api);
  }
  catch(e if e instanceof MockServiceError) {
    ok(e.error instanceof service.lib.ServiceError);
    var error = e.error;
    equal(error.status, "400 Bad Request");
    equal(error.code, "/api/status/error");
    ok(error.messages && error.messages.length);
    equal(error.messages[0].message, "Missing bar argument");
    equal(error.messages[0].code, "/api/status/error/input/validation");
    equal(error.messages[0].info, "bar");
  }
});

test("required auth", 6, function() {
  if (acre.freebase.get_user_info()) {
    ok(false, "Please run this test after signing out");
    return;
  }
  init_request({
    path_info: "/foo"
  });
  var api = {
    foo: function() {return true;}
  };
  api.foo.auth = true;
  try {
    service.main(scope, api);
  }
  catch(e if e instanceof MockServiceError) {
    ok(e.error instanceof service.lib.ServiceError);
    var error = e.error;
    equal(error.status, "401 User Authorization Required");
    equal(error.code, "/api/status/error/auth");
    ok(error.messages && error.messages.length);
    equal(error.messages[0].message, "User must be logged in to use this service.");
    equal(error.messages[0].code, "/api/status/error/auth/required");
  }
});


test("service success", 1, function() {
  init_request({
    path_info: "/foo"
  });
  var api = {
    foo: function(args) {return {foo:"bar"};}
  };
  try {
    service.main(scope, api);
  }
  catch(e if e instanceof MockSuccess) {
    deepEqual(e.result, {foo:"bar"});
  }
});

test("service error", 1, function() {
  init_request({
    path_info: "/foo"
  });
  var api = {
    foo: function(args) {throw "bar";}
  };
  try {
    service.main(scope, api);
  }
  catch(e if e instanceof MockServiceError) {
    deepEqual(e.error, "bar");
  }
});

test("service deferred", function() {
  var old_success = service.mock.success;
  try {
    service.mock.success = function(result) {
      deepEqual(result, {foo:"bar"});
      return result;
    };

    init_request({
      path_info: "/foo"
    });
    var api = {
      foo: function(args) {
        return deferred.resolved({foo:"bar"});
      }
    };
    service.main(scope, api);
  }
  finally {
    service.mock.success = old_success;
  }

});

acre.test.report();

