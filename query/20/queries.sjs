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
var i18n = acre.require("lib/i18n/i18n.sjs");
var apis = acre.require("lib/promise/apis.sjs"),
    deferred = apis.deferred,
    freebase = apis.freebase;

function create_query(user_id, query, name, key, domain, description, lang) {
  var clause = h.isArray(query) ? query[0] : query;
  var type = get_clause_type(clause);

  return freebase.mqlwrite({
      "create": "unless_exists",
      "id": null,
      "type": {
        "id": "/type/namespace", 
        "connect": "insert"
      },
      "key": {
        "value": "views", 
        "namespace": domain
      }
    }, { "use_permission_of": domain })
    .then(function(env) {
      return env.result;
    })
    .then(function(ns) {
      return freebase.mqlwrite({
          "create": "unless_exists",
          "name": {
            "value": name,
            "lang": lang
          },
          "id": null,
          "mid": null,
          "type": [{
            "id": "/freebase/query"
          },{
            "id": "/common/document"
          }],
          "/freebase/query_hints/related_type": {
            "id" : type
          },
          "key": {
            "value": key,
            "namespace": ns.id
          }
        }, { "use_permission_of": user_id })
        .then(function(env) {
          return env.result;
        })
        .then(function(doc) {
          var promises = [];
          
          promises.push(freebase.upload(JSON.stringify(query, null, 2), "text/plain", {
            "document": doc.mid
          }));
          
          if (description) {
            var qa =  acre.require("lib/queries/create_article.sjs");
            promises.push(qa.create_article(description, 'text/plain', {
              "topic": doc.mid,
              "use_permission_of": user_id,
              "lang": lang
            }));
          }
          
          return deferred.all(promises, true)
            .then(function() {
              return doc;
            });
        });
    });
};
