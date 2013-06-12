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
var hh = acre.require("handlers/helpers.sjs");
var lib = acre.require("handlers/service_lib.sjs");
var deferred = acre.require("promise/deferred.sjs");
var validators = acre.require("validator/validators.sjs");


/**
 * A JSON/P web service handler for *.ajax.
 */
function handler() {
  // set up custom error handler for outputting unhandled errors as JSON
  acre.response.set_error_page("error/ajax_error.sjs");
  
  return h.extend({}, acre.handlers.acre_script, {
    to_http_response: function(module, script) {
      var resp;
      var d = lib.handle_service(module.SPEC, script.scope)
        .then(
          function(result) {
            var r = to_ajax_response(result);
            var cache_policy = module.SPEC.cache_policy;
            if (!cache_policy) {
              if (!module.SPEC.method || module.SPEC.method === "GET") {
                cache_policy = "private";
              }
              else {
                cache_policy = "nocache";
              }
            }
            h.set_cache_policy(cache_policy, null, r.headers);
            return r;
          },
          function(e) {
            if (lib.instanceof_service_error(e)) {
              var r = to_ajax_response(lib.handle_service_error(e));
              h.set_cache_policy("nocache", null, r.headers);
              return r;
            }
            return e;
          }
        )
        .then(function(r) {
          resp = r;
        });
      acre.async.wait_on_results();
      d.cleanup();
      return hh.to_http_response_result(resp.body, resp.headers, resp.status);
    }
  });
};


function to_ajax_response(ret) {
  if (h.isArray(ret) || typeof ret !== "object") {
    return to_ajax_response(new lib.ServiceError(null, null, "Ajax response must be a dictionary"));
  }
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
  if (ret.status) {
    var status_code = (typeof ret.status === "number") ? ret.status : parseInt(ret.status.split(' ')[0], 10);
    resp.status = status_code;
  }
  resp.body = JSON.stringify(ret, null, 2);
  return resp;
};
