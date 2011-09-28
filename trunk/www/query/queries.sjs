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

var fq = acre.require("lib/queries/freebase_query.sjs");
var pq = acre.require("lib/propbox/queries_collection.sjs");


function qualify_query(q) {
  var type;
  var temp = h.isArray(q) ? q[0] : q;

  function qualify(key, type) {
    var obj_props = {
      id: true,
      guid: true,
      type: true,
      name: true,
      key: true,
      timestamp: true,
      permission: true,
      creator: true,
      attribution: true,
      search: true,
      mid: true
    };

    var mql_directives = {
      index: true,
      limit: true,
      sort: true,
      optional: true,
      count: true
    };

    var segs = key.split(":");
    if (segs.length > 2) {
      throw "property key can't have more than one label";
    } else if (segs.length === 2) {
      var label = segs[0];
      key = segs[1];
    }

    if (key in mql_directives || (key.indexOf("/") === 0)) {
      return (label ? label + ":" : "") + key;
    }

    if (obj_props[key]) {
      return (label ? label + ":" : "") + "/type/object/" + key;
    } else {
      return (label ? label + ":" : "") + (type ? type + "/" : "") + key;
    }
  };

  for (var prop in temp) {
    if (qualify(prop) === "/type/object/type") {
      type = temp[prop];
      break;
    }
  }

  for (var prop in temp) {
    var qprop = qualify(prop, type);
    var key = qprop.split(":").pop();
    if (qprop !== prop || key === "sort") {
      var value = temp[prop];
      if (key === "sort") {
        var first_key = value.split(".")[0].replace("-","");
        value = value.replace(first_key, qualify(first_key, type));
      }
      temp[qprop] = value;
      delete temp[prop];
    }
  }

  return q;
};

function clean_query(q) {
  var exclude_props = {
    "/type/object/id" : true,
    "/type/object/mid": true,
    "/type/object/name": true,
    "/common/topic/article": true,
    "/common/topic/image": true,
    
    /* TODO:  SITE-818 */
    "index": true,
    "return": true,
    "count": true,
    "link": true
  };
  for (var key in (h.isArray(q) ? q[0] : q)) {
    if ((key in exclude_props) ||
        (key.indexOf(":") > -1)) {
      delete q[key];
    }
  }
  return q;
};

function get_paths(q, depth) {
  function decant(val, path) {
    if (h.isPlainObject(val)) {
      if (path) paths.push(path);
      clean_query(qualify_query(val));
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
  decant(q, "");
  if (depth) {
    paths = paths.map(function(p) {
      return p.split(".").slice(0, depth).join(".");
    });    
  }
  return paths;
};

function collection(q, props) {
  var MID_PROP = "collection:mid";

  q = h.isArray(q) ? q : [q];
  q[0][MID_PROP] = null;

  return freebase.mqlread(q)
    .then(function(env) {

      var mids = [];
      env.result.forEach(function(r) {
        mids.push(r[MID_PROP]);
      });

      qualify_query(q);
      var props = [
        "/type/object/name", 
        "/common/topic/image"
      ].concat(get_paths(clean_query(q), 2));
      return pq.collection(mids, props, i18n.lang);
    });
};
