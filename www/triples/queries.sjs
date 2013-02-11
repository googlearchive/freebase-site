/*
 * Copyright 2013, Google Inc.
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

var h = acre.require('lib/helper/helpers.sjs');
var creator_q = acre.require('lib/queries/creator.sjs');
var i18n = acre.require('lib/i18n/i18n.sjs');
var apis = acre.require('lib/promise/apis.sjs');
var freebase = apis.freebase;
var deferred = apis.deferred;

/**
 * @param {?String} linked_id The source or target id.
 * @param {?Array.<string>} pids The property ids to filter where each can
 *     be either link.master_property or link.master_property.reverse property.
 * @param {?String} creator The link.creator.
 * @param {Boolean} historical If TRUE, get "invalid" links as well.
 * @param {?String} sort Sort link 'timestamp' or '-timetamp'.
 *     Default is '-timestamp'.
 * @param {String|Array.<String>} timestamp In ISO format. If single timestamp,
 *     get links before or after that timestamp depending on the sort parameter.
 *     If timestamp.length == 2, get links within the timestamp range.
 * @param {?String} next Used for cursoring.
 * @return {lib.promise.deferred.Deferred.<Array>} A list of '/type/link's.
 */
function get_links(
    linked_id, pids, creator, historical, sort, timestamp, next) {
  return get_links_(
    linked_id, pids, creator, null, historical, sort, timestamp, next);
}

/**
 * Get links attributed to a provenance_id where the provenance_type is one of:
 * <ul>
 *   <li>/freebase/apps/acre_app</li>
 *   <li>/dataworld/software_tool</li>
 *   <li>/dataworld/mass_data_operation</li>
 *   <li>/dataworld/information_source</li>
 * </ul>
 * If provenance_type is not specified, this will do a query to find
 * what type provenance_id is.
 *
 * @param {String} provenance_id The provenance id that is one of the above
 *     provenance_type.
 * @param {?String} provenance_type The provenance type of provenance_id. If
 *     NULL, this will query to find a valid provenance type provenance_id is.
 * @param {?Array.<string>} pids The property ids to filter where each can
 *     be either link.master_property or link.master_property.reverse property.
 * @param {Boolean} historical If TRUE, get "invalid" links as well.
 * @param {?String} sort Sort link 'timestamp' or '-timetamp'.
 *     Default is '-timestamp'.
 * @param {String|Array.<String>} timestamp In ISO format. If single timestamp,
 *     get links before or after that timestamp depending on the sort parameter.
 *     If timestamp.length == 2, get links within the timestamp range.
 * @param {?String} next Used for cursoring.
 * @return {lib.promise.deferred.Deferred.<Array>} A list of '/type/link's.
 * @throw {Error} If unknown provenance_type.
 */
function get_links_by_provenance(
    provenance_id, provenance_type, pids, historical, sort, timestamp, next) {
  return get_valid_provenance_type(provenance_id, provenance_type)
    .then(function(provenance_type) {
      var provenance = {};
      if (provenance_type == '/freebase/apps/acre_app') {
        provenance['/freebase/written_by/application'] = {id: provenance_id};
      }
      else if (provenance_type == '/dataworld/software_tool') {
        provenance['/dataworld/provenance/tool'] = {id: provenance_id};
      }
      else if (provenance_type == '/dataworld/mass_data_operation') {
        provenance['/dataworld/provenance/data_operation'] = {id: provenance_id};
      }
      else if (provenance_type == '/dataworld/information_source') {
        provenance['/dataworld/provenance/source'] = {id: provenance_id};
      }
      else {
        return deferred.Error('Invalid provenance: ' + provenance_id);
      }
      return get_links_(
          null, pids, null, provenance, historical, sort, timestamp, next);
    });
}

/**
 * Valid provenance types.
 */
var VALID_PROVENANCE_TYPES = [
  '/freebase/apps/acre_app',
  '/dataworld/software_tool',
  '/dataworld/mass_data_operation',
  '/dataworld/information_source'
];
function is_valid_provenance_type(provenance_type) {
  return VALID_PROVENANCE_TYPES.indexOf(provenance_type) != -1;
};

/**
 * A promise to get a valid provenance type for a given provenance_id.
 * If the specified provenance_type is valid, just return the provenance_type.
 * Otherwise, this will do a query to find the first valid provenance_type
 * of provenance_id.
 *
 * @param {String} provance_id The provenance id.
 * @param {?String} provenance_type If specified and valid, it will return this
 *     provenance_type.
 * @return {lib.promise.deferred.Deferred.<?String>} NULL if a valid provenance
 *     type is not found. Otherwise return the provenance type id.
 */
function get_valid_provenance_type(provenance_id, provenance_type) {
  if (is_valid_provenance_type(provenance_type)) {
    return deferred.resolved(provenance_type);
  }
  var q = {
    id: provenance_id,
    type: {
      id: null,
      'id|=': VALID_PROVENANCE_TYPES,
      limit: 1,
      optional: true
    }
  };
  return freebase.mqlread(q)
    .then(function(env) {
      if (env.result.type) {
        return env.result.type.id;
      }
      return null;
    });
};


/**
 * @param {?String} linked_id The source or target id.
 * @param {?Array.<string>} pids The property ids to filter where each can
 *     be either link.master_property or link.master_property.reverse property.
 * @param {?String} creator The link.creator.
 * @param {?Object} provenance The link.attribution provenance constraint.
 *     @see get_links_by_provenance.
 * @param {Boolean} historical If TRUE, get "invalid" links as well.
 * @param {?String} sort Sort link 'timestamp' or '-timetamp'.
 *     Default is '-timestamp'.
 * @param {String|Array.<String>} timestamp In ISO format. If single timestamp,
 *     get links before or after that timestamp depending on the sort parameter.
 *     If timestamp.length == 2, get links within the timestamp range.
 * @param {?String} next Used for cursoring.
 * @return {lib.promise.deferred.Deferred.<Array>} A list of '/type/link's.
 * @private
 */
function get_links_(
    linked_id, pids, creator, provenance, historical, sort, timestamp ,next) {
  var d = null;
  if (pids && !h.isArray(pids)) {
    pids = [pids];
  }
  if (pids && pids.length) {
    d = get_properties_(pids)
      .then(function(props) {
          if (!props.length) {
            return deferred.resolved({});
          }
          var outgoing_ids = [];
          var incoming_ids = [];
          var reverse_ids = [];
          props.forEach(function(p) {
            if (p.master_property) {
              reverse_ids.push(p.id);
            }
            else {
              outgoing_ids.push(p.id);
              if (!p.reverse_property) {
                incoming_ids.push(p.id);
              }
            }
          });
          var promises = {};
          if (outgoing_ids.length) {
            promises.outgoing = get_outgoing_links_(
                linked_id, outgoing_ids, creator, provenance,
                historical, sort, timestamp, next);
          }
          if (incoming_ids.length) {
            promises.incoming = get_incoming_links_(
                linked_id, incoming_ids, creator, provenance,
                historical, sort, timestamp, next);
          }
          if (reverse_ids.length) {
            promises.reverse =
                get_reverse_links_(
                  linked_id, reverse_ids, creator, provenance,
                  historical, sort, timestamp, next);
          }
          return deferred.all(promises);
      });
  }
  else {
    d = deferred.all({
      outgoing: get_outgoing_links_(
          linked_id, null, creator, provenance,
          historical, sort, timestamp, next),
      incoming: get_incoming_links_(
          linked_id, null, creator, provenance,
          historical, sort, timestamp, next),
      reverse: get_reverse_links_(
          linked_id, null, creator, provenance,
          historical, sort, timestamp, next)
    });
  }
  return d
    .then(function(r) {
      var all = [];
      ['outgoing', 'incoming', 'reverse'].forEach(function(k) {
        if (r[k]) {
          all = all.concat(r[k]);
        }
      });
      var asc = sort === 'timestamp';
      all.sort(function(a, b) {
        if (asc) {
          return b.timestamp < a.timestamp;
        }
        else {
          return b.timestamp > a.timestamp;
        }
      });
      return remove_duplicate_links_(all).slice(0, 100);
    });
}

/**
 * Remove duplicate '/type/link's.
 * For now, links are considered duplicates if they have the same timestamp.
 * @param {Array.<Object>} links An array of /type/link objects.
 * @private
 */
function remove_duplicate_links_(links) {
  var seen = {};
  return links.filter(function(link) {
    if (seen[link.timestamp]) {
      return false;
    }
    seen[link.timestamp] = 1;
    return true;
  });
}

/**
 * A simple property query to determine the specified property ids are
 * "master" or "reverse" properties.
 * @private
 */
function get_properties_(pids) {
  if (!(pids && pids.length)) {
    return deferred.resolved([]);
  }
  return freebase.mqlread([{
    id: null,
    'id|=': pids,
    type: '/type/property',
    master_property: null,
    reverse_property: null,
    optional: true
  }])
  .then(function(env) {
    return env.result;
  });
}

/**
 * @private
 */
function get_outgoing_links_(
    source_id, master_pids, creator, provenance,
    historical, sort, timestamp, next) {
  var q = [{
    type: '/type/link',
    master_property: {
      id: null
    },
    target_value: {},
    target: get_object_clause_(true),
    timestamp: null,
    optional: true
  }];
  if (source_id) {
    q[0]['me:source'] = {
      id: source_id
    };
  } else {
    q[0]['source'] = get_object_clause_();
  }
  apply_filter_(q[0], master_pids, creator, provenance,
                historical, sort, timestamp, next);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
}

/**
 * @private
 */
function get_incoming_links_(
    target_id, master_pids, creator, provenance,
    historical, sort, timestamp, next) {
  var q = [{
    type: '/type/link',
    source: get_object_clause_(),
    master_property: {
      id: null,
      reverse_property: {
        id: null,
        optional: "forbidden"
      }
    },
    target_value: {},
    timestamp: null,
    optional: true
  }];
  if (target_id) {
    q[0]['me:target'] = {
      id: target_id
    };
  }
  else {
    q[0]['target'] = get_object_clause_();
  }
  apply_filter_(q[0], master_pids, creator, provenance,
                historical, sort, timestamp, next);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
}

/**
 * @private
 */
function get_reverse_links_(
    target_id, reverse_pids, creator, provenance,
    historical, sort, timestamp, next) {
  var q = [{
    type: '/type/link',
    source: get_object_clause_(),
    master_property: {
      id: null,
      reverse_property: {
        id: null
      }
    },
    target_value: {},
    timestamp: null,
    optional: true
  }];
  if (target_id) {
    q[0]['me:target'] = {
      id: target_id
    };
  }
  else {
    q[0]['target'] = get_object_clause_();
  }
  apply_filter_(q[0], null, creator, provenance,
                historical, sort, timestamp, next);
  apply_reverse_property_(q[0], reverse_pids);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
}

/**
 * @private
 */
function apply_filter_(
    query, master_pids, creator, provenance,
    historical, sort, timestamp, next) {
  // filter master_property
  apply_master_property_(query, master_pids);

  // standard creator/attribution query
  creator_q.extend(query);

  // filter creator
  if (creator) {
    acre.freebase.extend_query(query, {
      'filter:creator': {id: creator, limit:0}
    });
  }

  if (provenance) {
    acre.freebase.extend_query(query, {
      'filter:attribution': provenance
    });
  }

  // historical
  if (historical) {
    acre.freebase.extend_query(query, {
      valid: null,
      operation: null
    });
  }
  else {
    acre.freebase.extend_query(query, {
      valid: true,
      operation: null
    });
  }

  // sort
  acre.freebase.extend_query(query, {
    sort: sort === 'timestamp' ? 'timestamp' : '-timestamp'
  });

  // timestamp
  if (timestamp) {
    if (!h.isArray(timestamp)) {
      timestamp = [timestamp];
    }
    var len = timestamp.length;
    if (len === 1) {
      // 2010-09-25T18:42:24.0007Z
      if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z/.test(timestamp[0])) {
        // if full timestamp, look for that link with exact timestamp
        acre.freebase.extend_query(query, {
          'filter:timestamp': timestamp[0]
        });
       }
      else {
        // otherwise get everything earlier than this timestamp
        acre.freebase.extend_query(query, {
          'filter:timestamp>=': timestamp[0]
        });
      }
    }
    else if (len === 2) {
      timestamp.sort(function(a, b) {
        return b < a;
      });
      acre.freebase.extend_query(query, {
        'filter:timestamp>=': timestamp[0],
        'filter:timestamp<': timestamp[1]
      });
    }
  }

  // next
  if (next) {
    if (sort === 'timestamp') {
      acre.freebase.extend_query(query, {
         'next:timestamp>': next
      });
    }
    else {
      acre.freebase.extend_query(query, {
         'next:timestamp<': next
      });
    }
  }

  return query;
}

/**
 * @private
 */
function apply_master_property_(query, master_pids) {
  if (master_pids && master_pids.length) {
    acre.freebase.extend_query(query, {
      'filter_master:master_property': {
        'id|=': master_pids,
        limit: 0
      }
    });
  }
  return query;
}

/**
 * @private
 */
function apply_reverse_property_(query, reverse_pids) {
  if (reverse_pids && reverse_pids.length) {
    acre.freebase.extend_query(query, {
      'filter_reverse:master_property': {
        reverse_property: {
          'id|=': reverse_pids
        },
        limit: 0
      }
    });
  }
  return query;
}

/**
 * The standard object clause to ask for id, mid, name and whether or
 * not the object is a /common/topic or mediatr (CVT).
 * @private
 */
function get_object_clause_(optional) {
  var clause = {
    id: null,
    mid: null,
    name: i18n.mql.query.name(),
    'topic:type': {
      id:'/common/topic',
      optional:true
    },
    'cvt:type': {
      id: null,
      '/freebase/type_hints/mediator': true,
      optional: true,
      limit: 1
    }
  };
  if (optional) {
    clause.optional = true;
  }
  return clause;
}


function get_key_link(namespace_id, object_id, value, lang) {
  var q = {
    type: '/type/link',
    master_property: {
      id: '/type/namespace/keys'
    },
    source: {
      id: namespace_id,
      mid: null
    },
    target_value: {
      value: value
    },
    target: {
      id: object_id,
      mid: null
    },
    timestamp: null,
    valid: true,
    optional: true
  };
  // standard creator/attribution query
  creator_q.extend(q);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
}
