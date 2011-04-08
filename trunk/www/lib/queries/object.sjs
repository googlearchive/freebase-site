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
var h = acre.require("helper/helpers.sjs");
var deferred = acre.require("promise/deferred");
var freebase = acre.require("promise/apis").freebase;
var i18n = acre.require("i18n/i18n.sjs");

/**
 * Basic freebase object information (in english):
 * This query is used in template/freebase_object template to display the freebase object mast-head.
 */
function object(id) {
  return freebase.mqlread({
    id: null,
    "q:id": id,
    guid: null,
    mid: null,
    name: i18n.mql.query.name(),
    creator: {
      optional: true,
      id: null,
      name: i18n.mql.query.name()
    },
    timestamp: null,
    "/common/topic/article": i18n.mql.query.article(),
    "/common/topic/image": [{
      id: null,
      optional: true,
      index: null,
      link: {timestamp: null},
      sort: ["index", "link.timestamp"],
      limit: 1
    }],
    type: [{
      id: null,
      optional: true
    }],
    permission: null
  })
  .then(function(env) {
    return env.result;
  })
  .then(function(topic) {
    topic.name = topic.name || topic.mid;
    topic.image = topic["/common/topic/image"];
    if (topic.creator) {
      topic.creator.name = topic.creator.name || topic.creator.id;
    }
    var promises = [];
    promises.push(
      freebase.get_static("notable_types_2", topic.guid.substring(1))
        .then(function(r) {
          if (r) {
            var notable_for = h.first_element(r.notable_for);
            if (notable_for) {
              if (notable_for.p === "/type/object/type") {
                topic.notable_type = notable_for.o;
              }
              else {
                topic.notable_for = notable_for.o;
              }
            }
            topic.notable_types = r.types;
          }
          return r;
        })
    );
    promises.push(i18n.get_blurb(topic, {maxlength: 500}));
    promises.push(i18n.get_blob(topic));
    return deferred.all(promises)
      .then(function() {
        return topic;
      });
  });
};
