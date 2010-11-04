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
var update_article = mf.require("queries", "update_article");
var validators = mf.require("validator", "validators");
var i18n = mf.require("i18n", "i18n");

/**
 * Update an existing domain values (name, key, description).
 *
 * @param o:Object (required) - options specifying the updated values.
 */
function update_domain(options) {
  var o;
  try {
    o = {
      // required
      id: validators.MqlId(options, "id", {required:true}),

      // optional
      name: validators.String(options, "name", {if_empty:null}),
      namespace: validators.MqlId(options, "namespace", {if_empty:null}),  // assuming has permission on namespace
      key: validators.DomainKey(options, "key", {if_empty:null}),
      description: validators.String(options, "description", {if_empty:null}),
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"}),

      // an array of options to remove/delete (name, key, description);
      remove: validators.Array(options, "remove", {if_empty:[]})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var remove = {};
  o.remove.forEach(function(k) {
    remove[k] = true;
  });

  var q = {
    id: o.id,
    guid: null,
    type: "/type/domain",
    key: [{namespace:null,value:null,optional:true}],
    name: {value:null, lang:o.lang, optional:true},
    "/common/topic/article": i18n.mql.article_clause(o.lang)
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(old) {
      if (remove.key && o.namespace) {
        // delete key from o.namespace (required)
        for (var i=0,l=old.key.length; i<l; i++) {
          var k = old.key[i];
          if (k.namespace === o.namespace) {
            return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.namespace, value:k.value, connect:"delete"}})
              .then(function(env) {
                // old id may no longer be valid since we deleted the key
                old.id = env.result.id;
                return old;
              });
          }
        }
      }
      else if (o.namespace && o.key) {
        for (var i=0,l=old.key.length; i<l; i++) {
          var k = old.key[i];
          if (k.namespace === o.namespace && k.value !== o.key) {
            return freebase.mqlwrite({guid:old.guid, key:{namespace:o.namespace, value:k.value, connect:"delete"}})
              .then(function(env) {
                // insert new key
                return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.namespace, value:o.key, connect:"insert"}})
                  .then(function(env) {
                    // id may have changed
                    old.id = env.result.id;
                    return old;
                  });
              });
            }
        }
      }
      return old;
    })
    .then(function(old) {
      var update = {
        guid: old.guid,
        type: "/type/domain"
      };

      if (remove.name && old.name) {
        update.name = {value:old.name.value, lang:old.name.lang, connect:"delete"};
      }
      else if (o.name != null) {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }
      var d = old;
      var keys = ["name"];
      for (var i=0,l=keys.length; i<l; i++) {
        if (keys[i] in update) {
          d = freebase.mqlwrite(update)
            .then(function(env) {
              return old;
            });
          break;
        }
      }
      return d;
    })
    .then(function(old) {
      var article = i18n.mql.get_article(o.lang, old["/common/topic/article"], true);
      if (article && article.source_uri) {
        article = null;  // can't update/delete wp articles
      }
      if (remove.description && article) {
        return freebase.mqlwrite({id:old.id, "/common/topic/article":{id:article.id, connect:"delete"}})
          .then(function() {
            return old.id;
          });
      }
      else if (o.description != null) {
        var update_article_options = {
          topic: old.id,
          article: article ? article.id : null,
          lang: o.lang,
          use_permission_of: old.id
        };
        return update_article.update_article(o.description, "text/html", update_article_options)
          .then(function() {
            return old.id;
          });
      }
      return old.id;
    });
};
