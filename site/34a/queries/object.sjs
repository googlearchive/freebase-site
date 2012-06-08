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
var deferred = acre.require("lib/promise/deferred");
var freebase = acre.require("lib/promise/apis").freebase;
var i18n = acre.require("lib/i18n/i18n.sjs");
var creator = acre.require("lib/queries/creator.sjs");
var article = acre.require("lib/queries/article.sjs");

/**
 * Basic freebase object information (in english):
 * This query is used in template/object.mjt to display the freebase object mast-head.
 */
function object(id, options) {
    var q = mql(id);
    q = h.extend(q, options);
    var promises = {
        object: freebase.mqlread(q)
            .then(function(env) {
                return env.result;
            }),
        article: article.get_article(id, null, null, i18n.lang)
            .then(function(r) {
                return r[id];
            })
    };
    return deferred.all(promises)
        .then(function(r) {
          if (!r.object) {
            return new Error(h.sprintf("%s not found", id));
          }
          return r;
        })
        .then(function(r) {
          r.object["/common/topic/article"] = r.article;
          return callback(r.object);
        });
};

function callback(result) {
    var topic = result;
    if (!topic) return null;
    topic.attribution = h.get_attribution(topic);
    topic.name = topic.name.sort(h.text_lang_sort);
    topic.image = topic["/common/topic/image"];
    topic.replaced_by = topic["/dataworld/gardening_hint/replaced_by"];
    topic.flag = topic["!/freebase/review_flag/item"];
    //h.resolve_article_uri(topic.article);    // resolve wikipedia links
    return topic;
};


/**
 * promise to get the blurb of an object
 */
function blurb(o) {
    return article.get_text(o);
};

/**
 * promise to get saved queries
 */
function query(o) {
  return freebase.get_blob(o["/common/document/content"].id)
    .then(function(ret){
      return JSON.parse(ret.body);
    });
};

/**
 * promise to get the /freebase/documented_object/tip (of a property).
 */
function documented_object_tip(o) {
  var q = {
    id: o.id,
    "/freebase/documented_object/tip": i18n.mql.query.text()
  };
  return freebase.mqlread(q)
    .then(function(env) {
      var tip = i18n.mql.result.text(env.result["/freebase/documented_object/tip"]);
      if (tip) {
        return tip.value;
      }
      else {
        return null;
      }
    });
};

function mql(id) {
  return creator.extend({
    id: null,
    "q:id": id,
    guid: null,
    mid: null,
    type: [{
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/type",
      "!/freebase/domain_profile/base_type": {
        id: null,
        optional: "forbidden"
      },
      index: null,
      link: {timestamp: null},
      sort: ["index", "link.timestamp"]
    }],
    name: [{
      optional: true,
      value: null,
      lang: null
    }],
    "/common/topic/image": [{
      optional: true,
      id: null,
      limit: 1
    }],
    "/common/document/content": {
      optional: true,
      id: null
    },
    permission: null,
    timestamp: null,
    "/dataworld/gardening_hint/replaced_by": {
      id: null,
      mid: null,
      optional: true
    },
    "!/freebase/review_flag/item": creator.extend([{
      id: null,
      kind: {id: null},
      type: "/freebase/review_flag",
      optional: true
    }])
  });
};


