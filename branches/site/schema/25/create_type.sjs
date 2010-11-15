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

var mf = acre.require("MANIFEST").mf;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");
var create_article = mf.require("queries", "create_article");
var validators = mf.require("validator", "validators");

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
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"})
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
    create: "unless_exists"
  };
  return freebase.mqlwrite(q, {use_permission_of: o.domain})
    .then(function(env) {
      return env.result;
    })
    .then(function(created) {
      if (created.create === "existed") {
        return deferred.rejected("key already exists: " + o.key);
      }
      // cleanup result
      created.domain = created["/type/type/domain"];

      q = {
        id: created.id,
        name: {
          value: o.name,
          lang: o.lang,
          connect: "update"
        }
      };
      if (o.mediator) {
        // need to update /freebase/type_hints/mediator
        q["/freebase/type_hints/mediator"] = {
          value: true,
          connect: "update"
        };
      }
      else {
        if (o.enumeration) {
          // need to update /freebase/type_hints/enumeration
          q["/freebase/type_hints/enumeration"] = {
            value: true,
            connect: "update"
          };
        }
        // non-mediators need /common/topic included type
        q["/freebase/type_hints/included_types"] = {
          id: "/common/topic",
          connect: "insert"
        };
      }


      return freebase.mqlwrite(q)
        .then(function(env) {
          return env.result;
        })
        .then(function(result) {
          if (o.description !== "") {
            return create_article.create_article(o.description, "text/html",
                                                 {use_permission_of: o.domain, topic: created.id, lang:o.lang})
              .then(function(article) {
                return created;
              });
          }
          return created;
        });
    });
};

