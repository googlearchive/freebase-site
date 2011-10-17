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
var t = mf.require("template");
var queries = mf.require("queries");
var h = mf.require("core", "helpers");

var api = {

  projects: function(args, headers) {
    return queries.domain_membership(args.id)
      .then(function(domains) {
        return h.extend({}, args, {
          data: domains,
          html: acre.markup.stringify(t.projects_toolbox(domains))
        });
      });
  },

  apps: function(args, headers) {
    var list_user_apps = mf.require("appeditor-services", "list_user_apps").list_user_apps;
    var apps = list_user_apps(args.id, args.include_filenames);
    return h.extend({}, args, {
      data: apps,
      html: acre.markup.stringify(t.apps_toolbox(apps))
    });
  },

  queries: function(args, headers) {
    return queries.user_queries(args.id)
      .then(function (result) {
        return h.extend({}, args, {
          data: result,
          html: acre.markup.stringify(t.queries_toolbox(result))
        });
      });
  },

  schema: function(args, header) {
    return queries.type_membership(args.id)
      .then(function(types) {
        return h.extend({}, args, {
          data: types,
          html: acre.markup.stringify(t.schema_toolbox(types))
        });
      });
  }

};

api.projects.args = ["id", "context"];
api.apps.args = ["id", "context"];
api.queries.args = ["id", "context"];
api.schema.args = ["id", "context"];

function main(scope) {
  if (h.is_client()) {
    acre.response.set_cache_policy('fast');
  }
  var service = mf.require("core", "service");
  service.main(scope, api);
};

if (acre.current_script == acre.request.script) {
  main(this);
}
