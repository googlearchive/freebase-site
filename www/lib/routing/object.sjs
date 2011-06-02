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
var freebase_object = acre.require("template/freebase_object.sjs");

var rules = [
  {
    "type": "/freebase/apps/application",
    "tabs": [
      {
        "name": "View",
        "key": "view",
        "app": "topic",
        "script": "topic.tab",
        "params": {
          "domains": "all",
          "type": "/freebase/apps/application"
        }
      },
      {
        "name": "Activity",
        "key": "activity",
        "app": "activity",
        "script": "app.tab"
      },
      {
        "name": "Authors",
        "key": "authors",
        "app": "group",
        "script": "group.tab"
      },
      {
        "name": "Inspect",
        "key": "inspect",
        "app": "triples",
        "script": "triples.tab"
      }
    ],
    "navs": [
      {
        "name": "Settings",
        "app": "admin",
        "ajax": "app_settings.mf.js",
        "auth": true
      },
      {
        "name": "View source",
        "url": h.fb_url("/appeditor/#app=${id}")
      }
    ]
  },
  {
    "type": "/type/domain",
    "tabs": [
      {
        "name": "Data",
        "key": "data",
        "app": "data",
        "script": "domain.tab"
      },
      {
        "name": "Schema",
        "key": "schema",
        "app": "schema",
        "script": "domain.tab"
      },
      {
        name: "Community",
        key: "community",
        app: "group",
        script: "group.tab"
      },
      {
        "name": "Inspect",
        "key": "inspect",
        "app": "triples",
        "script": "triples.tab"
      }
    ],
    "navs": [
      {
        "name": "Settings",
        "app": "admin",
        "ajax": "domain_settings.mf.js",
        "auth": true
      }
    ]
  },
  {
    "type": "/type/type",
    "tabs": [
      {
        "name": "Data",
        "key": "data",
        "app": "data",
        "script": "type.tab"
      },
      {
        "name": "Schema",
        "key": "schema",
        "app": "schema",
        "script": "type.tab"
      },
      {
        "name": "Inspect",
        "key": "inspect",
        "app": "triples",
        "script": "triples.tab"
      }
    ],
    "navs": [
      {
        "name": "Settings",
        "app": "admin",
        "ajax": "type_settings.mf.js",
        "auth": true
      },
      {
        "name": "Query",
        "url": h.fb_url("/queryeditor", {q:JSON.stringify([{id:null, name:null, type:"${id}"}])})
      },
      {
        name: "Create",
        key: "create",
        app: "create",
        script: "type.controller"
      }
    ]
  },
  {
    "type": "/type/property",
    "tabs": [
      {
        "name": "Schema",
        "key": "schema",
        "app": "schema",
        "script": "property.tab"
      },
      {
        "name": "Inspect",
        "key": "inspect",
        "app": "triples",
        "script": "triples.tab"
      }
    ]
  },
  {
    "type": "/type/user",
    "tabs": [
      {
        "name": "Domains",
        "key": "domains",
        "app": "data",
        "script": "user.tab"
      },
      {
        "name": "Queries",
        "key": "queries",
        "app": "query",
        "script": "user.tab"
      },
      {
        "name": "Apps",
        "key": "apps",
        "app": "apps",
        "script": "user.tab"
      },
      {
        "name": "Inspect",
        "key": "inspect",
        "app": "triples",
        "script": "triples.tab"
      }
    ],
    "navs": [
      {
        "name": "Settings",
        "app": "admin",
        "ajax": "user_settings.mf.js",
        "auth": true
      }
    ]
  },/**
  {
    "type": "/freebase/query",
    "tabs": [
      {
        "name": "Data",
        "key": "data",
        "app": "data",
        "script": "query.tab"
      },
      {
        "name": "Inspect",
        "key": "inspect",
        "app": "triples",
        "script": "triples.tab"
      }
    ]
  },**/
  {
    "type": "/common/topic",
    "promises": [
      {
        "name": "notable_types",
        "app": "lib",
        "script": "queries/object.sjs",
        "promise": "notable_types"
      }/**,
      {
        "name": "blurb",
        "app": "lib",
        "script": "queries/object.sjs",
        "promise": "blurb"
      },
      {
        "name": "blob",
        "app": "lib",
        "script": "queries/object.sjs",
        "promise": "blob"
      }**/
    ],
    "tabs": [
      {
        "name": "View",
        "key": "view",
        "app": "topic",
        "script": "topic.tab"
      },
      {
        "name": "Inspect",
        "key": "inspect",
        "app": "triples",
        "script": "triples.tab"
      },
      {
        "name": "On the Web",
        "key": "web",
        "app": "sameas",
        "script": "sameas.tab"
      }
    ]
  },
  {
    "type": "/type/object",
    "tabs": [
      {
        "name": "Inspect",
        "key": "inspect",
        "app": "triples",
        "script": "triples.tab"
      }
    ]
  }
];

var self = this;

function ObjectRouter(app_labels) {
  var route_list = [];
  var types = {};

  this.add = function(routes) {
    if (!(routes instanceof Array)) {
      routes = [routes];
    }
    routes.forEach(function(route) {
      if (!route || typeof route !== 'object') {
        throw 'A routing rule must be a dict: '+JSON.stringify(route);
      }
      route.tabs && route.tabs.forEach(function(tab) {
        var app = app_labels[tab.app];
        if (!app) {
          throw 'An app label must exist for: ' + tab.app;
        }
        tab.app = app;
      });
      route.navs && route.navs.forEach(function(nav) {
        if (nav.app) {
          var app = app_labels[nav.app];
          if (!app) {
            throw 'An app label must exist for: ' + nav.app;
          }
          nav.app = app;
        }
      });
      types[route.type] = route;
      h.splice_with_key(route_list, "type", route);
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
          id = o.replaced_by.id.indexOf("/en/") === 0 ? o.replaced_by.mid : o.replaced_by.id;
          return redirect(id);
        }
        // canonicalize /en topics to mids
        else if (path_info.indexOf("/en/") === 0) {
          return redirect(o.mid);
        }
        // otherwise render object template
        else {
          // we should now have the canonical id
          o.id = o["q:id"];

          // Build type map for object
          var obj_types = h.map_array(o.type, "id");
          obj_types["/type/object"] = true; // all valid IDs are /type/object

          var rule, i, l;
          // Find correct rule for this object
          for (i=0,l=route_list.length; i<l; i++) {
            var route = route_list[i];
            var type = route.type;
            if (obj_types[type]) {
              // clone tabs spec so we don't overwrite it
              rule = h.extend(true, {}, route);
              break;
            }
          }

          // Turn tab config arrays into something more useful
          if (!rule) {
            throw "Missing rule configuration for this object";
          }

          acre.write(freebase_object.main(rule, o));
          acre.exit();
        }
      }
    }
  };

  var dump = this.dump = function() {
    return route_list.slice();
  };

  // add default rules
  this.add(rules);
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
