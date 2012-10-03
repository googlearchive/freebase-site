/*
 * Copyright 2012, Google Inc.
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
var deferred = acre.require("lib/promise/deferred");
var freebase = acre.require("lib/promise/apis").freebase;
var validators = acre.require("lib/validator/validators");
var typeloader = acre.require("lib/schema/typeloader.sjs");

/**
 * Create a new property using the permission of the specified type.
 *
 * @param o:Object (required) - options specifying the new property.
 */
function create_property(options) {
  var o;
  try {
    o = {
      type: validators.MqlId(options, "type", {required:true}),
      name: validators.String(options, "name", {required:true}),
      key: validators.PropertyKey(options, "key", {required:true}),
      expected_type: validators.MqlId(options, "expected_type", {required:true}),
      unit: validators.MqlId(options, "unit", {if_empty:""}),
      description: validators.String(options, "description", {if_empty:""}),
      disambiguator: validators.StringBool(options, "disambiguator", {if_empty:false}),
      unique: validators.StringBool(options, "unique", {if_empty:false}),
      hidden: validators.StringBool(options, "hidden", {if_empty:false}),
      master_property: validators.MqlId(options, "master_property", {if_empty:""}),

      lang: validators.LangId(options, "lang", {if_empty:"/lang/en"})
    };
    // if expected_type is /type/enumeration, enumeration namespace IS required
    if (o.expected_type === "/type/enumeration") {
      o.enumeration = validators.MqlId(options, "enumeration", {required:true});
    }
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var promise;
  if (o.expected_type === "/type/enumeration" && o.enumeration) {
    /*
     * If /type/enumeration, uniqueness needs to match with the enumerated namespace
     */
    var q = {
      id: o.enumeration,
      type: "/type/namespace",
      unique: null
    };
    promise = freebase.mqlread(q)
      .then(function(env) {
        return env.result;
      })
      .then(function(ns) {
        if (ns) {
          o.unique = (ns.unique === true);
          o.unit = null;
          o.master_property = null,
          o.delegate = null;
        }
        else {
          return deferred.rejected(o.enumeration + " is not a namespace for /type/enumeration");
        }
      });
  }
  else {
    promise = deferred.resolved();
  }
  return promise
    .then(function() {
      var q = {
        id: null,
        key: {
          value: o.key,
          namespace: o.type
        }
      };
      return freebase.mqlread(q)
        .then(function(env) {
          if (env.result) {
            return deferred.rejected("key already exists: " + o.key);
          }
          return true;
        });
    })
    .then(function() {
      var q = {
        id: null,
        guid: null,
        mid: null,
        type: {
          id: "/type/property"
        },
        "/type/property/schema": {
          id: o.type
        },
        key: {
          namespace: o.type,
          value: o.key
        },
        name: {
          value: o.name,
          lang: o.lang
        },
        "/type/property/expected_type": {
          id: o.expected_type
        },
        "/type/property/unique": {
          value: o.unique
        },
        "/freebase/property_hints/disambiguator": {
          value: o.disambiguator
        },
        "/freebase/property_hints/display_none": {
          value: o.hidden
        },
        create: "unconditional"
      };

      if (o.unit) {
        q["/type/property/unit"] = {
          id: o.unit
        };
      }
      if (o.description) {
        q["/common/topic/description"] = {
            value: o.description,
            lang: o.lang
        };
      }
      if (o.master_property) {
        q["/type/property/master_property"] = {
          id: o.master_property
        };
      }
      if (o.expected_type === "/type/enumeration" && o.enumeration) {
        q["/type/property/enumeration"] = {
          id: o.enumeration
        };
      }

      return freebase.mqlwrite(q, {use_permission_of: o.type})
        .then(function(env) {
          // invalidate type schema
          typeloader.invalidate(o.type);
          if (o.master_property) {
            // TODO: we need to invalidate master_property.schema (type)...
          }
          return env.result;
        })
        .then(function(created) {
          created.schema = created["/type/property/schema"];
          created.expected_type = created["/type/property/expected_type"];
          created.unique = created["/type/property/unique"];
          created.unit = created["/type/property/unit"];
          created.enumeration = created["/type/property/enumeration"];
          return created;
        });
    });

};
