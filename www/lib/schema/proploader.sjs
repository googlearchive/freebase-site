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
var h = acre.require("helper/helpers.sjs");
var apis = acre.require("promise/apis").freebase;
var freebase = apis.freebase;
var deferred = apis.deferred;
var typeloader = acre.require("schema/typeloader.sjs");
var assert = typeloader.assert;
var validators = acre.require("validator/validators.sjs");

/**
 * Property (schema) loader.
 * Uses typeloader (with deep=true) to load the type(s) the specified property(s) belong to.
 *
 * By default, proploader will only return the disambiguating properties of the expected_type.
 * You can get all properties of the expected_type by passing TRUE as the first argument.
 *
 * Usage:
 *
 * load(prop1, prop2, ..., propN)
 *   .then(function(schemas) {
 *     var prop1_schema = schemas[prop1];
 *     ..
 *   });
 *
 * load(true, prop1, prop2, ..., propN)
 *   .then(function(schemas) {
 *     var prop1_schema = schemas[prop1];
 *     ..
 *   });
 **/
function load() {
  var prop_ids = Array.prototype.slice.call(arguments);
  assert(prop_ids.length, "You need to specify at least one property id");
  var all = false;
  if (typeof prop_ids[0] === "boolean") {
    all = prop_ids.shift();
  }
  assert(prop_ids.length, "You need to specify at least one property id");
  var result = {};
  var type_ids = [];
  var seen = {};
  prop_ids.forEach(function(prop_id) {
    result[prop_id] = null;
    var type_id = get_type_id(prop_id);
    if (!seen[type_id]) {
      type_ids.push(type_id);
      seen[type_id] = 1;
    }
  });
  return typeloader.load.apply(null, [true].concat(type_ids))
    .then(function(types) {
      for (var type_id in types) {
        var type = types[type_id];
        type.properties.forEach(function(prop) {
          if (prop.id in result) {
            result[prop.id] = prop;
            if (!all) {
              // get only disambiguating deep properties
              prop.expected_type.properties = prop.expected_type.properties.filter(function(p) {
                return p["/freebase/property_hints/disambiguator"] === true;
              });
            }
          }
        });
      }
      // make sure we have all properties
      prop_ids.forEach(function(prop_id) {
        assert(result[prop_id] != null, "Property did not load", prop_id);
      });
      return result;
    });
};

/**
 * Get the prefix ns of a fully qualified prop_id, which is the type id.
 *
 * get_type_id("/a/b/c") ==> "/a/b"
 */
function get_type_id(prop_id) {
  assert(is_prop_id(prop_id), "Expected a fully qualified property id");
  var parts = prop_id.split("/");
  parts.pop();
  var type_id = parts.join("/");
  return type_id;
};

/**
 * Is prop_id a fully qualified property path/id?
 */
function is_prop_id(prop_id) {
  var r = validators.MqlId(prop_id, {if_empty:null, if_invalid:null});
  if (r) {
    // property paths should be at least 3 levels
    // /domain/type/path
    var parts = prop_id.split("/");
    return parts.length > 3;
  }
  else {
    return false;
  }
};

/**
 * Usage:
 *
 * load_paths("/film/film/directed_by./people/person/date_of_birth")
 */
function load_paths() {
  var i,l;
  var paths =  Array.prototype.slice.call(arguments);
  var path_map = {};
  var prop_ids = [];
  var seen = {};
  paths.forEach(function(path) {
    var parts = path.split(".", 2);
    if (parts.length) {
      var first = parts[0];
      assert(is_prop_id(first), "First property path must be fully qualified");
      if (!seen[first]) {
        prop_ids.push(first);
        seen[first] = 1;
      }
      var p = path_map[path] = [first];
      var second = null;
      if (parts.length === 2) {
        second = parts[1];
        if (is_prop_id(second)) {
          if (!seen[second]) {
            prop_ids.push(second);
            seen[second] = 1;
          }
        }
        // else is relative (which we should get for free from first expected_type properties)
        p.push(second);
      }
    }
  });
  return load.apply(null, [true].concat(prop_ids))
    .then(function(props) {
      var result = {};
      paths.forEach(function(path) {
        var parts = path_map[path];
        var first = parts[0];
        var prop1 = props[first];
        assert(prop1, "First property did not load", first);
        prop1 = h.extend(true, {}, prop1);
        var existing = result[first];
        if (!existing) {
          existing = result[first] = prop1;
          existing._subprops = [];
        }
        if (parts.length === 2) {
          var second = parts[1];
          var prop2;
          if (is_prop_id(second)) {
            prop2 = props[second];
          }
          else {
            var full_second = prop1.expected_type.id + "/" + second;
            // TODO: compare property key(s) instead
            prop1.expected_type.properties.every(function(p) {
              if (full_second === p.id) {
                prop2 = p;
                return false;
              }
              return true;
            });
          }
          assert(prop2, "Second property did not load", second);
          prop2 = h.extend(true, {}, prop2);
          existing._subprops.push(prop2);
          delete prop2.expected_type.properties;
        }
      });
      for (var key in result) {
        var prop = result[key];
        var subprops = prop._subprops;
        if (subprops && subprops.length) {
          prop.expected_type.properties = subprops;
        }
        else {
          prop.expected_type.properties =  prop.expected_type.properties.filter(function(p) {
            return p["/freebase/property_hints/disambiguator"] === true;
          });
        }
        // delete temp attr
        delete prop._subprops;
      }
      return result;
    });
};
