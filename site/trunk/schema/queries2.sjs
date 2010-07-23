var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var urlfetch = mf.require("promise", "apis").urlfetch;
var qh = mf.require("queries", "helpers");
var blob = mf.require("queries", "blob");
var h = mf.require("core", "helpers");

function add_description(o, mode, options, label) {
  mode = mode || "blurb";
  label = label || mode;
  options = options || {};
  if (!o['/common/topic/article'] || o['/common/topic/article'].length === 0) {
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

function domain(id) {
  var q = domain.query(id);
  return freebase.mqlread(q)
    .then(function(envelope) {
      return envelope.result;
    })
    .then(function(domain) {
      return add_description(domain, "blurb", null, "blurb");
    })
    .then(function(domain) {
      return add_description(domain, "blob", null, "blob");
    })
    .then(function(domain) {
      var promises = [];
      var types = domain["types"].concat(domain["cvt:types"]);
      // type blurbs
      types.forEach(function(type) {
        promises.push(add_description(type));
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

domain.query = function(id) {
  return {
    id: id,
    guid: null,
    name: null,
    type: "/type/domain",
    timestamp: null,
    key: [{
      value: null,
      namespace: null
    }],
    creator: qh.user_clause(),
    owners: [{
      member: [qh.user_clause()]
    }],
    "/common/topic/article": qh.article_clause(true),
    types: [{ // non-cvt types
      id: null,
      name: null,
      type: "/type/type",
      "/common/topic/article": qh.article_clause(true),
      "/freebase/type_hints/mediator": {
        value: true,
        optional: "forbidden"
      },
      properties: {
        type: "/type/property",
        "return": "count"
      },
      optional: true,
      limit: 1000
    }],
    "cvt:types": [{ // cvt types
      id: null,
      name: null,
      type: "/type/type",
      "/common/topic/article": qh.article_clause(true),
      "/freebase/type_hints/mediator": {
        value: true
      },
      properties: {
        type: "/type/property",
        "return": "count"
      },
      optional: true,
      limit: 1000
    }]
  };
};
