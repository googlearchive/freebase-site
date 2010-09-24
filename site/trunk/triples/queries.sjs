var mf = acre.require("MANIFEST").mf;
var i18n = mf.require("i18n", "i18n");
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



