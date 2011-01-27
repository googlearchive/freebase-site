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
  var user = acre.freebase.get_user_info();
  if (!user) {
    throw new ServiceError("401 User Authorization Required", "/api/status/error/auth", {
      message: "User must be logged in to use this service.",
      code : "/api/status/error/auth/required"
    });
  }
  return user;
};

function to_http_response(ret) {
  var resp = {body:null, headers:{}};

  // update transaction id and extract the timestamp from it
  var tid = acre.request.headers['x-metaweb-tid'];
  if (tid) {
    ret.transaction_id = tid;
    ret.timestamp = (tid.split(';')[2].match(/.*Z$/) || [null])[0];
  } else {
    ret.transaction_id = "Doh!  Sorry, no transaction id available.";
  }
  resp.headers["content-type"] = 'text/javascript; charset=utf-8';

  var callback = acre.request.params.callback;
  if (callback) {
    resp.body = [callback, "(", JSON.stringify(ret, null, 2), ");"].join("");
  } else {
    // only set non-200 status code if not in a JSONP request
    var status_code = (typeof ret.status === "number") ? ret.status : parseInt(ret.status.split(' ')[0]);
    if (status_code) {
      resp.status = status_code;
    }
    resp.body = JSON.stringify(ret, null, 2);
  }
  return resp;
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
    var info;
    if (e.repsonse && e.response.body) {
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
    var msg = e.request_url ? "Error fetching " + e.request_url : "Error fetching external URL";
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

