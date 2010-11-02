var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var urlfetch = mf.require("promise", "apis").urlfetch;
var blob = mf.require("queries", "blob");
var h = mf.require("core", "helpers");
var sh = mf.require("helpers");
var mql = mf.require("mql");
var qh = mf.require("queries", "helpers");

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
  var getter = mode === "blob" ? blob.get_blob : blob.get_blurb;
  return blob.get_blurb(o['/common/topic/article'][0].id, options)
    .then(function(blob) {
      o[label] = blob;
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
  return domains(mql.domains({creator: user_id, key: [], optional: true}));
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
      return domains;
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
      var types = domain["types"].concat(domain["cvt:types"]);
      // type blurbs
      types.forEach(function(type) {
        promises.push(add_description(type));
        type.mediator = type["/freebase/type_hints/mediator"] === true;
      });
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



function normalize_prop(prop) {
  prop.tip = prop["/freebase/documented_object/tip"] || "";
  prop.disambiguator = prop["/freebase/property_hints/disambiguator"] === true;
  prop.display_none = prop["/freebase/property_hints/display_none"] === true;
  if (prop.expected_type && typeof prop.expected_type === "object") {
    prop.expected_type.mediator = prop.expected_type["/freebase/type_hints/mediator"] === true;
  }
};
function normalize_props(props) {
  props.forEach(function(p) {
    normalize_prop(p);
  });
};
/**
 * Base type query:
 * 1. expand included_types to get their properties
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
      // cvt?
      result.mediator = result["/freebase/type_hints/mediator"] === true;
      // enumeration?
      result.enumeration = result["/freebase/type_hints/enumeration"] === true;
      // included_types
      result.included_types = result["/freebase/type_hints/included_types"] || [];
      // properties
      normalize_props(result.properties);

      var promises = [];

      // expand included_types
      result.included_types.forEach(function(inc_type) {
         promises.push(freebase.mqlread(mql.type({id:inc_type.id}))
           .then(function(env) {
             return env.result || {};
           })
           .then(function(inc_type_result) {
             normalize_props(inc_type_result.properties);
             h.extend(inc_type, inc_type_result);
             return inc_type_result;
           }));
      });

      // instance_count
      var activity_id = result.guid.slice(1);
      promises.push(freebase.get_static("activity", activity_id)
        .then(function(activity) {
          return activity || {};
        })
        .then(function(activity) {
          result.instance_count = (activity.total && activity.total['new']) || 0;
          return activity;
        }));

      // sibling types (in the same domain excluding this type)
      var siblings_q = [{
        id: null,
        "id!=": id,
        name: null,
        type: "/type/type",
        domain: {
          id: result.domain.id
        },
        "!/freebase/domain_profile/base_type": {
          id: null,
          optional: "forbidden",
          limit: 0
        },
        optional: true
      }];
      promises.push(freebase.mqlread(siblings_q)
        .then(function(env) {
          return env.result || [];
        })
        .then(function(siblings) {
          result.domain.types = siblings;
          return siblings;
        }));

      result.expected_by = [];
      // incoming properties (properties whose ect == this type)
      promises.push(property.incoming(id)
          .then(function(properties) {
              result.expected_by = properties;
              return properties;
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
        same: [],
        common: [],
        base: []
      };
      result.expected_by.forEach(function(p) {
        if (p.schema.domain.id === result.domain.id) {
          result.incoming.same.push(p);
        }
        else if (p.schema.domain.key.namespace === "/") {
          result.incoming.common.push(p);
        }
        else {
          result.incoming.base.push(p);
        }
      });
      result.incoming.same.sort(sh.sort_by_name);
      result.incoming.common.sort(sh.sort_by_name);
      result.incoming.base.sort(sh.sort_by_name);
      return result;
    });
};

function typediagram(id) {
  return base_type(id)
    .then(function(result) {
      result.incoming = {
        common: [],
        base: [],
        user: []
      };
      result.expected_by.forEach(function(p) {
        if (p.schema.domain.key.namespace === "/") {
          result.incoming.common.push(p);
        }
        else if (p.schema.domain.id.indexOf("/base/") === 0) {
          result.incoming.base.push(p);
        }
        else if (p.schema.domain.id.indexOf("/user/") === 0) {
          result.incoming.user.push(p);
        }
      });
      result.incoming.common.sort(sh.sort_by_name);
      result.incoming.base.sort(sh.sort_by_name);
      result.incoming.user.sort(sh.sort_by_name);
      return result;
    });
};



function property(id) {
  var q = mql.property({
    id: id,
    creator: qh.user_clause(),
    timestamp:null,
    schema: {
      id: null,
      guid: null,
      name: null,
      type: "/type/type",
      domain: {
        id: null,
        name: null,
        type: "/type/domain"
      }
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
        id: null,
        "id!=": id,
        name: null,
        type: "/type/property",
        schema: {
          id: result.schema.id
        },
        optional: true
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
            console.log(result);
          return result;
        });
    });
};

property.incoming = function(id) {
  var q = mql.property.incoming({id: id});
  return freebase.mqlread(q)
    .then(function(env) {
      var result =  env.result || {};
      return result.expected_by || [];
    })
    .then(function(properties) {
        normalize_props(properties);
        return properties;
    });
};
