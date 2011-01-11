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

function process() {
  var user = acre.freebase.get_user_info();
  if (user) {
    var queryString = acre.environ.params["query"];
    if (queryString == null || queryStringlength == 0) {
      queryString = acre.environ.body_params["query"];
    }
    
    var queryEnvelope = JSON.parse(queryString);
    
    var response;
    var error = null;
    var query = queryEnvelope.query;
    delete queryEnvelope.query;
     
    if ("service" in acre.request.params) {
      var serviceHost = acre.request.params["service"];
      var provider = {
        domain                 : serviceHost,
        request_token_URL      : "https://" + serviceHost + "/api/oauth/request_token",
        access_token_URL       : "https://" + serviceHost + "/api/oauth/access_token",
        user_authorization_URL : "https://" + serviceHost + "/signin/app"
      };
      acre.oauth.providers.freebase = provider;
      acre.oauth.get_authorization();
    }
      
    try {
      response = acre.freebase.mqlwrite(query, queryEnvelope);
    } catch (e) {
      error = e;
      response = e.response || e;
    }
    acre.write('{ "headers": ');
    acre.write("headers" in response ? JSON.stringify(response.headers) : "{}");
    acre.write(', "body": ');
    acre.write("body" in response ? response.body : JSON.stringify(response));
    if (error != null) {
      acre.write(', "error": ' + JSON.stringify(error.message));
    }
    acre.write(" }");
  } else {
    acre.write('{ "error": "unauthorized" }');
  }
}

if (acre.environ.request_method != "POST") {
  acre.start_response(500);
  acre.write(JSON.stringify({ "status" : 500, "error" : "HTTP GET not supported." }));
} else {
  var callback = acre.environ.params["callback"];
  acre.start_response(200);
  if (callback) {
    acre.write(callback + "(");
  }
  process();
  if (callback) {
    acre.write(")");
  }
}