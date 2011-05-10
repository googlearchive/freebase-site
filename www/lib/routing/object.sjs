/*
 * Copyright 2011, Google Inc.
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
  router: ObjectRouter
};

var h = acre.require("helper/helpers.sjs");
var validators = acre.require("validator/validators.sjs");
var object_query = acre.require("queries/object.sjs");

var self = this;

function ObjectRouter() {
  var types_list = [];
  var types = {};

  this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }
    
    routes.forEach(function(route) {
      if (!route || typeof route !== 'object') {
        throw 'A routing rule must be a dict: '+JSON.stringify(route);
      }
      types[route.type] = route;
      types_list.push(route.type);
    });
  };

  this.route = function(req) {

    var path_info = req.path_info;

    var id = validators.MqlId(path_info, {if_invalid:null});

    if (id) {
      
      var o;      
      var d = object_query.object(id)
        .then(function(obj) {
          o = obj;
        });
      
      acre.async.wait_on_results();
      
      d.cleanup();
      
      if (o) {
        // merged topic
        if (o.replaced_by) {
          var id = o.replaced_by.id.indexOf("/en") === 0 ? o.replaced_by.mid : o.replaced_by.id;
          redirect(id);
        } 
        // canonicalize /en topics to mids
        else if (path_info.indexOf("/en") === 0) {
          redirect(o.mid);
        } 
        // otherwise render object template
        else {
          
          // Build type map for object
          var obj_types = {};
          o.type.forEach(function(type) {
            obj_types[type.id] = type;
          });
          
          // Find correct set of tabs for this object
          for (var t=0; t < types_list.length; t++) {
            if (types_list[t] in obj_types) {
              o.tabs = types[types_list[t]].tabs;
              break;
            }
          }
          
          // Turn tab config arrays into something more useful
          o.tabs = o.tabs.map(function(tab) {
            return {
              name: tab[0],
              key: tab[0].replace(/\s/g, "_").toLowerCase(),
              path: tab[1] + path_info,
              params: h.isPlainObject(tab[2]) ? tab[2] : {}
            };
          });

          // Pick a tab
          o.sel_tab = o.tabs[0];
          for (var t=0; t < o.tabs.length; t++) {
            var tab = o.tabs[t];
            if (tab.key in acre.request.params) {
              o.sel_tab = tab;
              break;
            }
          }
          
          // Render it
          h.extend(acre.request.params, o.params);
          self.obj = o;
          var body = acre.include.call(self, o.sel_tab.path);
          acre.write(body);
          acre.exit();
        }
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
