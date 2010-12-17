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

var extend = acre.require("helpers_util").extend;

var CACHE_POLICIES = {
  "nocache": {
    "private": true,
    "no-cache": true,
    "max-age": 0
  },
  "private": {
    "private": true,
    "max-age": 0,
    "maxage-vary-cookie": "3600|mwLastWriteTime"
  },
  "public": {
    "public": true,
    "max-age": 3600
  }
};

function cache_control(policy, options) {
  var options = options || {};
  var cache_options = {};
  
  if (typeof policy === "string") {
    if (!CACHE_POLICIES[policy]) {
      throw new Error("No cache policy called '"+policy+"'");
    };
    cache_options = extend(cache_options, CACHE_POLICIES[policy], options);
  } else if (typeof policy === "object") {
    cache_options = extend(cache_options, policy);
  }
  
  var cache_options_list = [];
  for (var key in cache_options) {
    var value = cache_options[key];
    if (typeof value === "string") {
      value = key+'="'+value+'"';
    } else if (typeof value === "number") {
      value = key+'='+value;
    } else {
      value = key;
    }
    cache_options_list.push(value);
  }
  
  return [cache_options_list.join(", "), cache_options];
}

function set_cache_policy(policy, options) {
  var [cache_control_value, cache_options] = cache_control(policy, options);
  acre.response.headers["cache-control"] = cache_control_value;
  
  if (typeof cache_options["max-age"] === "number") {
    var expires = new Date(acre.request.start_time.getTime() + cache_options["max-age"] * 1000);
    acre.response.headers["expires"] = expires.toUTCString();
  }
}