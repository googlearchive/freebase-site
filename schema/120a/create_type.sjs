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

/**
 * Create a new type using the permission of the specified domain.
 *
 * @param o:Object (required) - options specifying the new type.
 */
function create_type(options) {
  var o;
  try {
    o = {
      domain: validators.MqlId(options, "domain", {required:true}),
      name: validators.String(options, "name", {required:true}),
      key: validators.TypeKey(options, "key", {required:true}),
      description: validators.String(options, "description", {if_empty:""}),
      mediator: validators.StringBool(options, "mediator", {if_empty:false}),
      enumeration: validators.StringBool(options, "enumeration", {if_empty:false}),
      deprecated: validators.StringBool(options, "deprecated", {if_empty:false}),
      never_assert: validators.StringBool(options, "never_assert", {if_empty:false}),
      lang: validators.LangId(options, "lang", {if_empty:"/lang/en"})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }
  if (o.enumeration && o.mediator) {
    return deferred.rejected("Type can't be both Enumerated and Mediator.");
  }

  var q = {
    id: null,
    guid: null,
    mid: null,
    key: {
      value: o.key,
      namespace: o.domain
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
      q = {
        id: null,
        guid: null,
        mid: null,
        key: {
          value: o.key,
          namespace: o.domain
        },
        type: {
          id: "/type/type"
        },
        "/type/type/domain": {
          id: o.domain
        },
        name: {
          value: o.name,
          lang: o.lang
        },
        create: "unconditional"
      };

      if (o.mediator) {
        // need to update /freebase/type_hints/mediator
        q["/freebase/type_hints/mediator"] = {
          value: true
        };
      }
      else {
        if (o.enumeration) {
          // need to update /freebase/type_hints/enumeration
          q["/freebase/type_hints/enumeration"] = {
            value: true
          };
        }
        // non-mediators need /common/topic included type
        q["/freebase/type_hints/included_types"] = {
          id: "/common/topic"
        };
      }      
      if (o.deprecated) {
          q["/freebase/type_hints/deprecated"] = {
              value: true
          };
      }
      if (o.never_assert) {
          q["/freebase/type_hints/never_assert"] = {
              value: true
          };
      }
      if (o.description) {
        q["/common/topic/description"] = {
            value: o.description,
            lang: o.lang
        };
      }
      return freebase.mqlwrite(q, {use_permission_of: o.domain})
        .then(function(env) {
          return env.result;
        });
    });
};
