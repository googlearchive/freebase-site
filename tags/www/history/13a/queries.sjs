/*
 * Copyright 2011, Google Inc.
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

var h = acre.require('helpers.sjs');
var deferred = acre.require('lib/promise/deferred.sjs');
var freebase = acre.require('lib/promise/apis.sjs').freebase;

// Filter on:
// domain, type, prop, as_of
// timestamp, user, limit
function entity_history(entity_id, filters) {
  var base_q = {
    'type': '/type/link',
    'timestamp': null,
    'sort': '-timestamp',
    'operation': null,
    'valid': null,
    'limit': 100
  };
  apply_limit(base_q, filters);
  apply_timestamp(base_q, filters);
  add_creator_clause(base_q);

  var source_q = h.extend({}, base_q, {
    'source': {
      'id': entity_id,
      'limit': 0
    },
    'target': {
      'id': null,
      'mid': null,
      'name': null,
      'optional': true
    },
    'target_value': null,
    'master_property': {
      'id': null,
      'name': null
    }
  });
  apply_schema(source_q.master_property, filters);
  
  var target_q = h.extend({}, base_q, {
    'target': {
      'id': entity_id,
      'limit': 0
    },
    'source': {
      'id': null,
      'mid': null,
      'name': null
    },
    'master_property': {
      'reverse_property': {
        'id': null,
        'name': null
      }
    }
  });
  apply_schema(target_q.master_property.reverse_property, filters);
  console.log(source_q, target_q);
  return deferred.all({
    source: freebase.mqlread([source_q]),
    target: freebase.mqlread([target_q])
  }).then(function(results) {
    var history = [];
    console.log(results.source, results.target);
    if (results.source && !(results.source instanceof Error)) {
      results.source.result.forEach(function(o) {
        var link = {
          operation: o.operation,
          timestamp: o.timestamp,
          property: o.master_property,
          creator: extract_creator(o)
        };
        if (o.target_value != null) {
          link.value = {'value': o.target_value};
          if (o.target) {
            o.lang = o.target.id;
          }
        } else {
          link.value = o.target;
        }
        
        history.push(link);
      });
    }
    
    if (results.target && !(results.target instanceof Error)) {
      results.target.result.forEach(function(o) {
        var link = {
          operation: o.operation,
          timestamp: o.timestamp,
          value: o.source,
          property: o.master_property.reverse_property,
          creator: extract_creator(o)
        };
        history.push(link);
      });
    }

    if (filters.limit) {
      history = history.slice(0, filters.limit);
    }

    return history;
  }, function (error) {
    return [];
  });
};

//---Creator---//

function add_creator_clause(q) {
  q['creator'] = {
    'id': null,
    'key': {
      'value': null,
      'namespace': '/user',
      'limit': 1
    },
    'type': '/type/user',
    'optional': true
  };
  q['attribution'] = {
    'attribution': {
      'id': null,
      'key': {
        'value': null,
        'namespace': '/user',
        'limit': 1
      },
      'type': '/type/user'
    },
    'type': '/type/attribution',
    'optional': true
  };
  return q;
};

function extract_creator(result) {
  var user;
  if (result.creator) {
    user = result.creator;
  } else if (result.attribution && result.attribution.attribution) {
    user = result.attribution.attribution;
  } else {
    user = null;
  }
  if (user) {
    user.name = user.key.value;
  }
  return user;
};

//---Filters---//

function apply_limit(clause, filters) {
  if (filters.limit) {
    clause.limit = filters.limit;
  }
  return clause;
};

function apply_timestamp(clause, filters) {
  var timestamp = filters.timestamp;
  if (timestamp) {
    if (!h.isArray(timestamp)) {
      timestamp = [timestamp];
    }
    var len = timestamp.length;
    if (len === 1) {
      clause["filter:timestamp>="] = timestamp[0];
    }
    else if (len === 2) {
      timestamp.sort(function(a,b) {
        return b < a;
      });
      clause["filter:timestamp>="] = timestamp[0];
      clause["filter:timestamp<"] = timestamp[1];
    }
  }
  return clause;
};

function apply_schema(clause, filters) {
  if (filters.domain) {
    clause['filter:schema'] = {'domain': {'id': filters.domain}};
  } else if (filters.type) {
    clause['filter:schema'] = {'id': filters.type};
  } else if (filters.property) {
    clause["filter:id"] = filters.property;
  }
  return clause;
};
