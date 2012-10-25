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
var i18n = acre.require("i18n/i18n.sjs");
var h = acre.require("helper/helpers.sjs");
var apis = acre.require("promise/apis.sjs");
var deferred = apis.deferred;
var freebase = apis.freebase;
var fh = acre.require("filter/helpers.sjs");
var proploader = acre.require("schema/proploader.sjs");
var creator = acre.require("queries/creator.sjs");
var validators = acre.require("validator/validators.sjs");
var filter_validators = acre.require("filter/validators.sjs");

/**
 * Common filters used for links queries.
 */
var links_filters = {
  timestamp: {
    validator: validators.MultiValue,
    options: {validator: filter_validators.Timestamp, if_empty:null}
  },
  as_of_time: {
    validator: validators.Datejs,
    options: {if_invalid:null}
  },
  creator: {
    validator: validators.MultiValue,
    options: {validator: validators.MqlId, if_empty:null}
  },
  historical: {
    validator: validators.StringBool,
    options: {if_empty:true}
  },
  sort: {
    validator: validators.OneOf,
    options: {oneof: ['timestamp', '-timestamp'], if_empty:'-timestamp'}
  },
  slot: {
    validator: validators.OneOf,
    options: {oneof: ['source', 'target'], if_empty:null, if_invalid:null}
  }
};


function links(id, filters, next) {  
  return creator.by(filters.creator, "/type/user")
    .then(function(creator_clause) {
      var promises = {
        objects:  links_objects(id, filters, next, creator_clause)
      };
      if (filters.slot === 'source') {
        promises.outgoing = links_outgoing(id, filters, next, creator_clause);
      }
      else if (filters.slot === 'target') {
        promises.incoming = links_incoming(id, filters, next, creator_clause);
      }
      else {
        promises.outgoing = links_outgoing(id, filters, next, creator_clause);
        promises.incoming = links_incoming(id, filters, next, creator_clause);
      }
      return deferred.all(promises)
        .then(function(result) {
          return links_sort(result.incoming || [],
                            result.outgoing || [],
                            result.objects || [],
                            filters);
        });
    });
};

function writes(id, object_type, filters, next) {
  return creator.by(id, object_type)
    .then(function(creator_clause) {
      var promises = {
        links: links_writes(filters, next, creator_clause),
        objects: links_objects(null, filters, next, creator_clause)
      };
      return deferred.all(promises)
        .then(function(result) {
          return links_sort(result.links, result.objects, filters);
        });
    });
}

function property_links(id, filters, next) {
  return creator.by(filters.creator, "/type/user")
    .then(function(creator_clause) {
      if ((id === "/type/object/attribution") ||
          (id === "/type/attribution/attributed")) {
        return links_objects(null, filters, next, creator_clause);
      }
      else {
        return links_property(id, filters, next, creator_clause);
      }
    });
};

function links_sort(/* array1, array2,..., filters */) {
  var args = Array.prototype.slice.call(arguments);
  var filters = h.isPlainObject(args[args.length - 1]) ? args.pop() : {};
  var all = [];
  var asc = filters.sort === 'timestamp';
  args.forEach(function(arg) {
    all = all.concat(arg);
  });
  all.sort(function(a, b) {
    if (asc) {
      return b.timestamp < a.timestamp;
    }
    else {
      return b.timestamp > a.timestamp;        
    }
  });
  return all.slice(0, filters.limit || 100);
};

/**
 * Get all outgoing links from source
 */
function links_outgoing(source, filters, next, creator_clause) {
    filters = h.extend({}, filters);
    var promises = {
        links_outgoing_master: links_outgoing_master(source, filters, next, creator_clause),
        links_outgoing_reverse: links_outgoing_reverse(source, filters, next, creator_clause)
    };
    return deferred.all(promises)
        .then(function(r) {
            var outgoing = r.links_outgoing_master || [];
            if (r.links_outgoing_reverse && r.links_outgoing_reverse.length) {
                outgoing = outgoing.concat(r.links_outgoing_reverse);
            }
            return outgoing;
        });
};

/**
 * All outgoing links from source without a reverse_property
 */
function links_outgoing_master(source, filters, next, creator_clause) {
    var q = h.extend(links_outgoing_query(source, filters.sort), creator_clause);
    q.master_property.reverse_property = {
        id: null,
        optional: "forbidden"
    };
    if (next) {
        if (filters.sort === 'timestamp') {
            q['next:timestamp>'] = next;
        }
        else {
            q['next:timestamp<'] = next;            
        }
    }
    apply_filters(q, filters);
    return freebase.mqlread([q], mqlread_options(filters))
        .then(function(env) {
            return env.result;
        });    
};

/**
 * All outgoing links from source with a reverse_property.
 */
function links_outgoing_reverse(source, filters, next, creator_clause) {
    var promises = {
        outgoing: _links_outgoing_reverse(source, filters, next, creator_clause, false)
    };
    // If we're filtering, we try filtering on the reverse_property as well.
    // For example, /music/artist/album and /music/album/artist 
    // are the same property/link. When type=/music/artist or type=/music/album,
    // this property/link should be found.
    if (filters.domain || filters.type || filters.property) {
        promises.filter = _links_outgoing_reverse(source, filters, next, creator_clause, true);
    }
    return deferred.all(promises)
        .then(function(r) {
            var outgoing = r.outgoing || [];
            if (r.filter && r.filter.length) {
                outgoing = outgoing.concat(r.filter);
                outgoing = remove_duplicate_links(outgoing);
            }
            return outgoing;
        });
};

function _links_outgoing_reverse(source, filters, next, creator_clause, filter_reverse_property) {
    var q = h.extend(links_outgoing_query(source, filters.sort), creator_clause);
    q.master_property.reverse_property = {
        id: null
    };
    if (filter_reverse_property) {
//        q.master_property["filter:reverse_property"] = null;
    }
    if (next) {
        if (filters.sort === 'timestamp') {
            q['next:timestamp>'] = next;
        }
        else {
            q['next:timestamp<'] = next;            
        }
    }
    apply_filters(q, filters);
    return freebase.mqlread([q], mqlread_options(filters))
        .then(function(env) {
            return env.result;
        });    
};

/**
 * A standard /type/link query with source. You can always tell an outgoing
 * link by checking "me:source" in the results.
 */
function links_outgoing_query(source, sort) {
    return {
        type: "/type/link",
        master_property: {
            id: null,
            unit: {
                optional: true,
                id: null,
                type: "/type/unit",
                "/freebase/unit_profile/abbreviation": null
            }
        },
        "me:source": {id: source},
        target: {id:null, mid:null, guid:null, name:i18n.mql.query.name(), optional:true},
        target_value: {},
        timestamp: null,
        sort: sort === 'timestamp' ? 'timestamp' : '-timestamp',
        optional: true
    };
};


/**
 * Get all incoming links to target.
 */
function links_incoming(target, filters, next, creator_clause) {
    filters = h.extend({}, filters);
    var promises = {
        links_incoming_master: links_incoming_master(target, filters, next, creator_clause),
        links_incoming_reverse: links_incoming_reverse(target, filters, next, creator_clause)
    };
    return deferred.all(promises)
        .then(function(r) {
            var incoming = r.links_incoming_master || [];
            if (r.links_incoming_reverse && r.links_incoming_reverse.length) {
                incoming = incoming.concat(r.links_incoming_reverse);
            }
            return incoming;
        });
};


/**
 * Get all incoming links to target without a reverse_property.
 * (e.g., !/some/property/without/reverse)
 */ 
function links_incoming_master(target, filters, next, creator_clause, extend_clause) {
    var q = h.extend(links_incoming_query(target, filters.sort), creator_clause);
    q.master_property.reverse_property = {
        id: null,
        optional: "forbidden"
    };
    if (next) {
        if (filters.sort === 'timestamp') {
            q['next:timestamp>'] = next;
        }
        else {
            q['next:timestamp<'] = next;            
        }
    }
    apply_filters(q, filters);
    return freebase.mqlread([q], mqlread_options(filters))
        .then(function(env) {
            return env.result;
        });
}

/**
 * Get all incoming links to target with a reverse_property.
 */
function links_incoming_reverse(target, filters, next, creator_clause, extend_clause) {
    var promises = {
        incoming: _links_incoming_reverse(target, filters, next, creator_clause, false)
    };
    // If we're filtering, we try filtering on the reverse_property as well.
    // For example, /music/artist/album and /music/album/artist 
    // are the same property/link. When type=/music/artist or type=/music/album,
    // this property/link should be found.
    if (filters.domain || filters.type || filters.property) {
        promises.filter = _links_incoming_reverse(target, filters, next, creator_clause, true);
    }
    return deferred.all(promises)
        .then(function(r) {
            var incoming = r.incoming || [];
            if (r.filter && r.filter.length) {
                incoming = incoming.concat(r.filter);
                incoming = remove_duplicate_links(incoming);
            }
            return incoming;
        });
};

function _links_incoming_reverse(target, filters, next, creator_clause, filter_reverse_property) {
    var q = h.extend(links_incoming_query(target, filters.sort), creator_clause);
    q.master_property.reverse_property = {
        id: null
    };
    if (filter_reverse_property) {
        q.master_property["filter:reverse_property"] = null;
    }
    if (next) {
        if (filters.sort === 'timestamp') {
            q['next:timestamp>'] = next;
        }
        else {
            q['next:timestamp<'] = next;            
        }
    }
    apply_filters(q, filters);
    return freebase.mqlread([q], mqlread_options(filters))
        .then(function(env) {
            return env.result;
        });    
};

/**
 * A standard /type/link query with target. You can always tell an incoming
 * link by checking "me:target" in the results.
 */
function links_incoming_query(target, sort) {
    return {
        type: "/type/link",
        master_property: {
            id: null
        },
        source: {id:null, mid:null, guid:null, name:i18n.mql.query.name()},
        "me:target": {id:target, guid:null},
        target_value: {},
        timestamp: null,
        sort: sort === 'timestamp' ? 'timestamp' : '-timestamp',
        optional: true
    };
};


function remove_duplicate_links(list) {
    var seen = {};
    return list.filter(function(item) {
        if (seen[item.timestamp]) {
            return false;
        }
        else {
            seen[item.timestamp] = true;
            return true;
        }
    });
};

/**
 * A helper to determine what property/id to display.
 * For outgoing properties, we always want to display to master_property.
 * For incoming properties we want to try to display the reverse_property 
 * since it's always more relevant. For example, for /en/blade_runner,
 * you want to display /film/film/starring and not the master_property, 
 * /film/performance/film. If a reverse_property is not found,
 * then we want to prepend it with "!" (i.e., !/people/person/nationality).
 */
function property_info(link) {
    var info = {};
    var incoming = link["me:target"];
    var outgoing = link["me:source"];
    
    if (incoming) {
        if (link.master_property.reverse_property) {
            return {
                id: link.master_property.reverse_property.id,
                label: link.master_property.reverse_property.id,
                reverse_property: true
            };
        }
        else {
            return {
                id: link.master_property.id,
                label: "!" + link.master_property.id,
                "!": true,
                reverse_property: false
            };
        }
    }
    else {
        return {
            id: link.master_property.id,
            label: link.master_property.id,
            reverse_property: false
        };
    }
};


/**
 *  Synthesize /type/object/attribution links
 *  for object creation events
 */
function links_objects(id, filters, next, creator_clause) {
    filters = h.extend({}, filters);

    // special-case filters since this isn't a /type/link query
    if ((filters.domain && filters.domain !== "/type") ||
        (filters.type && filters.type !== "/type/object") || 
        (filters.property && filters.property !== "/type/object/attribution")) {
      return deferred.resolved([]);
    }

    var q = h.extend({
      id: id,
      mid: null,
      guid: null,
      name: i18n.mql.query.name(),
      "the:attribution": {id:null, mid:null, guid:null, name:i18n.mql.query.name()},
      timestamp: null,
      sort: filters.sort === 'timestamp' ? 'timestamp' : '-timestamp'
    }, creator_clause);
    if (next) {
        if (filters.sort === 'timestamp') {
            q['next:timestamp>'] = next;
        }
        else {
            q['next:timestamp<'] = next;            
        }
    }

    apply_limit(q, filters.limit);
    apply_timestamp(q, filters.timestamp, filters.sort);

    return freebase.mqlread([q], mqlread_options(filters))
      .then(function(env) {
        return env.result;
      })
      .then(function(objects) {
        return objects.map(function(object) {
          // make each object look like a link
          object.master_property = {
            id: "/type/object/attribution",
            unit: null
          };
          object.source = object["me:source"] = {
            id: object.id,
            mid: object.mid,
            guid: object.guid,
            name: object.name
          };
          object.target = object["the:attribution"];
          return object;
        });
      });
}

function links_writes(filters, next, creator_clause) {
  filters = h.extend({}, filters);
  var q = h.extend({
    type: "/type/link",
    source: {
      optional: true,
      id: null,
      mid: null,
      guid: null,
      name: i18n.mql.query.name()
    },
    target: {
      optional: true,
      id: null,
      mid: null,
      name: i18n.mql.query.name()
    },
    master_property: {
      id: null,
      unit: {
        optional: true,
        id: null,
        type: "/type/unit",
        "/freebase/unit_profile/abbreviation": null
      }
    },
    target_value: {},
    timestamp: null,
    sort: filters.sort === 'timestamp' ? 'timestamp' : '-timestamp',
    optional: true
  }, creator_clause);
  if (next) {
      if (filters.sort === 'timestamp') {
          q['next:timestamp>'] = next;
      }
      else {
          q['next:timestamp<'] = next;            
      }
  }
  apply_filters(q, filters);
  return freebase.mqlread([q], mqlread_options(filters))
    .then(function(env) {
      return env.result;
    }, function() {
      return [];
    });
};

function links_property(id, filters, next, creator_clause) {
  filters = h.extend({}, filters);
  return proploader.load(id)
    .then(function(prop) {
      var master_prop = id;
      if (prop.master_property) {
        master_prop = prop.master_property.id;
      }
      var q = h.extend({
        type: "/type/link",
        master_property: {
          id: master_prop,
          unit: {
            optional: true,
            id: null,
            type: "/type/unit",
            "/freebase/unit_profile/abbreviation": null
          }
        },
        source: {id:null, mid:null, guid:null, name:i18n.mql.query.name(), optional:true},
        target: {id:null, mid:null, name:i18n.mql.query.name(), optional:true},
        target_value: {},
        timestamp: null,
        sort: filters.sort === 'timestamp' ? 'timestamp' : '-timestamp'
      }, creator_clause);
      if (next) {
        if (filters.sort === 'timestamp') {
            q['next:timestamp>'] = next;
        }
        else {
            q['next:timestamp<'] = next;            
        }
      }
      apply_limit(q, filters.limit);
      apply_timestamp(q, filters.timestamp, filters.sort);
      apply_historical(q, filters.historical);
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
  apply_timestamp(clause, filters.timestamp, filters.sort);
  apply_historical(clause, filters.historical);
  apply_domain_type_property(clause, filters.domain, filters.type, filters.property);
};

function apply_limit(clause, limit) {
  clause.limit = (typeof limit === "number") ? limit : 100;
  return clause;
};

function apply_timestamp(clause, timestamp, sort) {
  if (timestamp) {
    if (!h.isArray(timestamp)) {
      timestamp = [timestamp];
    }
    var len = timestamp.length;
    if (len === 1) {
      // 2010-09-25T18:42:24.0007Z
      if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z/.test(timestamp[0])) {
        // if full timestamp, look for that link with exact timestamp
        clause["filter:timestamp"] = fh.timestamp(timestamp[0]);
      }
      else {
        // otherwise get everything earlier than this timestamp
        clause["filter:timestamp>="] = fh.timestamp(timestamp[0]);
      }
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
    clause = clause || {};
    var filter_clause = null;
    if (domain) {
        filter_clause = {
            schema: {
                domain: domain
            }
        };
    }
    else if (type) {
        filter_clause = {
            schema: type
        };
    }
    else if (property) {
        filter_clause = property;
    }
    if (filter_clause) {
        if (clause.master_property && 
            h.type(clause.master_property) === "object" &&
            "filter:reverse_property" in clause.master_property) {
            clause.master_property["filter:reverse_property"] = filter_clause;
        }
        else {
            clause["filter:master_property"] = filter_clause;
        }
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
