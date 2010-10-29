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
var h = mf.require("core", "helpers");
var i18n = mf.require("i18n", "i18n");
var update_article = mf.require("update_article");
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var validators = mf.require("validator", "validators");

/**
 * Create a new topic with name, type (optional) and description (optional).
 * If "create" option is "unless_exists", the constraints will be on the name and type (and not the type's included_types).
 * Also, if topic exists with a description, it's description will be updated if description is specified.
 * If "included_types" option is TRUE, this will type the topic with the included_types (/freebase/type_hints/included_types)
 * of the "type" specified.
 *
 * @param o:Object (required) - options specifying the new topic.
 */
function create_topic(options) {
  var o;
  try {
    o = {
      name: validators.String(options, "name", {required:true}),

      type: validators.MqlId(options, "type", {if_empty:""}),
      included_types: validators.StringBool(options, "included_types", {if_empty:true}),
      description: validators.String(options, "description", {if_empty:""}),

      create: validators.OneOf(options, "create", {oneof:["unconditional", "unless_exists"], if_empty:"unconditional"}),
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var q = {
    id: null,
    name: {
      value: o.name,
      lang: o.lang
    },
    create: o.create
  };
  if (o.type) {
    q.type = o.type;
  }

  return freebase.mqlwrite(q)
    .then(function(env) {
      var created = env.result;
      created.name = created.name.value;
      return created;
    })
    .then(function(created) {
      if (o.type && o.included_types) {
        return included_types(o.type)
          .then(function(types) {
            if (types.length) {
              var q = {
                id: created.id,
                type: [{id:t.id, connect:"insert"} for each (t in types)]
              };
              return freebase.mqlwrite(q)
                .then(function() {
                  return created;
                });
            }
            else {
              return created;
            }
          });
      }
      else {
        return created;
      }
    })
    .then(function(created) {
      if (o.description) {
        if (created.create === "existed") {
          // look up if there's an existing /common/topic/article
          return freebase.mqlread({id:created.id, "/common/topic/article": i18n.mql.article_clause(o.lang)})
            .then(function(env) {
              var result = env.result;
              created["/common/topic/article"] = result["/common/topic/article"];
              return created;
            });
        }
      }
      return created;
    })
    .then(function(created) {
      if (o.description) {
        var article = i18n.mql.get_article(o.lang, created["/common/topic/article"] || [], true);
        if (article && article.source_uri) {
          article = null;  // can't update/delete wp articles
        }
        var update_article_options = {
          topic: created.id,
          article: article ? article.id : null,
          lang: o.lang,
          use_permission_of: created.id
        };
        return update_article.update_article(o.description, "text/html", update_article_options)
          .then(function() {
              return created;
          });
      }
      else {
        return created;
      }
    });
};


/**
 * copied from schema queries included_types
 */
function included_types(id) {
  return freebase.mqlread({
    id: id,
    "/freebase/type_hints/included_types": [{
      optional: true,
      id: null,
      name: null,
      type: "/type/type",
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }]
  })
  .then(function(env) {
    return env.result;
  })
  .then(function(result) {
    var types = result["/freebase/type_hints/included_types"];
    return [{id: t.id, name: t.name} for each (t in types)];
  });
};
