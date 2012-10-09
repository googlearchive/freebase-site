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
var h = acre.require("helper/helpers.sjs");
var apis = acre.require("promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;
var validators = acre.require("validator/validators.sjs");

/**
 * Create a new base:
 * We use /user/appeditoruser to write a key into /base
 *
 *
 * @param o:Object (required) - options specifying the new type.
 */
function create_base(options) {
  h.enable_writeuser();
  
  var o;
  try {
    o = {
      name: validators.String(options, "name", {required:true}),
      key: validators.DomainKey(options, "key", {required:true}),
      description: h.trim(
          validators.String(options, "description", {if_empty:""})),
      lang: validators.LangId(options, "lang", {if_empty:"/lang/en"})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var q = {
    id: null,
    guid: null,
    key: {
      value: o.key,
      namespace: "/base"
    }
  };
  return freebase.mqlread(q)
    .then(function(env) {
      if (env.result) {
        return deferred.rejected("key already exists: " + o.key);
      }
      return true;
    })
    .then(function() {
      /**
       * Create a stub domain (without a key) with the proper permission group.
       *
       * The key will be inserted in the next callback since you need special
       * permission to add keys to /base.
       */
      return freebase.create_group("Owners of " + o.name + " domain", {
        extra_group: "/boot/schema_group"
      })
      .then(function(env) {
        return env.result;
      });
    })
    .then(function(group) {
      q = {
        id: null,
        guid: null,
        mid: null,
        type: "/type/domain",
        name: {
          value: o.name,
          lang: o.lang
        },
        owners: {
          id: group.mid
        },
        create: "unconditional"
      };
      if (o.description !== '') {
          q['/common/topic/description'] = {
            value: o.description,
            lang: o.lang
          };
      }
      return freebase.mqlwrite(q, {use_permission_of: group.mid})
        .then(function(env) {
          return env.result;
        });
    })
    .then(function(created) {

      /**
       * Now add the key to /base using /user/fb_writeuser,
       * permitted to write to /base.
       *
       * mqlwrite(q, null, {http_sign: "keystore"}
       */
      q = {
        guid: created.guid,
        id: null,
        key: {
          value: o.key,
          namespace: "/base",
          connect: "insert"
        }
      };

      var options = {
        http_sign: "keystore"
      };
      
      return freebase.mqlwrite(q, null, options)
        .then(function(env) {
          var result = env.result;
          if (result) {
            created.id = result.id;
            created.key = result.key;
          }
          return created;
        });
    });
};
