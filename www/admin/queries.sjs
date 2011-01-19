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

var deferred = acre.require("lib/promise/deferred");
var freebase = acre.require("lib/promise/apis").freebase;
var urlfetch = acre.require("lib/promise/apis").urlfetch;

var get_apps = function(environment) {
  var url = "http://environments.svn.freebase-site.googlecode.dev." + acre.host.name + 
            (acre.host.port ? ":" + acre.host.port : "") + "/" + environment;

  return urlfetch(url)
    .then(function(res){
      return JSON.parse(res.body);
    })
    .then(function(env) {
      var rules = env.prefix;

      // de-dupe and clean-up apps
      var apps = {};
      return rules.filter(function(rule) {
        if (!rule.app) return false;
        rule.app = "//" + rule.app.split("/")[2];
        if (apps[rule.app]) return false
        apps[rule.app] = true;
        return true;
      }).map(function(rule) {
        return rule.app;
      });
    });
};

var get_mounts = function(app_path) {
  return acre.get_metadata(app_path).mounts;
};

var get_dependencies = function(environment) {
  return get_apps(environment).
    then(function(apps) {
      var d = {};
      apps.forEach(function(app) {
        d[app] = get_mounts(app);
      });
      return d;
    })
};