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

var h = acre.require("helper/helpers.sjs");
var hh = acre.require("handlers/helpers.sjs");
var lib = acre.require("handlers/service_lib.sjs");
var deferred = acre.require("promise/deferred.sjs");
var validators = acre.require("validator/validators.sjs");
var handle_service = acre.require("handlers/controller_handler.sjs").handle_service;

/**
 * A JSON/P web service handler for *.ajax.
 *
 *
 *
 * TODO:
 *   // cache_policy
 * if (h.is_client() && fn.cache_policy) {
 *   acre.response.set_cache_policy(fn.cache_policy);
 * }
 */
function handler() {
  return h.extend({}, acre.handlers.acre_script, {
    to_http_response: function(module, script) {
      var resp;
      var d = lib.handle_service(module, script)
        .then(
          function(result) {
            return to_ajax_response(result);
          },
          function(e) {
            if (lib.instanceof_service_error(e)) {
              return to_ajax_response(lib.handle_service_error(e));
            }
            return e;
          }
        )
        .then(function(r) {
         resp = r;
        });
      acre.async.wait_on_results();
      try {
        d.cleanup();
      }
      catch(ex) {
        // unhandled error - don't want to redirect to error page
        resp = to_ajax_response(new lib.ServiceError(null, null, ex));
      }
      return hh.to_http_response_result(resp.body, resp.headers, resp.status);
    }
  });
};


function to_ajax_response(ret) {
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
    var status_code = (typeof ret.status === "number") ? ret.status : parseInt(ret.status.split(' ')[0], 10);
    if (status_code) {
      resp.status = status_code;
    }
    resp.body = JSON.stringify(ret, null, 2);
  }
  return resp;
};
