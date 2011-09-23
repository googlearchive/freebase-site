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
    var parts = prop_id.split("/");
    parts.pop();
    var type_id = parts.join("/");
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


