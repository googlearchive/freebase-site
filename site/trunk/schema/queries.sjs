var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var schema_helpers = mf.require("helpers");
var mql = mf.require("mql");

var queries_blob = mf.require("queries", "blob");
var queries_helpers = mf.require("queries", "helpers");
var queries_type = mf.require("queries", "type");

var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var urlfetch = mf.require("promise", "apis").urlfetch;

/**
 * get and attach blurb/blob to a mql result that has a "/common/topic/article" key
 *
 * @param o:Object (required) - A mql result that has a "/common/topic/article" key
 * @param mode:String (optional) - "blurb" will get blurb and "blob" will get blob with maxlength 1000. Default is "blurb".
 * @param options:Object (optional) - Params to pass to acre.freebase.get_blob
 * @param label:String (optional) - The key to use to attach the blurb/blob content to o. Default is mode.
 */
function add_description(o, mode, options, label) {
  mode = mode || "blurb";
  label = label || mode;
  options = options || {};
  if (!o['/common/topic/article'] || o['/common/topic/article'].length === 0) {
    o[label] = "";
    return o;
  }
  if (mode === "blob") {
    if (! ("maxlength" in options)) {
      options.maxlength = 1000;
    }
  }
  return queries_blob.get_blurb(o['/common/topic/article'][0].id, options)
    .then(function(blob) {
      o[label] = blob;
      return o;
    }, function(error) {
      o[label] = "";
      return o;
    });
};

/**
 * Get all "commons" domains. Domains with a key in "/".
 */
function common_domains() {
  return domains(mql.domains());
};

/**
 * Get all domains created by user_id.
 */
function user_domains(user_id) {
  return domains(mql.domains({optional: true, creator: user_id, key: []}));
};

/**
 * Do domains query and for each domain, get instance counts (activity bdb).
 */
function domains(q) {
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result || [];
    })
    .then(function(domains) {
      var promises = [];
      // instance counts for each domain
      domains.forEach(function(domain) {
        var activity_id = "summary_/guid/" + domain.guid.slice(1);
        promises.push(freebase.get_static("activity", activity_id)
          .then(function(activity) {
            return activity || {};
          })
          .then(function(activity) {
            if (activity.total) {
              domain.instance_count = activity.total.t || 0;
            }
            return activity;
          }));
        return deferred.all(promises)
          .then(function() {
            return domain;
          });
      });
      return domains.sort(schema_helpers.sort_by_name);
    });
};

/**
 * minimal domain query to get the name, key(s), and article
 */
function minimal_domain(id) {
  var q = {
    id: id,
    name: null,
    type: "/type/domain",
    key: [{value: null, namespace: null}],
    "/common/topic/article": queries_helpers.article_clause(true)
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(domain) {
      return add_description(domain, "blob", null, "blob");
    });
};


/**
 * Domain query and for each type in the domain:
 * 1. get type descriptions
 * 2. get type instance counts
 */
function domain(id) {
  var q = mql.domain({id:id});
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result || {};
    })
    .then(function(domain) {
      return add_description(domain, "blurb", null, "blurb");
    })
    .then(function(domain) {
      return add_description(domain, "blob", null, "blob");
    })
    .then(function(domain) {
      // readable timestamp
      domain.date = h.format_date(acre.freebase.date_from_iso(domain.timestamp), 'MMMM dd, yyyy');

      var promises = [];

      // categorize types by their roles (mediator, cvt, etc.)
      var types = [];
      var mediators = [];
      var cvts = [];
      domain.types.forEach(function(type) {
        promises.push(add_description(type));
        type.instance_count = 0;
        var role = queries_helpers.get_type_role(type, true);
        if (role === "mediator") {
          mediators.push(type);
        }
        else if (role === "cvt") {
          cvts.push(type);
        }
        else {
          types.push(type);
        }
      });
      types.sort(schema_helpers.sort_by_name);
      mediators.sort(schema_helpers.sort_by_name);
      cvts.sort(schema_helpers.sort_by_name);

      domain.types = types;
      domain["mediator:types"] = mediators;
      domain["cvt:types"] = cvts;

      // domain activity, instance counts per type
      var activity_id = "summary_/guid/" + domain.guid.slice(1);
      promises.push(freebase.get_static("activity", activity_id)
        .then(function(activity) {
          return activity || {};
        })
        .then(function(activity) {
          if (activity.types) {
            types.forEach(function(type) {
              type.instance_count = activity.types[type.id] || 0;
            });
          }
          return activity;
        }));
      return deferred.all(promises)
        .then(function() {
          return domain;
        });
    });
};

/**
 * Get minimal type info (blurb, mediator, enumeration, #properties, instance_count).
 * If you want full type info, use base_type or type queries.
 */
function minimal_type(type_id) {
  var q = {
    id: type_id,
    guid: null,
    name: null,
    type: "/type/type",
    key: [{namespace: null, value: null}],
    domain: {id: null, name: null, type: "/type/domain"},
    "/common/topic/article": queries_helpers.article_clause(true),
    "/freebase/type_hints/role": {optional: true, id: null},
    "/freebase/type_hints/mediator": null,
    "/freebase/type_hints/enumeration": null,
    properties: {optional: true, id: null, type: "/type/property", "return": "count"}
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(type) {
      queries_helpers.get_type_role(type, true);
      var promises = [];
      // description
      promises.push(add_description(type, "blurb", null, "blurb"));
      promises.push(add_description(type, "blob", null, "blob"));
      // domain activity, instance counts per type
      type.instance_count = 0;
      var activity_id = "summary_/guid/" + type.guid.slice(1);
      promises.push(freebase.get_static("activity", activity_id)
        .then(function(activity) {
          return activity || {};
        })
        .then(function(activity) {
          if (activity.properties) {
            // /type/object/type is the total instances of this type
            type.instance_count = activity.properties["/type/object/type"] || 0;
          }
          return activity;
        }));
      return deferred.all(promises)
        .then(function() {
          return type;
        });
    });
};

function type_role(type_id) {
  var q = {
    id: type_id,
    type: "/type/type",
    "/freebase/type_hints/role": {optional: true, id: null},
    "/freebase/type_hints/mediator": null,
    "/freebase/type_hints/enumeration": null
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return queries_helpers.get_type_role(env.result || {});
    });
};


function normalize_prop(prop) {
  prop.tip = prop["/freebase/documented_object/tip"] || "";
  prop.disambiguator = prop["/freebase/property_hints/disambiguator"] === true;
  prop.display_none = prop["/freebase/property_hints/display_none"] === true;
  if (prop.expected_type && typeof prop.expected_type === "object") {
    queries_helpers.get_type_role(prop.expected_type, true);
  }
  return prop;
};
function normalize_props(props) {
  props.forEach(function(p) {
    normalize_prop(p);
  });
  return props;
};
/**
 * Base type query:
 * 1. description (blurb and blob)
 * 2. get type instance count
 * 3. get "sibiling" types (types that are in the same domain)
 */
function base_type(id) {
  var q = mql.type({id:id});
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result || {};
    })
    .then(function(result) {
      return add_description(result, "blurb");
    })
    .then(function(result) {
      return add_description(result, "blob");
    })
    .then(function(result) {
      // readable timestamp
      result.date = h.format_date(acre.freebase.date_from_iso(result.timestamp), 'MMMM dd, yyyy');
      // type role
      queries_helpers.get_type_role(result, true);
      // included_types
      result.included_types = result["/freebase/type_hints/included_types"] || [];
      // properties
      normalize_props(result.properties);

      var promises = [];

      // instance_count
      var activity_id = "summary_/guid/" + result.guid.slice(1);
      result.instance_count = 0;
      promises.push(freebase.get_static("activity", activity_id)
        .then(function(activity) {
          return activity || {};
        })
        .then(function(activity) {
          if (activity.properties) {
            // /type/object/type is the total instances of this type
            result.instance_count = activity.properties["/type/object/type"] || 0;
          }
          return activity;
        }));

      // sibling types (in the same domain excluding this type)
      var siblings_q = [{
        optional: true,
        id: null,
        "id!=": id,
        name: null,
        type: "/type/type",
        domain: result.domain.id,
        "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
      }];
      promises.push(freebase.mqlread(siblings_q)
        .then(function(env) {
          return env.result || [];
        })
        .then(function(siblings) {
          result.domain.types = siblings;
          return siblings.sort(schema_helpers.sort_by_name);
        }));

      return deferred.all(promises)
        .then(function() {
          return result;
        });
    });
};

function type(id) {
  return base_type(id)
    .then(function(result) {
      result.incoming = {
        domain: [],
        commons: 0,
        bases: 0
      };
      var promises = [];
      promises.push(incoming_from_domain(id, result.domain.id)
        .then(function(props) {
          result.incoming.domain = props || [];
        }));
      promises.push(incoming_from_commons(id, result.domain.id, true)
        .then(function(props) {
          result.incoming.commons = props || 0;
        }));
      promises.push(incoming_from_bases(id, result.domain.id, true)
        .then(function(props) {
          result.incoming.bases = props || 0;
        }));

      if (result.role === "enumeration") {
        promises.push(freebase.mqlread([{
          id: null,
          name: null,
          type: id,
          "/common/topic/article": queries_helpers.article_clause(true),
          optional: true,
          limit: 11
        }])
        .then(function(env) {
          console.log("instances", env.result);
          result.instance = env.result.sort(schema_helpers.sort_by_name);
          var blurbs = [];
          result.instance.forEach(function(topic) {
            blurbs.push(add_description(topic, "blurb", null, "blurb"));
          });
          return deferred.all(blurbs)
            .then(function() {
              return result.instance;
            });
        }));
      }
      return deferred.all(promises)
        .then(function() {
          return result;
        });
    });
};

function typediagram(id) {
  return base_type(id)
    .then(function(result) {
      result.incoming = {
        domain: [],
        commons: [],
        bases: []
      };
      var promises = [];
      promises.push(incoming_from_domain(id, result.domain.id)
        .then(function(props) {
          result.incoming.domain = props || [];
        }));
      promises.push(incoming_from_commons(id, result.domain.id)
        .then(function(props) {
          result.incoming.commons = props || [];
        }));
      promises.push(incoming_from_bases(id, result.domain.id)
        .then(function(props) {
          result.incoming.bases = props || [];
        }));

      return deferred.all(promises)
        .then(function() {
          return result;
        });
    });
};

/**
 * Get all properties of a type
 */
function type_properties(id) {
  var q = {
    id: id,
    name: null,
    type: "/type/type",
    properties: [mql.property({optional: true, index: null, sort: "index"})]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(type) {
      normalize_props(type.properties);
      return type;
    });
};



/**
 * Minimal topic query to get name and description
 */
function minimal_topic(id, get_blurb, get_blob) {
  var q = {
    id: id,
    name: null
  };
  if (get_blurb || get_blob) {
    q["/common/topic/article"] = queries_helpers.article_clause(true);
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(topic) {
      if (get_blurb) {
        return add_description(topic, "blurb", null, "blurb");
      }
      return topic;
    })
    .then(function(topic) {
      if (get_blob) {
        return add_description(topic, "blob", null, "blob");
      }
      return topic;
    });
};


/**
 * Full fledged property query
 */
function property(id) {
  var q = mql.property({
    id: id,
    creator: queries_helpers.user_clause(),
    timestamp:null,
    schema: {
      id: null,
      guid: null,
      name: null,
      type: "/type/type",
      domain: {id: null, name: null, type: "/type/domain"}
    }
  });
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(result) {
      // readable timestamp
      result.date = h.format_date(acre.freebase.date_from_iso(result.timestamp), 'MMMM dd, yyyy');

      normalize_prop(result);

      var promises = [];
      // sibling props (in the same schema excluding this prop)
      var siblings_q = [{
        optional: true,
        id: null,
        "id!=": id,
        name: null,
        type: "/type/property",
        schema: result.schema.id
      }];

      promises.push(freebase.mqlread(siblings_q)
        .then(function(env) {
          return env.result || [];
        })
        .then(function(props) {
          result.schema.properties = props;
          return props;
        }));

      return deferred.all(promises)
        .then(function() {
          return result;
        });
    });
};

//
// Incoming property queries from
// 1. a given domain
// 2. commons
// 3. everything else except commons (and optionally a given domain)
//


function incoming_from_domain(type_id, domain_id, count) {
  var q = incoming.query({expected_type:type_id});
  h.extend(q[0].schema, {domain: domain_id});
  if (count) {
    // just get counts
    q = q[0];
    h.extend(q, {"return": "count"});
  }
  return incoming(q);
};

function incoming_from_commons(type_id, exclude_domain_id, count) {
  var q = incoming.query({expected_type:type_id});
  var domain_clause = {
    domain: {
      key: {namespace: "/", limit: 0}
    }
  };
  if (exclude_domain_id) {
    domain_clause["forbid:domain"] = {
      optional: "forbidden",
      id: exclude_domain_id,
      limit: 0
    };
  }
  h.extend(q[0].schema, domain_clause);
  if (count) {
    // just get counts
    q = q[0];
    h.extend(q, {"return": "count"});
  }
  return incoming(q);
};

function incoming_from_bases(type_id, exclude_domain_id, count) {
  var q = incoming.query({expected_type:type_id});
  var domain_clause = {
    domain: {
      key: {
        "forbid:namespace": {optional: "forbidden", id: "/"},
        limit: 0
      }
    }
  };
  if (exclude_domain_id) {
    domain_clause["forbid:domain"] = {
      optional: "forbidden",
      id: exclude_domain_id,
      limit: 0
    };
  }
  h.extend(q[0].schema, domain_clause);

  if (count) {
    // just get counts
    q = q[0];
    h.extend(q, {"return": "count"});
  }
  return incoming(q);
};

function incoming(q) {
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      return result;
    });
};
incoming.query = function(options) {
  return [h.extend({
    optional: true,
    id: null,
    name: null,
    type: "/type/property",
    expected_type: null,
    schema: {id: null, name: null, type: "/type/type"},
    master_property: {
      optional: true,
      id: null,
      name: null,
      type: "/type/property",
      schema: {id: null, name: null}
    },
    reverse_property: {
      optional: true,
      id: null,
      name: null,
      type: "/type/property",
      schema: {id: null, name: null}
    }
  }, options)];
};


//
//
// Write queries should go under here
//
//

/**
 * Add types (included_types) to the /freebase/type_hints/included_types list of type (id).
 */
function add_included_types(id, included_types) {
  var q = {
    id: id,
    "/freebase/type_hints/included_types": []
  };
  included_types.forEach(function(type_id) {
    q["/freebase/type_hints/included_types"].push({id: type_id, connect: "insert"});
  });
  return freebase.mqlwrite(q)
    .then(function(env) {
      return env.result["/freebase/type_hints/included_types"];
    });
};

/**
 * Delete an included type from type (id).
 */
function delete_included_type(id, included_type) {
  var q = {
    id: id,
    "/freebase/type_hints/included_types": {
      id: included_type,
      connect: "delete"
    }
  };
  return freebase.mqlwrite(q)
    .then(function(env) {
      return env.result["/freebase/type_hints/included_types"];
    });
};

/**
 * Add a topic as an instance of a type AND its included types
 */
function add_instance(id, type) {
  return queries_type.included_types(type)
    .then(function(inc_types) {
      var types = [{id:t.id, connect:"insert"} for each (t in inc_types)];
      types.push({id:type, connect:"insert"});
      var q = {
        id: id,
        type: types
      };
      return freebase.mqlwrite(q)
        .then(function(env) {
          return env.result;
        });
    });
};

/**
 * Remove a topic as an instance of a type.
 */
function delete_instance(id, type) {
  var q = {
    id: id,
    type: {
      id: type,
      connect: "delete"
    }
  };
  return freebase.mqlwrite(q)
    .then(function(env) {
      return env.result;
    });
};
