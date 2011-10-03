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
var i18n = acre.require("lib/i18n/i18n.sjs");
var h = acre.require("lib/helper/helpers.sjs");
var apis = acre.require("lib/promise/apis.sjs");
var deferred = apis.deferred;
var freebase = apis.freebase;
var th = acre.require("helpers.sjs");
var fh = acre.require("lib/filter/helpers.sjs");
var creator = acre.require("lib/queries/creator.sjs");

function links(id, filters, next) {
  filters = h.extend({}, filters);
  return creator.by(filters.creator, "/type/user")
    .then(function(creator_clause) {
      var promises = {
        incoming: links_incoming(id, filters, next, creator_clause),
        outgoing: links_outgoing(id, filters, next, creator_clause)
      };
      return deferred.all(promises)
        .then(function(result) {
          return links_sort(result.incoming, result.outgoing, filters);
        });
    });
};

function links_sort(a, b, filters) {
  if (a.length && b.length) {
    // TODO: assert a, b are sorted -timestamp
    var i;
    var a_ts = a[a.length - 1].timestamp;  // last timestamp of incoming
    var b_ts = b[b.length - 1].timestamp;  // last timestamp of outgoing
    if (a_ts < b_ts) {
      a = a.filter(function(l) {
        return l.timestamp > b_ts;
      });
    }
    else {
      b = b.filter(function(l) {
        return l.timestamp > a_ts;
      });
    }
  }
  return a.concat(b).sort(function(a, b) {
    return b.timestamp > a.timestamp;
  });
};

function links_incoming(id, filters, next, creator_clause) {
  var q = [h.extend({
    type: "/type/link",
    master_property: null,
    source: {id:null, mid:null, guid:null, name:i18n.mql.query.name()},
    "me:target": {id:id, guid:null},
    target_value: {},
    timestamp: null,
    sort: "-timestamp",
    optional: true
  }, creator_clause)];
  if (next) {
    q[0]["next:timestamp<"] = next;
  }
  apply_filters(q[0], filters);
  return freebase.mqlread(q, mqlread_options(filters))
    .then(function(env) {
      return env.result;
    });
};

function links_outgoing(id, filters, next, creator_clause) {
  var q = [h.extend({
    type: "/type/link",
    master_property: null,
    "me:source": {id: id},
    target: {id:null, mid:null, name:i18n.mql.query.name(), optional:true},
    target_value: {},
    timestamp: null,
    sort: "-timestamp",
    optional: true
  }, creator_clause)];
  if (next) {
    q[0]["next:timestamp<"] = next;
  }
  apply_filters(q[0], filters);
  return freebase.mqlread(q, mqlread_options(filters))
    .then(function(env) {
      return env.result;
    });
};

function writes(id, filters) {
  filters = h.extend({}, filters);
  return creator.by(id, filters.type)
    .then(function(links_clause) {
      var q = h.extend(links_clause, {
        type: "/type/link",
        source: {
          optional: true,
          id: null,
          mid: null,
          name: i18n.mql.query.name()
        },
        target: {
          optional: true,
          id: null,
          mid: null,
          name: i18n.mql.query.name()
        },
        master_property: null,
        target_value: {},
        timestamp: null,
        sort: "-timestamp"
      });
      apply_filters(q, filters);
      return freebase.mqlread([q], mqlread_options(filters))
        .then(function(env) {
          return env.result;
        });
    });
};

/**
 * Apply filter constraint helpers
 */

function apply_filters(clause, filters) {
  if (!filters) {
    return clause;
  }
  // creator is already applied in links query
  apply_limit(clause, filters.limit);
  apply_timestamp(clause, filters.timestamp);
  apply_historical(clause, filters.historical);
  apply_domain_type_property(clause, filters.domain, filters.type, filters.property);
};

function apply_limit(clause, limit) {
  if (limit) {
    clause.limit = limit;
  }
  return clause;
};

function apply_timestamp(clause, timestamp) {
  if (timestamp) {
    if (!h.isArray(timestamp)) {
      timestamp = [timestamp];
    }
    var len = timestamp.length;
    if (len === 1) {
      clause["filter:timestamp>="] = fh.timestamp(timestamp[0]);
    }
    else if (len === 2) {
      timestamp.sort(function(a,b) {
        return b < a;
      });
      clause["filter:timestamp>="] = fh.timestamp(timestamp[0]);
      clause["filter:timestamp<"] = fh.timestamp(timestamp[1]);
    }
  }
  return clause;
};

function apply_historical(clause, historical) {
  if (historical) {
    clause.valid = null;
    clause.operation = null;
  }
  return clause;
};

function apply_domain_type_property(clause, domain, type, property) {
  if (domain) {
    clause["filter:master_property"] = {schema:{domain:domain}};
  }
  else if (type) {
    clause["filter:master_property"] = {schema:type};
  }
  else if (property) {
    clause["filter:master_property"] = property;
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
