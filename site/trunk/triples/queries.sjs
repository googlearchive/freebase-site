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
  return freebase.mqlread(q, f.mqlread_options(filters))
    .then(function(env) {
      return env.result;
    });
};

function prop_counts(id, filters) {
  if (filters.as_of_time) {
    // can't do prop_counts by as_of_time
    return null;
  }
  var q = {
    id: id,
    guid: null
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return prop_counts_by_guid(env.result.guid);
    });
};

function prop_counts_by_guid(guid) {
  var bdb_id = guid.substring(25);
  return freebase.get_static("prop_counts", bdb_id)
    .then(function(counts) {
      return counts;
    }, function(error) {
      return null;
    });
};

function names_aliases(id, filters) {
  var q = {
    id: id,
    "/type/reflect/any_value":[{
      value: null,
      type: null,
      link: {
        master_property: null,
        target_value: {},
        "a:master_property": {
          id: null,
          "id|=": ["/type/object/name", "/common/topic/alias"],
          limit: 0
        },
        creator: null,
        timestamp: null
      },
      optional: true,
      sort: "-link.timestamp"
    }]
  };
  f.apply_filters(q["/type/reflect/any_value"][0], filters);
  return freebase.mqlread(q, f.mqlread_options(filters))
    .then(function(env) {
      return env.result["/type/reflect/any_value"];
    });
};

function keys(id, filters) {
  var q = {
    id: id,
    "/type/reflect/any_reverse": [{
      link: {
        master_property: "/type/namespace/keys",
        source: {id: null},
        target: {id: null},
        target_value: null,
        creator: null,
        timestamp: null
      },
      optional: true,
      sort: "-link.timestamp"
    }],
    "/type/reflect/any_master": [{
      link: {
        master_property: "/type/namespace/keys",
        source: {id: null},
        target: {id: null},
        target_value:  null,
        creator: null,
        timestamp: null
      },
      optional: true,
      sort: "-link.timestamp"
    }]
  };
  f.apply_filters(q["/type/reflect/any_reverse"][0], filters);
  f.apply_filters(q["/type/reflect/any_master"][0], filters);
  return freebase.mqlread(q, f.mqlread_options(filters))
    .then(function(env) {
      var result = env.result;
      var any_reverse = result["/type/reflect/any_reverse"];
      var any_master = result["/type/reflect/any_master"];
      result = any_reverse.concat(any_master);
      if (filters.limit && result.length > filters.limit) {
        result = result.slice(0, filters.limit);
      }
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
          "id|=": ["/type/object/permission", "/type/namespace/keys"],
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
  return freebase.mqlread(q, f.mqlread_options(filters))
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
      guid: null,
      name: i18n.mql.query.name(),
      link: {
        master_property: null,
        "forbid:master_property": {
          id: null,
          "id|=": ["/type/namespace/keys"],
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
  f.apply_filters(q["/type/reflect/any_reverse"][0], filters);
  return freebase.mqlread(q, f.mqlread_options(filters))
    .then(function(env) {
      var result = env.result;
      return result["/type/reflect/any_reverse"];
    });
};

function typelinks(id, filters) {
  var q = [{
    type: "/type/link",
    master_property: id,
    source: {id:null, mid:null, guid:null, name:i18n.mql.query.name()},
    target: {id:null, mid:null, name:i18n.mql.query.name(), optional:true},
    target_value: {},
    creator: null,
    timestamp: null,
    optional: true,
    limit: filters.limit || LIMIT,
    sort: "-timestamp"
  }];
  f.apply_limit(q[0], filters.limit);
  f.apply_timestamp(q[0], filters.timestamp);
  f.apply_creator(q[0], filters.creator);
  f.apply_history(q[0], filters.history);
  return freebase.mqlread(q, f.mqlread_options(filters))
    .then(function(env) {
      return env.result;
    });
};

