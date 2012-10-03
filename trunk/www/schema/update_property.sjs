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

var apis = acre.require("lib/promise/apis.sjs");
var deferred = apis.deferred;
var freebase = apis.freebase;
var validators = acre.require("lib/validator/validators.sjs");
var typeloader = acre.require("lib/schema/typeloader.sjs");

/**
 * Update an existing property values (name, key, expected_type, etc.)
 *
 * @param o:Object (required) - options specifying the updated values.
 */
function update_property(options) {
  var o;
  try {
    o = {
      // required
      type: validators.MqlId(options, "type", {required:true}),
      id: validators.MqlId(options, "id", {required:true}),

      // optional
      name: validators.String(options, "name", {if_empty:null}),
      key: validators.PropertyKey(options, "key", {if_empty:null}),
      expected_type: validators.MqlId(options, "expected_type", {if_empty:null}),
      unit: validators.MqlId(options, "unit", {if_empty:null}),
      description: validators.String(options, "description", {if_empty:null}),
      disambiguator: validators.StringBool(options, "disambiguator", {if_empty:null}),
      unique: validators.StringBool(options, "unique", {if_empty:null}),
      hidden: validators.StringBool(options, "hidden", {if_empty:null}),
      deprecated: validators.StringBool(options, "deprecated", {if_empty:null}),

      // default lang for text is /lang/en
      lang: validators.LangId(options, "lang", {if_empty:"/lang/en"}),

      // an array of options to remove/delete (name, key, ect, unit, description, disambiguator, unique, hidden);
      remove: validators.Array(options, "remove", {if_empty:[]})
    };
    // if expected_type is /type/enumeration, enumeration namespace IS required
    if (o.expected_type === "/type/enumeration") {
      o.enumeration = validators.MqlId(options, "enumeration", {required:true});
    }
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var remove = {};
  o.remove.forEach(function(k) {
    remove[k] = true;
    o[k] = null;
  });

  var q;
  var promise;
  if (o.expected_type === "/type/enumeration" && o.enumeration) {
    /*
     * If /type/enumeration, uniqueness needs to match with the enumerated namespace
     */
    q = {
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
      q = {
        id: o.id,
        guid: null,
        type: "/type/property",
        key: {namespace:o.type, value:null, optional:true},
        name: {value:null, lang:o.lang, optional:true},
        "/common/topic/description": {
          value: null,
          lang: o.lang,
          optional: true,
          limit: 1
        },
        expected_type: null,
        unit: null,
        unique: null,
        enumeration: null,
        "/freebase/documented_object/tip": {value:null, lang:o.lang, optional:true},
        "/freebase/property_hints/disambiguator": null,
        "/freebase/property_hints/display_none": null
      };
      return freebase.mqlread(q)
        .then(function(env) {
          return env.result || {};
        });
    })
    .then(function(old) {
      if (remove.key && old.key) {
        return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.type, value:old.key.value, connect:"delete"}})
          .then(function(env) {
            // old id may no longer be valid since we deleted the key
            old.id = env.result.id;
            return old;
          });
      }
      else if (! (o.key == null || old.key.value == o.key)) {
        // delete old key
        return freebase.mqlwrite({guid:old.guid, key:{namespace:o.type, value:old.key.value, connect:"delete"}})
          .then(function(env) {
            // insert new key
            return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.type, value:o.key, connect:"insert"}})
              .then(function(env) {
                // id may have changed
                old.id = env.result.id;
                return old;
              });
          });
      }
      return old;
    })
    .then(function(old) {
      var update = {
        guid: old.guid,
        type: "/type/property"
      };
      if (remove.name && old.name) {
        update.name = {value:old.name.value, lang:old.name.lang, connect:"delete"};
      }
      else if (o.name != null) {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }

      if (remove.expected_type && old.expected_type) {
        update.expected_type = {id:old.expected_type, connect:"delete"};
      }
      else if (o.expected_type != null) {
        update.expected_type = {id:o.expected_type, connect:"update"};
      }

      if (remove.unit && old.unit) {
        update.unit = {id:old.unit, connect:"delete"};
      }
      else if (o.unit != null) {
        update.unit = {id:o.unit, connect:"update"};
      }

      if (remove.unique && old.unique != null) {
        update.unique = {value:old.unique, connect:"delete"};
      }
      else if (o.unique != null) {
        update.unique = {value:o.unique, connect:"update"};
      }
            
      var desc = [];
      if (remove.description && old["/common/topic/description"]) {
        desc.push({
          value: old["/common/topic/description"].value,
          lang: old["/common/topic/description"].lang,
          connect: "delete"
        });
      }
      else if (o.description != null) {
        if (old["/common/topic/description"]) {
          // /common/topic/description is not unique
          // we need to delete the old one first.
          desc.push({
            value: old["/common/topic/description"].value,
            lang: old["/common/topic/description"].lang,
            connect: "delete"
          });
        }
        desc.push({
          value: o.description,
          lang: o.lang,
          connect: "insert"
        });
      }
      if (desc.length) {
        update["/common/topic/description"] = desc;
      }

      if (remove.disambiguator && old["/freebase/property_hints/disambiguator"] != null) {
        update["/freebase/property_hints/disambiguator"] = {value:old["/freebase/property_hints/disambiguator"], connect:"delete"};
      }
      else if (o.disambiguator != null) {
        update["/freebase/property_hints/disambiguator"] = {value:o.disambiguator, connect:"update"};
      }

      if (remove.hidden &&  old["/freebase/property_hints/display_none"] != null) {
        update["/freebase/property_hints/display_none"] = {value:old["/freebase/property_hints/display_none"], connect:"delete"};
      }
      else if (o.hidden != null) {
        update["/freebase/property_hints/display_none"] = {value:o.hidden, connect:"update"};
      }

      if (remove.deprecated &&  old["/freebase/property_hints/deprecated"] != null) {
        update["/freebase/property_hints/deprecated"] = {value:old["/freebase/property_hints/deprecated"], connect:"delete"};
      }
      else if (o.deprecated != null) {
        update["/freebase/property_hints/deprecated"] = {value:o.deprecated, connect:"update"};
      }

      if (o.expected_type === "/type/enumeration" && o.enumeration) {
        update.enumeration = {id:o.enumeration, connect:"update"};
      }
      else if (old.enumeration) {
        update.enumeration = {id:old.enumeration, connect:"delete"};
      }

      var d = old.id;
      var keys = ["name", "expected_type", "unit", "unique",
                  "/common/topic/description", 
                  "/freebase/property_hints/disambiguator",
                  "/freebase/property_hints/display_none",
                  "/freebase/property_hints/deprecated"];
      for (var i=0,l=keys.length; i<l; i++) {
        if (keys[i] in update) {
          d = freebase.mqlwrite(update)
            .then(function(env) {
              // invalidate type
              typeloader.invalidate(o.type);
              return old.id;
            });
          break;
        }
      }
      // invalidate type
      typeloader.invalidate(o.type);
      return d;
    });
};
