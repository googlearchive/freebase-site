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
  router: IdRouter
};

var h = acre.require("routing/helpers.sjs");
var validators = acre.require("validator/validators.sjs");

function IdRouter() {

  this.add = function(routes) {};

  this.route = function(req) {

    var path_info = req.path_info;

    var id = validators.MqlId(path_info, {if_invalid:null});

    if (id) {
      var q = {
        id: null,
        "given:id": id,
        type: [{
          id: null,
          "id|=": [
            "/type/domain", "/type/type", "/type/property",  // schema
            "/type/user",                                    // user
            "/freebase/freebase_query",                      // saved query
            "/freebase/apps/application",                    // app
            "/common/topic"                                  // topic
          ],
          optional: true
        }],
        "/dataworld/gardening_hint/replaced_by": {
          id: null,
          optional: true
        }
      };
      var result = acre.freebase.mqlread(q).result;
      if (result) {
        if (result["/dataworld/gardening_hint/replaced_by"]) {
          redirect(result["/dataworld/gardening_hint/replaced_by"].id);
        }
        else if (result.type.length) {
          var types = {};
          result.type.forEach(function(type) {
            types[type.id] = type;
          });
          if (types["/freebase/apps/application"]) {
            return redirect("/apps" + result.id);
          } 
          else if (types["/type/domain"] ||
              types["/type/type"] ||
              types["/type/property"]) {
            return redirect("/schema" + result.id);
          }
          else if (types["/type/user"]) {
            return redirect("/inspect" + result.id);
          }
          else if (types["/freebase/freebase_query"]) {
            return redirect("/query" + result.id);
          }
          else if (types["/common/topic"]) {
            return redirect("/topic" + result.id);
          }
        }
        // it's a valid id, default to inspect
        redirect("/inspect" + result.id);
      }
    }
  };
};

function redirect(path) {
  acre.response.status = 301;
  var qs = acre.request.query_string;
  if (qs) {
    path += ("?" + qs);
  }
  acre.response.set_header("location", path);
  acre.exit();
};
