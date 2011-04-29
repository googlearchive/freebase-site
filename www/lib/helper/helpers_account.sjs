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

var exports = {
  "set_account_cookie": set_account_cookie,
  "clear_account_cookie": clear_account_cookie,
  "get_account_cookie": get_account_cookie,
  "account_cookie_name": account_cookie_name,
  "account_cookie_options": account_cookie_options,
  "has_account_credentials": has_account_credentials
};

var extend = acre.require("helper/helpers_util.sjs").extend;

function account_cookie_name() {
  return "fb-account-name";
}

function account_cookie_options(options) {
  return extend({}, {path: "/"}, options);
}

function set_account_cookie(user_info) {
  // Create a cookie containing user information
  var long_expire = new Date();
  var account_name = user_info.id.slice(user_info.id.lastIndexOf("/")+1);
  long_expire.setTime(long_expire.getTime() + 30*24*60*60*1000);
  acre.response.set_cookie(account_cookie_name(),
                           account_name,
                           account_cookie_options({expires: long_expire}));
}

function clear_account_cookie() {
  acre.response.clear_cookie(account_cookie_name(), account_cookie_options());
}

function has_account_credentials() {
  if (acre.freebase.apiary_url) {
    return acre.oauth.has_credentials();
  } else {
    return !!acre.request.cookies['metaweb-user'];
  }
}

function get_account_cookie() {
  var account_name = acre.request.cookies[account_cookie_name()];
  if (!account_name) {
    return null;
  }

  return {
    id: '/user/'+account_name,
    name: account_name
  };
}