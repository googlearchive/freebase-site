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

var mf = acre.require("MANIFEST").mf;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var delete_type = mf.require("delete_type").delete_type;
var h = mf.require("core", "helpers");

function delete_domain(domain_id, user_id, dry_run) {
  return domain_info(domain_id, user_id)
    .then(function(info) {
      if (!info.has_permission) {
        return deferred.rejected(h.sprintf("User %s does not have permission on domain %s", user_id, domain_id));
      }
      else if (info["commons:key"].length) {
        return deferred.rejected(h.sprintf("Can't delete a commons domain %s", info.id));
      }
      else if (info["default_domain:key"].length) {
        return deferred.rejected(h.sprintf("Can't delete user default domain %s", info.id));
      }

      // dry run, just return domain info
      if (dry_run) {
        return [info, null, null];
      }

      var base_key = info["base:key"];
      if (base_key.length) {
        // We need special permission to remove base keys.
        // We need to write as /freebase/site/schema app's permitted user: /user/appeditoruser
        // by setting http_sign=false.
        // However, this is only available on production and sandbox.
        var options = null;
        if (/www.(freebase|sandbox\-freebase)\.com$/.test(acre.request.server_name)) {
          // http_sign: false only works on www.freebase|sandbox-freebase.com
          options = {
            http_sign: false
          };
        }
        try {
          var q = {
            guid: info.guid,
            key: [{value:k.value, namespace:"/base", connect:"delete"} for each (k in base_key)]
          };
          var env = acre.freebase.mqlwrite(q, null, options);
          if (env.code !== "/api/status/ok") {
            return deferred.rejected(env);
          }
          base_key = env.result;
        }
        catch(ex) {
          return deferred.rejected(ex);
        }
      }

      var q = {
        guid: info.guid,
        type: {id: "/type/domain", connect:"delete"},
        "/dataworld/gardening_task/async_delete": {value:true, connect:"update"}
      };
      var permits_key = info["permits:key"];
      if (permits_key.length) {
        q.key = [{value:k.value, namespace:k.namespace.id, connect:"delete"} for each (k in permits_key)];
      }
      return freebase.mqlwrite(q)
        .then(function(env) {
          return [info, base_key, env.result];
        });
    });
};

function domain_info(domain_id, user_id) {
  var q = {
    id : domain_id,
    guid: null,
    name: null,
    type: "/type/domain",
    "commons:key": [{
      optional: true,
      value: null,
      namespace: "/"
    }],
    "default_domain:key": [{
      optional: true,
      value: "default_domain",
      namespace: {
        id: null,
        key: [{namespace: "/user"}]
      }
    }],
    "base:key": [{
      optional: true,
      namespace: "/base",
      value: null
    }],
    "permits:key": [{
      optional: true,
      namespace: {
        id: null,
        "base:key": [{
          value: "base",
          namespace: "/",
          optional: "forbidden"
        }],
        permission: [{permits: [{member: {id: user_id}}]}]
      },
      value: null
    }],
    permission: [{optional:true, permits: [{member: {id: user_id}}]}]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      var info = env.result;
      info.has_permission = info.permission.length ? true : false;
      return info;
    });
};
