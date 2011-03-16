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
var mql = acre.require("propbox/mql.sjs");
var ph = acre.require("propbox/helpers.sjs");

function _prop_schema(pid, lang) {
  var q = mql.prop_schema({id: pid}, lang);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
};

function prop_structure(pid, lang) {
  return _prop_schema(pid, lang)
    .then(function(schema) {
      return ph.minimal_prop_structure(schema, lang);
    });
};

function prop_data(topic_id, prop /** pid or prop_structure **/, value, lang) {
  var promise;
  if (typeof prop === "string") {
    promise = prop_structure(pid, lang);
  }
  else {
    promise = deferred.resolved(prop);
  }
  return promise
    .then(function(prop_structure) {
       var q = ph.mqlread_query(topic_id, prop_structure, value, lang);
console.log("prop_data query", JSON.stringify(q));
       return freebase.mqlread(q)
         .then(function(env) {
console.log("prop_data result", env);
           return env.result;
         });
    });
};

function get_enumerated_types(structure, lang) {
  var ect = structure.expected_type;
  var promises = [];
  if (ect.enumeration === true) {
    var promise = freebase.mqlread([{
      optional: true,
      id: null,
      name: i18n.mql.text_clause(lang),
      type: {id:ect.id, limit:0},
      limit: 500
    }])
    .then(function(env) {
      var topics = env.result;
      topics.forEach(function(t) {
        t.text = i18n.mql.get_text(lang, t.name).value;
      });
      topics.sort(function(a, b) {
        return b.text < a.text;
      });
      ect.instances = topics;
      return topics;
    });
    promises.push(promise);
  }
  if (structure.properties) {
    for (var i=0,l=structure.properties.length; i<l; i++) {
      promises = promises.concat(get_enumerated_types(structure.properties[i], lang));
    }
  }
  return deferred.all(promises);
};

