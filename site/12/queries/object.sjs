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
var h = acre.require("lib/helper/helpers.sjs");
var deferred = acre.require("lib/promise/deferred");
var freebase = acre.require("lib/promise/apis").freebase;
var i18n = acre.require("lib/i18n/i18n.sjs");

/**
 * Basic freebase object information (in english):
 * This query is used in template/freebase_object template to display the freebase object mast-head.
 */
function object(id, options) {
  var q = mql(id);
  q = h.extend(q, options);

  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(topic) {
      if (!topic) return null;
      topic.name = topic.name.sort(h.text_lang_sort);
      topic.alias = topic["/common/topic/alias"].sort(h.text_lang_sort);
      topic.image = topic["/common/topic/image"];
      topic.article = topic["/common/topic/article"];
      topic.replaced_by = topic["/dataworld/gardening_hint/replaced_by"];
      return topic;
    });
};

/**
 * promise to get the blurb of an object
 */
function blurb(o) {
  var article = i18n.mql.result.article(o.article);
  if (article) {
    return i18n._get_blob.closure(article, "blurb", {maxlength: 500}, "blurb")
      .then(function() {
        return article.blurb;
      });
  }
  else {
    return null;
  }
};

/**
 * promise to get saved queries
 */
function query(o) {
  return freebase.get_blob(o.id)
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

/**
 * promise to get the notable_types of an object
 */
function notable_types(o) {
  return freebase.get_static("notable_types_2", o.guid.substring(1))
    .then(function(r) {
      return r;
    });
};

function mql(id) {
  return {
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
    "/common/topic/alias": [{
      optional: true,
      value: null,
      lang: null
    }],
    "/common/topic/image": [{
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/common/image",
      index: null,
      link: {timestamp: null},
      sort: ["index", "link.timestamp"],
      limit: 3
    }],
    "/common/topic/article": i18n.mql.query.article(),
    creator: {
      id: null,
      attribution: null
    },
    permission: null,
    timestamp: null,
    "/dataworld/gardening_hint/replaced_by": {
      id: null,
      mid: null,
      optional: true
    }
  };
};


