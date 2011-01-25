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

var h = acre.require("core/helpers");
var lib = acre.require("handlers/ajax_lib");
var deferred = acre.require("promise/deferred");
var validators = acre.require("validator/validators");

/**
 * A JSON/P web service handler for *.ajax.
 *
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
 * validate:Function (required)
 * - validate request params
 * - return an array of validated arguments that will be applied to the run method
 *
 * run:Function (required)
 * - main run method of the web service
 * - return JSON or a promise returning JSON.
 */
var handler = function() {
  return h.extend({}, acre.handlers.acre_script, {
    to_http_response: function(module, script) {
      var d = deferred.resolved()
        .then(function() {
          return handle_service(module, script);
        })
        .then(function(result) {
          return lib.to_http_response(result);
        }, function(e) {
          if (lib.instanceof_service_error(e)) {
            return lib.to_http_response(lib.handle_service_error(e));
          }
          else {
            throw e;
          }
        })
        .then(function(body) {
          module.body = body;
        });
      acre.async.wait_on_results();
      d.cleanup();
      return module;
    }
  });
};

function handle_service(module, script) {
  var spec = module.SPEC;
  if (!(spec && typeof spec === "object")) {
    throw new lib.ServiceError(null, null, "SPEC is undefined");
  }
  spec = h.extend({}, {
    method: "GET",
    auth: false,
    validate: null,
    run: null
  }, spec);

  // SPEC needs to implement validate and run
  ["validate", "run"].forEach(function(m) {
    if (typeof spec[m] !== "function") {
      throw new lib.ServiceError(null, null, "SPEC." + m + " is undefined");
    }
  });

  var scope = script.scope;
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
    throw new lib.ServiceError("405 Method Not Allowed", null, {
      message: "Request method not supported: " + req.method,
      code: "/api/status/error/request/method"
    });
  }
  if (req.method === "POST" && !acre.request.headers['x-requested-with']) {
    throw new lib.ServiceError("400 Bad Request", null, {
      message: "Request must include 'X-Requested-With' header",
      code: "/api/status/error/request/method"
    });
  }

  //
  // 2. check authentication
  //
  if (spec.auth) {
    //console.log("check_user");
    lib.check_user();
  }

  //
  // 3. validate required arguments
  //
  // TODO: handle binary POSTs
  var req_params = req.method === "POST" ? req.body_params : req.params;
  var args;
  try {
    args = spec.validate.apply(null, [req_params]);
  }
  catch(e if (e instanceof validators.Invalid ||
              e instanceof validators.IfException)) {
    throw new lib.ServiceError("400 Bad Request", null, {
      message: e.message,
      code : "/api/status/error/input/validation"
    });
  }

  //
  // 4. run web service
  //
  var d = spec.run.apply(null, args);
  return deferred.whenPromise(d,
    function(r) {
      return new lib.ServiceResult(r);
    });
};
