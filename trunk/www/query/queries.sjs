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

var h = acre.require("lib/helper/helpers.sjs");
var i18n = acre.require("lib/i18n/i18n.sjs");
var apis = acre.require("lib/promise/apis.sjs"),
    deferred = apis.deferred,
    freebase = apis.freebase;

var schema = acre.require("lib/schema/typeloader.sjs");
var fq = acre.require("lib/queries/freebase_query.sjs");
var pq = acre.require("lib/propbox/queries_collection.sjs");


function qualify_prop(key, type) {
  var system_props = {
    id: "/type/object",
    guid: "/type/object",
    type: "/type/object",
    name: "/type/object",
    key: "/type/object",
    timestamp: "/type/object",
    permission: "/type/object",
    creator: "/type/object",
    attribution: "/type/object",
    search: "/type/object",
    mid: "/type/object",
    value: "/type/value"
  };

  var mql_directives = {
    "index": true,
    "limit": true,
    "sort": true,
    "optional": true,
    'count': true,
    'index': true,
    "!index": true,
    "return": true,
    'count': true,
    "link": true
  };

  var prop = {
    label: null,
    id: key,
    key: key
  }

  var segs = key.split(":");
  if (segs.length > 2) {
    throw "property key can't have more than one label";
  } else if (segs.length === 2) {
    prop.label = segs[0];
    prop.id = segs[1];
  }

  if (!(prop.id in mql_directives || (prop.id.indexOf("/") === 0))) {
    var stype = system_props[prop.id];
    if (stype) {
      prop.id = stype + "/" + key;
    } else {
      prop.id = type ? type + "/" + prop.id : prop.id;
    }
  }
  prop.key = prop.label ? prop.label + ":" + prop.id : prop.id;
  return prop;
};

function get_clause_type(q) {
  var type;
  for (var key in q) {
    if (qualify_prop(key).id === "/type/object/type") {
      type = q[key];
      break;
    }
  }
  return type || "/type/object";
};

function qualify_clause(q, type) {
  for (var key in q) {
    var qprop = qualify_prop(key, type);
    if (qprop.id !== key || qprop.id === "sort") {
      var value = q[key];
      if (qprop.id === "sort") {
        var first_key = value.split(".")[0].replace("-","");
        value = value.replace(first_key, qualify_prop(first_key, type).key);
      }
      q[qprop.key] = value;
      delete q[key];
    }
  }
  return q;
};

function clean_clause(q) {
  var exclude_props = {
    "/type/object/id" : true,
    "/type/object/mid": true,
    "/type/object/name": true,
    "/common/topic/article": true,
    "/common/topic/image": true,
    "/type/value/value": true,
    "/type/text/lang": true,
    
    /* TODO:  SITE-818 */
    "index": true,
    "!index": true,
    "return": true,
    "count": true,
    "link": true
  };
  for (var key in q) {
    if ((key in exclude_props) ||
        (key.indexOf(":") > -1)) {
      delete q[key];
    }
  }
  return q;
};

function get_paths(q, depth, top_type) {
  function decant(val, path, type) {
    if (h.isPlainObject(val)) {
      if (path) paths.push(path);
      clean_clause(qualify_clause(val, type));
      for (var key in val) {
        var new_path = path.length ? path + "." + key : key;
        decant(val[key], new_path);
      }
    } else if (h.isArray(val)) {
      if (val.length == 0) {
        paths.push(path);
      } else {
        decant(val[0], path);
      }
    } else {
      if (val === null) {
        paths.push(path);
      }
    }
  };
  var paths = [];
  decant(q, "", top_type);
  if (depth) {
    paths = paths.map(function(p) {
      return p.split(".").slice(0, depth).join(".");
    });    
  }
  return paths;
};

function collection(query, opts) {
  var MID_PROP = "collection:mid";

  var q = h.isArray(query) ? query[0] : query;
  q = h.extend(true, {}, q);
  q[MID_PROP] = null;

  return freebase.mqlread([q], opts)
    .then(function(env) {
      var cursor = env.cursor;
      
      var mids = [];
      env.result.forEach(function(r) {
        mids.push(r[MID_PROP]);
      });

      var typeid = get_clause_type(q);
      return schema.load(typeid)
        .then(function(r) {
          var is_mediator = r[typeid]["/freebase/type_hints/mediator"];
          var default_paths = is_mediator ? ["/type/object/id"] : ["/type/object/name", "/common/topic/image"];
          var props = default_paths.concat(get_paths(q, 2, typeid));
          return deferred.all({
            query: query,
            cursor: cursor,
            collection: pq.collection(mids, props, i18n.lang)
          });
        });
    });
};

function create_query(user_id, query, name, key, domain, description, lang) {
  var clause = h.isArray(query) ? query[0] : query;
  var type = get_clause_type(clause);

  return freebase.mqlwrite({
      "create": "unless_exists",
      "id": null,
      "type": {
        "id": "/type/namespace", 
        "connect": "insert"
      },
      "key": {
        "value": "views", 
        "namespace": domain
      }
    }, { "use_permission_of": domain })
    .then(function(env) {
      return env.result;
    })
    .then(function(ns) {
      return freebase.mqlwrite({
          "create": "unless_exists",
          "name": {
            "value": name,
            "lang": lang
          },
          "id": null,
          "mid": null,
          "type": [{
            "id": "/freebase/query"
          },{
            "id": "/common/document"
          }],
          "/freebase/query_hints/related_type": {
            "id" : type
          },
          "key": {
            "value": key,
            "namespace": ns.id
          }
        }, { "use_permission_of": user_id })
        .then(function(env) {
          return env.result;
        })
        .then(function(doc) {
          var promises = [];
          
          promises.push(freebase.upload(JSON.stringify(query, null, 2), "text/plain", {
            "document": doc.mid
          }));
          
          if (description) {
            var qa =  acre.require("lib/queries/create_article.sjs");
            promises.push(qa.create_article(description, 'text/plain', {
              "topic": doc.mid,
              "use_permission_of": user_id,
              "lang": lang
            }));
          }
          
          return deferred.all(promises, true)
            .then(function() {
              return doc;
            });
        });
    });
};
