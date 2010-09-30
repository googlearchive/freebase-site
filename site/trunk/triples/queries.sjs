var mf = acre.require("MANIFEST").mf;
var i18n = mf.require("i18n", "i18n");
var _ = i18n.gettext;
var h = mf.require("core", "helpers");
var f = mf.require("filters");
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;


function topic(id, filters) {
  var q = {
    id: id,
    "primary:id": null,
    mid: null,
    guid: null,
    creator: null,
    name: i18n.mql.query.name(),
    timestamp: null,
    permission: null
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
};

function last_edit(id, filters) {
  var q = {
    source: id,
    master_property: null,
    target: null,
    target_value: null,
    type: "/type/link",
    valid: null,
    timestamp: null,
    sort: "-timestamp",
    operation: null,
    limit: 1,
    creator: null
  };
  f.apply_creator(q, filters.creator);
  f.apply_timestamp(q, filters.timestamp);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
};

function names(id, filters) {
  var q = {
    id: id,
    name: [{
      value: null,
      lang: null,
      link: {creator:null, timestamp:null},
      optional: true,
      sort: "-link.timestamp"
    }]
  };
  f.apply_filters(q.name[0], filters);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result.name;
    });
};

function aliases(id, filters) {
  var q = {
    id: id,
    "/common/topic/alias": [{
      value: null,
      lang: null,
      link: {creator:null, timestamp:null},
      optional: true,
      sort: "-link.timestamp"
    }]
  };
  f.apply_filters(q["/common/topic/alias"][0], filters);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result["/common/topic/alias"];
    });
};

function keys(id, filters) {
  var q = {
    id: id,
    key: [{
      namespace:null,
      value:null,
      link: {creator:null, timestamp:null},
      optional:true,
      sort: "-link.timestamp"
    }],
    "/type/namespace/keys": [{
      namespace: null,
      value: null,
      link: {creator:null, timestamp:null},
      optional: true,
      sort: "-link.timestamp"
    }]
  };
  f.apply_filters(q.key[0], filters);
  f.apply_filters(q["/type/namespace/keys"][0], filters);
  return freebase.mqlread(q)
    .then(function(env) {
      var result = env.result;
      result.outgoing = result.key;
      result.incoming = result["/type/namespace/keys"];
      return result;
    });
};

function outgoing(id, filters) {
  var q = {
    id: id,
    "/type/reflect/any_master":[{
      id: null,
      mid: null,
      name: i18n.mql.query.name(),
      link: {
        master_property: null,
        "forbid:master_property": {
          id: null,
          "id|=": ["/type/object/permission"],
          optional: "forbidden",
          limit: 0
        },
        creator: null,
        timestamp: null
      },
      optional: true,
      sort: "-link.timestamp"
    }],
    "/type/reflect/any_value":[{
      value: null,
      type: null,
      link: {
        master_property: null,
        target_value: {},
        "forbid:master_property": {
          id: null,
          "id|=": ["/type/object/name", "/common/topic/alias"],
          optional: "forbidden",
          limit: 0
        },
        creator: null,
        timestamp: null
      },
      optional: true,
      sort: "-link.timestamp"
    }]
  };
  f.apply_filters(q["/type/reflect/any_master"][0], filters);
  f.apply_filters(q["/type/reflect/any_value"][0], filters);
  return freebase.mqlread(q)
    .then(function(env) {
      var result = env.result;
      result = result["/type/reflect/any_master"].concat(result["/type/reflect/any_value"]);
      result.sort(sort_link_timestamp);
      if (filters.limit && result.length > filters.limit) {
        result = result.slice(0, filters.limit);
      }
      return result;
    });
};

function sort_link_timestamp(a, b) {
  return b.link.timestamp > a.link.timestamp;
};

function incoming(id, filters) {
  var q = {
    id: id,
    "/type/reflect/any_reverse":[{
      id: null,
      mid: null,
      name: i18n.mql.query.name(),
      link: {
        master_property: null,
        creator: null,
        timestamp: null
      },
      optional: true,
      sort: "-link.timestamp"
    }]
  };
  f.apply_filters(q["/type/reflect/any_reverse"][0], filters);
  return freebase.mqlread(q)
    .then(function(env) {
      var result = env.result;
      return result["/type/reflect/any_reverse"];
    });
};

function typelinks(id, filters) {
  var q = [{
    type: "/type/link",
    master_property: id,
    source: {id:null, mid:null, name:i18n.mql.query.name()},
    target: {id:null, mid:null, name:i18n.mql.query.name(), optional:true},
    target_value: {},
    creator: null,
    timestamp: null,
    optional: true,
    limit: filters.limit || LIMIT,
    sort: "-timestamp"
  }];
  f.apply_limit(q[0], filters.limit);
  f.apply_creator(q[0], filters.creator);
  f.apply_timestamp(q[0], filters.timestamp);
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    });
};

