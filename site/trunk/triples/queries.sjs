var mf = acre.require("MANIFEST").mf;
var i18n = mf.require("i18n", "i18n");
var h = mf.require("core", "helpers");
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;

var LIMIT = 100;
var LIMIT2 = LIMIT*2;

function topic(id, options) {
  var q = {
    id: id,
    "primary:id": null,
    mid: null,
    guid: null,
    creator: null,
    name: i18n.mql.query.name(),
    timestamp: null
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
};

function names(id, options) {
  options = options || {};
  var q = {
    id: id,
    name: [{
      value: null,
      lang: null,
      link: {creator:null, timestamp:null},
      optional: true,
      limit: options.limit || LIMIT,
      sort: "-link.timestamp"
    }]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result.name;
    });
};

function keys(id, options) {
  options = options || {};
  var q = {
    id: id,
    key: [{
      namespace:null,
      value:null,
      link: {creator:null, timestamp:null},
      optional:true,
      limit: options.limit || LIMIT,
      sort: "-link.timestamp"
    }],
    "/type/namespace/keys": [{
      namespace: null,
      value: null,
      link: {creator:null, timestamp:null},
      optional: true,
      limit: options.limit || LIMIT,
      sort: "-link.timestamp"
    }]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      var result = env.result;
      result.outgoing = result.key;
      result.incoming = result["/type/namespace/keys"];
      return result;
    });
};


function outgoing(id, options) {
  var q = {
    id: id,
    "/type/reflect/any_master":[{
      id: null,
      link: {
        master_property: null,
        creator: null,
        timestamp: null
      },
      optional: true,
      limit: options.limit || LIMIT,
      sort: "-link.timestamp"
    }],
    "/type/reflect/any_value":[{
      value: null,
      type: null,
      link: {
        master_property: null,
        target_value: {},
        "forbid:master_property": {
          id: "/type/object/name",
          optional: "forbidden",
          limit: 0
        },
        creator: null,
        timestamp: null
      },
      optional: true,
      limit: options.limit || LIMIT,
      sort: "-link.timestamp"
    }]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      var result = env.result;
      return result["/type/reflect/any_master"].concat(result["/type/reflect/any_value"]);
    });
};


function incoming(id, options) {
  var q = {
    id: id,
    "/type/reflect/any_reverse":[{
      id: null,
      link: {
        master_property: null,
        creator: null,
        timestamp: null
      },
      optional: true,
      limit: options.limit || LIMIT,
      sort: "-link.timestamp"
    }]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      var result = env.result;
      return result["/type/reflect/any_reverse"];
    });
};

function typelinks(id, options) {
  var q = [{
    type: "/type/link",
    master_property: id,
    source: null,
    target: null,
    target_value: {},
    creator: null,
    timestamp: null,
    optional: true,
    limit: options.limit || LIMIT,
    sort: "-timestamp"
  }];
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
};

function sort_link_timestamp(a, b) {
  return b.link.timestamp > a.link.timestamp;
};

function sort_counts(a, b) {
  return b[1] - a[1];
};

function pad(n) {
  return n<10 ? '0'+n : n;
};


function distinct_properties(id) {
  var today = new Date();
  var as_of_time = [today.getFullYear(), pad(today.getMonth()+1), pad(today.getDate())].join("-");
  var options = {as_of_time: as_of_time};

  var promises = [];
  promises.push(distinct_any_master(id, null, options));
  promises.push(distinct_any_reverse(id, null, options));
  promises.push(distinct_any_value(id, null, options));

  return deferred.all(promises)
    .then(function([any_master, any_reverse, any_value]) {
      var props = any_master.concat(any_reverse).concat(any_value);
      return props;
    });
};


function distinct_any_master(id, forbid, options) {
  return distinct_query(id, forbid, options, "/type/reflect/any_master");
};

function distinct_any_value(id, forbid, options) {
  return distinct_query(id, forbid, options, "/type/reflect/any_value");
};

function distinct_any_reverse(id, forbid, options) {
  return distinct_query(id, forbid, options, "/type/reflect/any_reverse");
};

function distinct_query(id, forbid, options, any_key) {
  var q = {id: id};
  q[any_key] = [{
    link: {master_property:null}
  }];
  if (forbid) {
    q[any_key][0].link["forbid:master_property"] = {
      "id|=": forbid,
      optional: "forbidden",
      limit: 0
    };
  }
  return freebase.mqlread(q, options)
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      if (result) {
        if (!forbid) {
          forbid = [];
        }
        var seen = {};
        result[any_key].forEach(function(o) {
          if (!seen[o.link.master_property]) {
            seen[o.link.master_property] = 1;
            forbid.push(o.link.master_property);
          }
        });
        return distinct_query(id, forbid, options, any_key);
      }
      else {
        return forbid || [];
      }
    });
};
