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

var h = acre.require("helper/helpers.sjs");
var apis = acre.require("promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;
var i18n = acre.require("i18n/i18n.sjs");
var ph = acre.require("propbox/helpers.sjs");
var proploader = acre.require("schema/proploader.sjs");

/**
 * MQL prop schema result
 */
function prop_schema(pid, lang) {
  return proploader.load(pid, lang);
};

function prop_schemas(pids, lang) {
  return proploader.loads(pids, lang)
    .then(function(result) {
      var schemas = [];
      pids.forEach(function(pid, i) {
        var schema = result[pid] || null;
        schemas.push(schema);
      });
      return schemas;
    });
};

/**
 * Topic API prop structure (format)
 *
 * {
 *    id: pid,
 *    properties: [...]
 * }
 */
function prop_structure(pid, lang) {
  return prop_schema(pid, lang)
    .then(function(schema) {
      if (schema) {
        return ph.to_prop_structure(schema, lang);
      }
      else {
        return null;
      }
    });
};


function prop_structures(pids, lang) {
  return prop_schemas(pids, lang)
    .then(function(schemas) {
      var structures = [];
      schemas.forEach(function(schema) {
        if (schema) {
          structures.push(ph.to_prop_structure(schema, lang));
        }
        else {
          structures.push(null);
        }
      });
      return structures;
    });
};

/**
 * MQL property data query result
 *
 * {
 *    id: topic_id,
 *    pid: [{...}]
 * }
 *
 * @param value - if null, get all values
 * @param lang - the language to constrain all object names and /type/text values
 */
function prop_data(topic_id, prop /** pid or prop_structure **/, value, lang, namespace) {
  var promise;
  if (typeof prop === "string") {
    promise = prop_structure(prop, lang);
  }
  else {
    promise = deferred.resolved(prop);
  }
  return promise
    .then(function(prop_structure) {
       var q = ph.mqlread_query(topic_id, prop_structure, value, lang, namespace);
       return freebase.mqlread(q)
         .then(function(env) {
           return env.result[prop_structure.id] || [];
         });
    });
};

/**
 * Topic API prop structure + values
 *
 * {
 *    id: topic_id,
 *    properties: [...],
 *    values: [...]
 * }
 *
 * @param value - if null, get all values
 * @param lang - the language to constrain all object names and /type/text values
 */
function prop_values(topic_id, prop /** pid or prop_structure **/, value, lang, namespace) {
  var promise;
  if (typeof prop === "string") {
    promise = prop_structure(prop, lang);
  }
  else {
    promise = deferred.resolved(prop);
  }
  return promise
    .then(function(prop_structure) {
      return prop_data(topic_id, prop_structure, value, lang, namespace)
        .then(function(prop_data) {
          return ph.to_prop_values(prop_structure, prop_data, lang);
        });
    });
};

function get_enumerated_types(prop, lang) {
  var d;
  if (typeof prop === "string") {
    d = prop_structure(prop, lang);
  }
  else {
    d = deferred.resolved(prop);
  }
  return d
    .then(function(structure) {
      var ect = structure.expected_type;
      var promise;
      if (ect.enumeration === true) {
        promise = freebase.mqlread([{
          optional: true,
          id: null,
          mid: null,
          name: i18n.mql.text_clause(lang),
          type: {id:ect.id, limit:0},
          limit: 500
        }])
        .then(function(env) {
          var topics = env.result;
          topics.forEach(function(t) {
            var t_name = i18n.mql.get_text(lang, t.name);
            t.text = t_name ? t_name.value : t.id;
          });
          topics.sort(function(a, b) {
            return b.text < a.text;
          });
          ect.instances = topics;
          return structure;
        });
      }
      else {
        promise = deferred.resolved(structure);
      }
      return promise
        .then(function(structure) {
          if (structure.properties && structure.properties.length) {
            var promises = [];
            for (var i=0,l=structure.properties.length; i<l; i++) {
              promises.push(get_enumerated_types(structure.properties[i], lang));
            }
            return deferred.all(promises)
              .then(function() {
                return structure;
              });
          }
          else {
            return structure;
          }
        });
  });
};
