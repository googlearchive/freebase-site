var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");
var i18n = mf.require("i18n", "i18n");
var schema_helpers = mf.require("helpers");
var mql = mf.require("mql");

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
/**
function add_description(o, mode, options, label) {
  mode = mode || "blurb";
  label = label || mode;
  options = options || {};
  var articles = i18n.mql.result.articles(o['/common/topic/article']);
  if (!articles.length) {
    return o;
  }
  if (mode === "blob") {
    if (! ("maxlength" in options)) {
      options.maxlength = 1000;
    }
  }
  var promises = [];
  for (var i=0,l=articles.length; i<l; i++) {
    var article = articles[i];
    if (article.id) {
      promises.push(get_blurb(article, options, label));
    }
  }
  return deferred.all(promises)
    .then(function() {
      return o;
    });
};
function get_blurb(article, options, label) {
  return queries_blob.get_blurb(article.id, options)
    .then(function(content) {
      article[label] = content;
      return article;
    }, function(error) {
      article[label] = null;
      return article;
    });
};
*/

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
      return domains.sort(schema_helpers.sort_by_id);
    });
};

/**
 * minimal domain query to get the name, key(s), and article
 */
function minimal_domain(id) {
  var q = {
    id: id,
    name: i18n.mql.query.name(),
    type: "/type/domain",
    key: [{value: null, namespace: null}],
    "/common/topic/article": i18n.mql.query.article()
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(domain) {
      return i18n.get_blob(domain);
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
      return i18n.get_blurb(domain, {maxlength: 250});
    })
    .then(function(domain) {
      return i18n.get_blob(domain);
    })
    .then(function(domain) {
      var promises = [];

      // categorize types by their roles (mediator, cvt, etc.)
      var types = [];
      var enumerations = [];
      var mediators = [];
      var cvts = [];
      domain.types.forEach(function(type) {
        promises.push(i18n.get_blurb(type));
        type.instance_count = 0;
        var role = h.get_type_role(type, true);
        if (role === "mediator") {
          mediators.push(type);
        }
        else if (role === "cvt") {
          cvts.push(type);
        }
        else if (role === "enumeration") {
          enumerations.push(type);
        }
        else {
          types.push(type);
        }
      });
      types.sort(schema_helpers.sort_by_id);
      enumerations.sort(schema_helpers.sort_by_id);
      mediators.sort(schema_helpers.sort_by_id);
      cvts.sort(schema_helpers.sort_by_id);

      domain.types = types;
      domain["enumeration:types"] = enumerations;
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
function minimal_type(type_id, options) {
  var q = h.extend({
    id: type_id,
    guid: null,
    name: i18n.mql.query.name(),
    type: "/type/type",
    key: [{namespace: null, value: null}],
    domain: {id: null, name: i18n.mql.query.name(), type: "/type/domain"},
    "/common/topic/article": i18n.mql.query.article(),
    "/freebase/type_hints/role": {optional: true, id: null},
    "/freebase/type_hints/mediator": null,
    "/freebase/type_hints/enumeration": null,
    properties: {optional: true, id: null, type: "/type/property", "return": "count"}
  }, options);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(type) {
      h.get_type_role(type, true);
      var promises = [];
      // description
      promises.push(i18n.get_blurb(type));
      promises.push(i18n.get_blob(type));
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
      return h.get_type_role(env.result || {});
    });
};


function normalize_prop(prop) {
  prop.tip = prop["/freebase/documented_object/tip"] || "";
  prop.disambiguator = prop["/freebase/property_hints/disambiguator"] === true;
  prop.display_none = prop["/freebase/property_hints/display_none"] === true;
  if (prop.expected_type && typeof prop.expected_type === "object") {
    h.get_type_role(prop.expected_type, true);
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
      return i18n.get_blurb(result, {maxlength: 250 });
    })
    .then(function(result) {
      return i18n.get_blob(result);
    })
    .then(function(result) {
      // type role
      h.get_type_role(result, true);
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
        name: i18n.mql.query.name(),
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
          return siblings.sort(schema_helpers.sort_by_id);
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
          name: i18n.mql.query.name(),
          type: id,
          "/common/topic/article": i18n.mql.query.article(),
          optional: true,
          limit: 11
        }])
        .then(function(env) {
          result.instance = env.result.sort(schema_helpers.sort_by_id);
          var blurbs = [];
          result.instance.forEach(function(topic) {
            blurbs.push(i18n.get_blurb(topic));
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

      result.included_types.forEach(function(inc_type) {
        promises.push(type_properties(inc_type.id)
          .then(function(type) {
            inc_type.properties = type.properties;
          }));
      });

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
    name: i18n.mql.query.name(),
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
    name: i18n.mql.query.name()
  };
  if (get_blurb || get_blob) {
    q["/common/topic/article"] = i18n.mql.query.article();
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(topic) {
      if (get_blurb) {
        return i18n.get_blurb(topic);
      }
      return topic;
    })
    .then(function(topic) {
      if (get_blob) {
        return i18n.get_blob(topic);
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
    creator: {id:null, name: i18n.mql.query.name()},
    timestamp:null,
    schema: {
      id: null,
      guid: null,
      name: i18n.mql.query.name(),
      type: "/type/type",
      domain: {id: null, name: i18n.mql.query.name(), type: "/type/domain"}
    }
  });
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(result) {
      normalize_prop(result);

      var promises = [];
      // sibling props (in the same schema excluding this prop)
      var siblings_q = [{
        optional: true,
        id: null,
        "id!=": id,
        name: i18n.mql.query.name(),
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


/**
 * Simple type instance query if anything is an instance of a type.
 */
function type_used(type_id) {
  var q = {
    id: type_id,
    type: "/type/type",
    instance: {optional:true, id: null, limit: 1}
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result.instance !== null;
    });
};


/**
 * Query to determine if a property is being "used".
 * A property is determined as being "used" if there is 1 or more
 * /type/link instances with a master_property or reverse_property of the property id.
 */
function property_used(prop_id) {
  var promises = [];
  var master_query = {
    source: null,
    target: null,
    target_value: null,
    type: "/type/link",
    master_property: prop_id,
    limit: 1
  };
  promises.push(freebase.mqlread(master_query)
    .then(function(env) {
      return env.result;
    }));

  var reverse_query = {
    source: null,
    target: null,
    target_value: null,
    type: "/type/link",
    master_property: {reverse_property: prop_id},
    limit: 1
  };
  promises.push(freebase.mqlread(reverse_query)
    .then(function(env) {
      return env.result;
    }));

  return deferred.all(promises)
    .then(function(results) {
      for (var i=0,l=results.length; i<l; i++) {
        if (results[i] != null) {
          return true;
        }
      }
      return false;
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
    return freebase.mqlread(q)
      .then(function(env) {
        return env.result;
      });
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
    return freebase.mqlread(q)
      .then(function(env) {
        return env.result;
      });
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
    return freebase.mqlread(q)
      .then(function(env) {
        return env.result;
      });
  }
  return incoming(q);
};

function incoming(q) {
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      result.forEach(function(prop) {
        h.get_type_role(prop.schema, true);
      });
      return result;
    });
};
incoming.query = function(options) {
  return [h.extend({
    optional: true,
    id: null,
    name: i18n.mql.query.name(),
    type: "/type/property",
    expected_type: null,
    schema: {
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/type",
      "/freebase/type_hints/role": {optional: true, id: null},
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/enumeration": null
    },
    master_property: {
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/property",
      schema: {id: null, name: i18n.mql.query.name()}
    },
    reverse_property: {
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/property",
      schema: {id: null, name: i18n.mql.query.name()}
    }
  }, options)];
};

/**
 * Get all included types of a type
 */
function included_types(id) {
  return freebase.mqlread({
    id: id,
    "/freebase/type_hints/included_types": [{
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/type",
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }]
  })
  .then(function(env) {
    return env.result;
  })
  .then(function(result) {
    var types = result["/freebase/type_hints/included_types"];
    return [{id: t.id, name: t.name} for each (t in types)];
  });
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
  return included_types(type)
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
