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
  "router": HostRouter
};

var rules = [
  {host:"freebase.com", url:"http://www.freebase.com"},
  {host:"sandbox-freebase.com", url:"http://www.sandbox-freebase.com"},
  {host:"sandbox.freebase.com", url:"http://www.sandbox-freebase.com"},
  {host:"acre.freebase.com", url:"http://www.freebase.com/appeditor"},
  {host:"acre.sandbox-freebase.com", url:"http://www.sandbox-freebase.com/appeditor"},
  {host:"api.freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
  {host:"api.sandbox-freebase.com", url:"http://wiki.freebase.com/wiki/Freebase_API"},
  {host:"metaweb.com", url:"http://www.freebase.com"},
  {host:"www.metaweb.com", url:"http://www.freebase.com"}
];


var h = acre.require("helper/helpers_util.sjs");

/**
 * host->url redirector
 */
function HostRouter() {
  var route_list = [];
  var route_map = {};

  var add = this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }
    routes.forEach(function(route) {
      if (!route || !route.host || !route.url) {
        throw 'A routing rule must be a dict with valid host and url: ' + JSON.stringify(route);
      }
      route_map[route.host] = route.url;
      h.splice_with_key(route_list, "host", route);
    });
  };

  var route = this.route = function(req) {
    var url = route_map[req.server_name];
    if (url) {
      var req_path = req.url.replace(req.app_url, "");
      acre.response.status = 301;
      acre.response.set_header("location", url + req_path);
      acre.response.set_header("cache-control", "public, max-age: 3600");
      acre.exit();
      return true;
    }
    return false;
  };

  var dump = this.dump = function() {
    return route_list.slice();
  };

  this.add(rules);
};



