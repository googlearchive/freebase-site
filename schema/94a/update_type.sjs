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

var h = acre.require("lib/helper/helpers.sjs");
var apis = acre.require("lib/promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;
var validators = acre.require("lib/validator/validators.sjs");
var i18n = acre.require("lib/i18n/i18n.sjs");
var typeloader = acre.require("lib/schema/typeloader.sjs");


/**
 * Update an existing type values (name, key, description, enumeration, etc.)
 *
 * @param o:Object (required) - options specifying the updated values.
 */
function update_type(options) {
  var o;
  try {
    o = {
      // required
      domain: validators.MqlId(options, "domain", {required:true}),
      id: validators.MqlId(options, "id", {required:true}),

      // optional
      name: validators.String(options, "name", {if_empty:null}),
      key: validators.TypeKey(options, "key", {if_empty:null}),
      description: validators.String(options, "description", {if_empty:null}),

      enumeration: validators.StringBool(options, "enumeration", {if_empty:null}),
      mediator: validators.StringBool(options, "mediator", {if_empty:null}),
      deprecated: validators.StringBool(options, "deprecated", {if_empty:null}),
      never_assert: validators.StringBool(options, "never_assert", {if_empty:null}),

      // default to /lang/en
      lang: validators.LangId(options, "lang", {if_empty:"/lang/en"}),

      // an array of options to remove/delete (name, key, description, enumeration);
      remove: validators.Array(options, "remove", {if_empty:[]})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var remove = {};
  o.remove.forEach(function(k) {
    remove[k] = true;
    o[k] = null;
  });

  if (o.enumeration && o.mediator) {
    return deferred.rejected("Type can't be both Enumerated and Mediator.");
  }


  return freebase.mqlread({              
      id: o.id,
      guid: null,
      mid: null,
      key: {namespace:o.domain, value:null, optional:true},
      name: {value:null, lang:o.lang, optional:true},
      "/common/topic/description": [{
        value: null,
        lang: o.lang,
        optional: true
      }],
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/enumeration": null,
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/enumeration": null
  })
  .then(function(env) {
      return env.result;
  })
  .then(function(old) {
      if (remove.key && old.key) {
        return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.domain, value:old.key.value, connect:"delete"}})
          .then(function(env) {
            // old id may no longer be valid since we deleted the key
            if (old.id != env.result.id) {
                typeloader.invalidate(old.id);
                old.id = env.result.id;
            }
            return old;
          });
      }
      else if (! (o.key == null || old.key.value == o.key)) {
        // delete old key
        return freebase.mqlwrite({guid:old.guid, key:{namespace:o.domain, value:old.key.value, connect:"delete"}})
          .then(function(env) {
            // insert new key
            return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.domain, value:o.key, connect:"insert"}})
              .then(function(env) {
                // id may have changed
                if (old.id != env.result.id) {
                    typeloader.invalidate(old.id);
                    old.id = env.result.id;
                }
                return old;
              });
          });
      }
      return old;
    })
    .then(function(old) {
      var update = {
        guid: old.guid
      };
      if (remove.name && old.name) {
        update.name = {value:old.name.value, lang:old.name.lang, connect:"delete"};
      }
      else if (o.name != null) {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }

      var desc = [];
      if (remove.description) {
        // We need to cleanup since /common/topic/description is not unique
        old["/common/topic/description"].forEach(function(d) {
          desc.push({
            value: d.value,
            lang: d.lang,
            connect: "delete"
          });
        });
      }
      else if (o.description != null) {
        var existing = false;
        old["/common/topic/description"].forEach(function(d) {
          if (o.description === d.value) {
            existing = true;
          }
          else {
            // Again we need to cleanup old values 
            // since /common/topic/description is not unique.
            desc.push({
              value: d.value,
              lang: d.lang,
              connect: "delete"
            });
          }
        });
        if (!existing) {
          desc.push({
            value: o.description,
            lang: o.lang,
            connect: "insert"
          });
        }
      }
      if (desc.length) {
        update["/common/topic/description"] = desc;
      }

      ["enumeration", "mediator", "deprecated", "never_assert"].forEach(function(k) {
          if (remove[k]) {
              var old_value = old["/freebase/type_hints/" + k];
              if (old_value != null) {
                  update["/freebase/type_hints/" + k] = {value:old_value, connect:"delete"};
              }
          }
      });
      if (remove.mediator) {
          // re-add /common/topic as an included_type
          update["/freebase/type_hints/included_types"] = {id: "/common/topic", connect: "insert"};
      }
      
      // o.enumeration && o.mediator NOT allowed
      if (o.enumeration) {
        update["/freebase/type_hints/enumeration"] = {value:true, connect:"update"};
        update["/freebase/type_hints/mediator"] = {value:false, connect:"update"};
        update["/freebase/type_hints/included_types"] = {id: "/common/topic", connect: "insert"};
      }
      else if (o.mediator) {
        update["/freebase/type_hints/enumeration"] = {value:false, connect:"update"};
        update["/freebase/type_hints/mediator"] = {value:true, connect:"update"};
        update["/freebase/type_hints/included_types"] = {id: "/common/topic", connect: "delete"};
      }
      else {
        update["/freebase/type_hints/enumeration"] = {value:false, connect:"update"};
        update["/freebase/type_hints/mediator"] = {value:false, connect:"update"};
        update["/freebase/type_hints/included_types"] = {id: "/common/topic", connect: "insert"};
      }

      ["deprecated", "never_assert"].forEach(function(k) {
          if (h.type(o[k]) === "boolean") {
              update["/freebase/type_hints/" + k] = {value:o[k], connect:"update"};
          }
      });
      
      var d = old;
      var keys = [
          "name",
          "/common/topic/description",
          "/freebase/type_hints/enumeration",
          "/freebase/type_hints/mediator", 
          "/freebase/type_hints/deprecated",
          "/freebase/type_hints/never_assert",
          "/freebase/type_hints/included_types"
      ];
      for (var i=0,l=keys.length; i<l; i++) {
        if (keys[i] in update) {
          d = freebase.mqlwrite(update)
            .then(function(env) {
              // invalidate type
              typeloader.invalidate(old.id);
              return old;
            });
          break;
        }
      }
      // invalidate type
      typeloader.invalidate(old.id);
      return d;
    })
    .then(function(updated) {
      return updated.id;
    });
};
