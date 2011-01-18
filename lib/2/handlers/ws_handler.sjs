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
var lib = acre.require("service/lib");
var deferred = acre.require("promise/deferred");

/**
 * A JSON/P web service handler for *.ws.
 *
 * A web service can be specified by declaring a ws specification as follows:
 *
 * var ws = {
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
      try {
        handle(module, script);
      }
      catch (e) {
        handle_service_error(e);
      }
      finally {
        return null;
      }
    }
  });
};

var handle = function(module, script) {
  var ws = module.ws;
  if (!(ws && typeof ws === "object")) {
    throw new lib.ServiceError(null, null, "ws is undefined");
  }
  ws = h.extend({}, {
    method: "GET",
    auth: false,
    validate: function(params) { return []; },
    run: function() {}
  }, ws);

  ["validate", "run"].forEach(function(m) {
    if (typeof ws[m] !== "function") {
      throw new lib.ServiceError(null, null, "ws." + m + " is undefined");
    }
  });

  var scope = script.scope;
  var req = scope.acre.request;

  //
  // 1. check method is supported (i.e., GET, POST, etc.)
  //
  if (typeof ws.method === "string") {
    ws.method = [ws.method];
  }
  var methods = {};
  ws.method.forEach(function(m) {
    if (m) {
      methods[m] = 1;
    }
  });
  if (!methods[req.method]) {
    throw new lib.ServiceError(null, null, req.method + " not supported");
  }

  //
  // 2. check authentication
  //
  if (ws.auth) {
    console.log("check_user");
    lib.check_user();
  }

  //
  // 3. validate required arguments
  //
  // TODO: handle binary POSTs
  var req_params = req.method === "POST" ? req.body_params : req.params;
  var args = ws.validate.apply(ws, [req_params]);

  //
  // 4. run web service
  //
  var svc;
  if (req.method === "POST") {
    svc = lib.PostService;
  }
  else {
    svc = lib.GetService;
  }
  function success(result) {
    svc(function() {
      return result;
    }, scope);
  };
  function error(e) {
    svc(function() {
      return handle_service_error(e);
    }, scope);
  };

  var d = ws.run.apply(ws, args);
  deferred.when(d, success, error);

  acre.async.wait_on_results();

  return null;
};

function handle_service_error(e) {
  /**
   * This series of catch blocks copied from
   * //service.libs.freebase.dev/lib (run_function_as_service)
   */

  if (e instanceof lib.ServiceError) {
    return lib.output_response(e);
  }
  else if (e instanceof acre.freebase.Error) {
    // it's an acre.freebase error so pass along original error from Freebase
    return lib.output_response(e.response);
  }
  else if (e instanceof acre.errors.URLError) {
    // it's an unknown urlfetch error so parse it
    var response = e.response.body;
    var info;
    try {
      // is it a JSON-formatted error?
      info = JSON.parse(response);
    }
    catch(e) {
      // otherwise just package the response as string
      info = response;
    }
    var msg = e.request_url ? "Error fetching " + e.request_url : "Error fetching external URL";
    return lib.output_response(new lib.ServiceError("500 Service Error", null, {
      message: msg,
      code : "/api/status/error/service/external",
      info :info
    }));
  }
  else {
    // catch all defaults to validation errors
    var msg = e;
    if (e instanceof Error) {
      msg = (typeof e.toString === "function") ? e.toString() : ""+e;
    }
    return lib.output_response(new lib.ServiceError("400 Bad Request", null, {
      message: msg,
      code : "/api/status/error/input/validation"
    }));
  }
};


