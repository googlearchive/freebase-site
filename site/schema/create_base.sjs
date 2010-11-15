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
 * Create a new base:
 * We use /user/appeditoruser to write a key into /base
 *
 *
 * @param o:Object (required) - options specifying the new type.
 */
function create_base(options) {
  var o;
  try {
    o = {
      name: validators.String(options, "name", {required:true}),
      key: validators.DomainKey(options, "key", {required:true}),
      description: validators.String(options, "description", {if_empty:""}),
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var q = {
    id: null,
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
      var group = acre.freebase.create_group(h.sprintf("Owners of %s domain", o.name), {
        extra_group: "/boot/schema_group"
      }).result;

      q = {
        id: null,
        guid: null,
        type: "/type/domain",
        name: {
          value: o.name,
          lang: o.lang
        },
        owners: {
          id: group.id
        },
        create: "unconditional"
      };
      return freebase.mqlwrite(q, {use_permission_of: group.id})
        .then(function(env) {
          return env.result;
        });
    })
    .then(function(created) {

      /**
       * Now add the key to /base using /freebas/site/schema app's permitted user,
       * /user/appeditoruser
       *
       * mqlwrite(q, null, {http_sign: false}
       */
      q = {
        id: null,
        guid: created.guid,
        key: {
          value: o.key,
          namespace: "/base",
          connect: "insert"
        }
      };
      var options = null;
      if (/www.(freebase|sandbox\-freebase)\.com$/.test(acre.request.server_name)) {
        // http_sign: false only works on www.freebase|sandbox-freebase.com
        options = {
          http_sign: false
        };
      }
      created = acre.freebase.mqlwrite(q, null, options).result;

      if (o.description !== "") {
        return create_article.create_article(o.description, "text/html",
                                             {
                                               use_permission_of: created.id,
                                               topic: created.id,
                                               lang: o.lang
                                             })
          .then(function(article) {
            return created;
          });
      }
      else {
        return created;
      }
    });
};

