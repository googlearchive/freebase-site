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


function user_queries(user) {
  var promises = {};

  promises.queries = fq.featured_views_by_user(user);

  return deferred.all(promises)
    .then(function(results) {
      return results.queries;
  });
};


function qualify_query(q) {
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
      key = segs[1]
    }
    
    if (key in mql_directives || (key.indexOf("/") ==- 0)) {
      return (label ? label + ":" : "") + key;
    }

    if (obj_props[key]) {
      return (label ? label + ":" : "") + "/type/object/" + key;
    } else {
      return (label ? label + ":" : "") + (type || "/type/object") + "/" + key;
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


function query(q, props) {
  var MID_PROP = "collection:mid";
  
  q = h.isArray(q) ? q : [q];
  q[0][MID_PROP] = null;
  
  return freebase.mqlread(q)
    .then(function(env) {
      var mids = [];
      env.result.forEach(function(r) {
        mids.push(r[MID_PROP]);
      });
      
      qualify_query(q[0]);

      if (!h.isArray(props) || !props.length) {
        props = [];
        var constraints = decant_constraints(u.extend(true, {}, q[0]));
        for (var prop in q[0]) {
          var path = [prop];
          if (!is_constraint(constraints, path, q[0][prop])) {
            if (prop) props.push(prop);
          }
        }
      }
      
      return pq.collection(mids, props, i18n.lang);
    });
};


function decant_constraints(q) {
  function decant(val) {
    if (h.isPlainObject(val)) {
      var has_keys = false;
      for (var key in val) {
        var tmp = decant(val[key])
        if (tmp === undefined) {
          delete val[key];
        } else {
          has_keys = true;
          val[key] = tmp;
        }
      }
      return has_keys ? val : undefined;
    } else if (h.isArray(val)) {
      return val.length ? decant(val[0]) : undefined;
    } else {
      return (val === null) ? undefined : val;
    }
  };
  return decant(q);
};

function is_constraint(constraints, path, value) {
  function same_keys(o1, o2) {
    for (var key in o1) {
      var val1 = o1[key];
      var val2 = o2[key];
      val1 = h.isArray(val1) ? val1[0] : val1;
      val2 = h.isArray(val2) ? val2[0] : val2;
      if (val2 === undefined) return false;
      if (h.isPlainObject(val1) && h.isPlainObject(val2)) {
        if (!same_keys(val1, val2)) return false;
      }
    }
    return true;
  }
  
  // hack for saved queries
  if (path[0].indexOf(":") > -1) {
    return true;
  }
  
  var val = h.extend(true, {}, constraints);
  value = h.isArray(value) ? value[0] : value;
  for (var s = 0; s < path.length; s++) {
    val = val[path[s]];
    if (val === undefined) return false;
  }
  return h.isPlainObject(val) ? same_keys(value, val) : true;
}