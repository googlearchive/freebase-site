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
var i18n = acre.require("lib/i18n/i18n.sjs");
var apis = acre.require("lib/promise/apis");
var freebase = apis.freebase;
var deferred = apis.deferred;
var fh = acre.require("lib/filter/helpers.sjs");
var creator = acre.require("lib/queries/creator.sjs");
var links_sort = acre.require("lib/queries/links.sjs").links_sort;

function keys(id, filters, next, lang) {
    filters = h.extend({}, filters);
    return creator.by(filters.creator, "/type/user")
        .then(function(creator_clause) {
            var promises = {};
            if (filters.property === "/type/namespace/keys") {
                promises.incoming = keys_incoming(id, filters, next, lang, creator_clause);
                promises.outgoing = deferred.resolved([]);
            }
            else if (filters.property === "/type/object/key") {
                promises.incoming = deferred.resolved([]);
                promises.outgoing = keys_outgoing(id, filters, next, lang, creator_clause);
            }
            else {
                promises.incoming = keys_incoming(id, filters, next, lang, creator_clause);
                promises.outgoing = keys_outgoing(id, filters, next, lang, creator_clause);
            }
            return deferred.all(promises)
                .then(function(result) {
                    return keys_sort(result.incoming, result.outgoing, filters);
                });
        });
};

function keys_sort(a, b, filters) {
    return links_sort(a, b, filters);
};

/**
 * /type/namespace/keys
 */
function keys_incoming(id, filters, next, lang, creator_clause, extend_clause) {
    var q = h.extend({
        type: "/type/link",
        master_property: "/type/namespace/keys",
        "me:source": {id:id},
        target: {
            // this is the object that has the key in this namespace (e.g. id)
            id: null,
            mid: null,
            name: i18n.mql.text_clause(lang),
            "topic:type": {
                id: "/common/topic",
                optional: true
            }
        },
        target_value: {
            // this is the key value
            value: null
        },
        timestamp: null,
        sort: "-timestamp",
        optional: true
    }, creator_clause, extend_clause);
    if (next) {
        q['next:timestamp<'] = next;
    }
    apply_filters(q, filters);
    return freebase.mqlread([q], mqlread_options(filters))
        .then(function(env) {
            return env.result;
        });
};

/**
 * /type/object/key
 */
function keys_outgoing(id, filters, next, lang, creator_clause, extend_clause) {
    var q = h.extend({
        type: "/type/link",
        master_property: "/type/namespace/keys",
        "me:target": {id:id},
        source: {
            // this object (e.g., id) has a key in this namespace
            id: null,
            mid: null,
            name: i18n.mql.text_clause(lang),
            "topic:type": {
                id: "/common/topic",
                optional: true
            }
        },        
        target_value: {
            // this is the key value
            value: null
        },
        timestamp: null,
        sort: "-timestamp",
        optional: true
    }, creator_clause, extend_clause);
    if (next) {
        q['next:timestamp<'] = next;
    }
    apply_filters(q, filters);
    return freebase.mqlread([q], mqlread_options(filters))
        .then(function(env) {
            return env.result;
        });
};

function apply_filters(q, filters) {
  if (!filters) {
    return q;
  }
  apply_timestamp(q, filters.timestamp);
  apply_creator(q, filters.creator);
  apply_historical(q, filters.historical);
};


function apply_timestamp(q, timestamp) {
  if (timestamp) {
    if (!h.isArray(timestamp)) {
      timestamp = [timestamp];
    }
    var len = timestamp.length;
    if (len === 1) {
      q.key[0].link["filter:timestamp>="] = fh.timestamp(timestamp[0]);
    }
    else if (len === 2) {
      timestamp.sort(function(a,b) {
        return b < a;
      });
      q.key[0].link["filter:timestamp>="] = fh.timestamp(timestamp[0]);
      q.key[0].link["filter:timestamp<"] = fh.timestamp(timestamp[1]);
    }
  }
  return q;
};

function apply_creator(q, creator) {
  if (creator) {
    if (!h.isArray(creator)) {
      creator = [creator];
    }
    if (creator.length) {
      q.key[0].link["filter:creator"] = {
        "id|=": creator
      };
    }
  }
  return q;
};

function apply_historical(clause, historical) {
  if (historical) {
    clause.valid = null;
    clause.operation = null;
  }
  return clause;
};

function mqlread_options(filters) {
  var options = {};
  if (!filters) {
    return options;
  }
  if (filters.as_of_time) {
    options.as_of_time = filters.as_of_time;
  }
  return options;
};
