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

var exports = {
  "extract_first_error": extract_first_error,
  "temporary_redirect": temporary_redirect,
  "link_user": link_user,
  "user_info": user_info,
  "UnauthorizedError": UnauthorizedError,
  "BadToken": BadToken,
  "UnregisteredError": UnregisteredError
};

var h = acre.require("lib/helper/helpers.sjs");
var deferred = acre.require("lib/promise/deferred");
var urlfetch = acre.require("lib/promise/apis").urlfetch;
var ServiceError = acre.require("lib/handlers/service_lib").ServiceError;

var UnauthorizedError = function() {
  this.message = 'Unauthorized.';
};
UnauthorizedError.prototype = new Error();

var BadToken = function() {
  this.message = 'Bad token';
};
BadToken.prototype = new Error();

var UnregisteredError = function() {
  this.message = 'Unregistered.';
};
UnregisteredError.prototype = new Error();

function link_user(token) {
  if (!acre.oauth.has_credentials(h.account_provider())) {
    return deferred.rejected(new UnauthorizedError());
  }
  
  var user_link_url = acre.freebase.googleapis_url+'/user/link';
  var link_params = acre.form.encode({token: token});

  return urlfetch(user_link_url,
                  {method: 'POST', content: link_params, sign: true})
    .then(function(response) {
      return JSON.parse(response.body);
      
    }, function(failure) {
      if (!failure.response) {
        console.error('Could not call Freebase API: ', failure);
        return failure;
      }
      
      try {
        var error = JSON.parse(failure.response.body).error;
      } catch (e) {
        console.error('Freebase API returned a badly formatted response: ', e);
        return e;
      }

      var e = extract_first_error(error);
      if (e.code === 401) {
        // Need to be sigedin to complete this process.
        acre.oauth.remove_credentials(h.account_provider());
        console.warn('Authorization credentials are not correct', e);
        throw new UnauthorizedError();
      } else if (e.code === 400) {
        // Need to be sigedin to complete this process.
        console.warn('Token is invalid', e);
        throw new BadToken();
      }
      
      console.warn('Could not process user info response: ', failure);
      return failure;
    });
}

function user_info() {
  if (!acre.oauth.has_credentials(h.account_provider())) {
    return deferred.rejected(new UnauthorizedError());
  }
  
  // Get user information using urlfetch so we can deal with custom errors.
  var user_info_url = acre.freebase.googleapis_url+'/user/info';
  return urlfetch(user_info_url, {sign: true})
    .then(function(response) {
      return JSON.parse(response.body);
      
    }, function(failure) {
      if (!failure.response) {
        console.error('Could not call Freebase API: ', failure);
        return failure;
      }
      
      try {
        var error = JSON.parse(failure.response.body).error;
      } catch (e) {
        console.error('Freebase API returned a badly formatted response: ', e);
        return e;
      }

      var e = extract_first_error(error);
      if (e.reason === 'unregistered') {
        throw new UnregisteredError();
      } else if (e.code === 401) {
        throw new UnauthorizedError();
      }
      
      console.warn('Could not process user info response: ', failure);
      return failure;
    });
}

function extract_first_error(error) {
  var e = {
    code: error.code,
    message: error.message
  };
  if (error.errors && error.errors.length) {
    return h.extend(e, error.errors[0]);
  }
  return e;
}

function temporary_redirect(url, can_exit) {
  // Don't let account redirect to other sites
  var host_domain = acre.request.server_name.split(".").slice(-2).join(".");
  var rd_parts = parse_uri(url);
  var rd_domain = rd_parts.host.split(".").slice(-2).join(".");

  if (host_domain != rd_domain) {
    console.warn("Didn't redirect because url was on a different domain.");
    return can_exit ? acre.exit() : null;
  }
  
  if (!/^https?$/.test(rd_parts.protocol)) {
    console.warn("Didn't redirect because url was not using http(s).");
    return can_exit ? acre.exit() : null;
  }


  if (can_exit) {
    acre.response.status = 302;
    acre.response.set_header("Location", url);
    acre.exit();
  }
  else {
    var error = new ServiceError(302);
    error.location = url;
    throw error;
  }
}

h.extend_helpers(this);
