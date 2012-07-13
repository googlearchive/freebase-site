/*
 * Copyright 2012, Google Inc.
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
var h = acre.require("helper/helpers.sjs");
var deferred = acre.require("promise/deferred.sjs");
var validators = acre.require("validator/validators.sjs");

function ServiceResult(result) {
  this.status = "200 OK";
  this.code = "/api/status/ok";
  this.result = result;
};

function ServiceError(status, code /**, message1, message2, ... **/) {
  // NOTE: any number of message objects can be passed as additional arguments

  this.status = status || "500 Internal Server Error";
  this.code = code || "/api/status/error";

  this.messages = [];
  var messages = Array.prototype.slice.call(arguments, 2);
  for (var i=0,l=messages.length; i<l; i++) {
    var msg = messages[i];
    if (typeof msg.code    === 'undefined') { msg.code    = null; }
    if (typeof msg.message === 'undefined') { msg.message = null; }
    if (typeof msg.info    === 'undefined') { msg.info    = null; }
    this.messages.push(msg);
  };
};
ServiceError.prototype = new Error();

function check_user() {
  /**
   * If user account cookie, make sure oauth tokens have not expired
   */
  var user = h.get_account_cookie();
  if (user) {
    var access_token = acre.oauth.has_credentials(h.account_provider());
    if (access_token) {
      return user;
    }
  }
  throw new ServiceError("401 User Authorization Required", "/api/status/error/auth", {
    message: "User must be logged in to use this service.",
    code : "/api/status/error/auth/required"
  });
};


/**
 * known errors this library can handle
 * @see handle_service_error
 */
function instanceof_service_error(obj) {
  return obj && (obj instanceof ServiceError ||
    obj instanceof acre.freebase.Error ||
    obj instanceof acre.errors.URLError ||
    typeof obj === "string");
};


/**
 * When you use handle_service_error, it's advisable to first check if it can handle the error
 * so that acre can output the unknown error as a JS call stacktrace.
 *
 * try {
 *   ...
 * }
 * catch (e if instanceof_service_error) {
 *   handle_service_error(e);
 * }
 */
function handle_service_error(e) {
  if (e instanceof ServiceError) {
    // it's an already handled error
    return e;
  }
  else if (e instanceof acre.freebase.Error) {
    // it's an acre.freebase error so pass along original error from Freebase
    return e.response;
  }
  else if (e instanceof acre.errors.URLError) {
    // it's an unknown urlfetch error so parse it
    var info = e;
    if (e.response && e.response.body) {
      var response = e.response.body;
      try {
        // is it a JSON-formatted error?
        info = JSON.parse(response);
      }
      catch(e) {
        // otherwise just package the response as string
        info = response;
      }
    }
    var msg = e.message || "Error fetching external URL";
    return new ServiceError("500 Service Error", null, {
      message: msg,
      code : "/api/status/error/service/external",
      info :info
    });
  }
  else if (typeof e === "string") {
    return new ServiceError("400 Bad Request", null, {
      message: e,
      code : "/api/status/error/input/validation"
    });
  }
  // don't know how to handle this error, just return it
  return e;
};



/**
 * A web service can be specified by declaring a SPEC as follows:
 *
 * var SPEC = {
 *   method: "POST",
 *   auth: true,
 *   validate: function(params) {
 *     // return an array to be applied to the run method
 *   },
 *   run: function(...) {
 *     // return JSON or a promise returning JSON
 *   }
 * };
 *
 * method:String (optional)
 * - supported http method(s)
 * - can be a single http method or an array of methods (i.e., ["GET", "POST"]
 * - default is "GET"
 *
 * auth:Boolean (optional)
 * - if true, check user authentication
 * - default is false
 *
 * validate:Function (optional)
 * - validate request params
 * - return an array of validated arguments that will be applied to the run method
 *
 * run:Function (required)
 * - main run method of the web service
 * - return JSON or a promise returning JSON.
 */
function handle_service(spec, scope) {
  if (!(spec && typeof spec === "object")) {
    return deferred.rejected(new ServiceError(null, null, "SPEC is undefined"));
  }
  spec = h.extend({}, {
    method: "GET",
    auth: false,
    validate: function () {return [];}
  }, spec);

  // SPEC needs to implement run
  if (typeof spec.run !== "function") {
    return deferred.rejected(new ServiceError(null, null, "SPEC.run is undefined"));
  }

  var req = scope.acre.request;

  //
  // 1. check method is supported (i.e., GET, POST, etc.)
  //
  if (typeof spec.method === "string") {
    spec.method = [spec.method];
  }
  var methods = {};
  spec.method.forEach(function(m) {
    if (m) {
      methods[m] = 1;
    }
  });
  if (!methods[req.method]) {
    return deferred.rejected(new ServiceError("405 Method Not Allowed", null, {
      message: "Request method not supported: " + req.method,
      code: "/api/status/error/request/method"
    }));
  }
  if (req.method === "POST" && !(
    (acre.request.params["ACRE_CSRF_TOKEN"] || acre.request.body_params["ACRE_CSRF_TOKEN"]) ||
    (acre.request.headers['x-requested-with'] === "XMLHttpRequest"))) {
    return deferred.rejected(new ServiceError("400 Bad Request", null, {
      message: "Request must include a valid 'X-Requested-With' header or ACRE_CSRF_TOKEN value",
      code: "/api/status/error/request/method"
    }));
  }

  //
  // 2. check authentication
  //
  var auth_user;
  if (spec.auth) {
    try {
      auth_user = check_user();
    }
    catch (e if e instanceof ServiceError) {
      return deferred.rejected(e);
    }
  }

  //
  // 3. validate required arguments
  //
  // TODO: handle binary POSTs
  var req_params = h.extend({auth_user: auth_user}, req.params, req.body_params);
  var args;
  try {
    args = spec.validate.apply(null, [req_params]);
  }
  catch(e if (e instanceof validators.Invalid ||
              e instanceof validators.IfException)) {
    return deferred.rejected(new ServiceError("400 Bad Request", null, {
      message: e.message,
      code : "/api/status/error/input/validation"
    }));
  }


  //
  // 4. run web service
  //
  return deferred.resolved()
    .then(function() {
      return spec.run.apply(scope, args);
    })
    .then(function(r) {
      return deferred.all(r);
    })
    .then(function(r) {
      return new ServiceResult(r);
    });
};
