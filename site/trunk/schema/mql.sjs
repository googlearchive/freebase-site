var mf = acre.require("MANIFEST").MF;
var qh = mf.require("queries", "helpers");
var h = mf.require("core", "helpers");

function domains(options) {
  return [h.extend({
    id: null,
    guid: null,
    name: null,
    type: "/type/domain",
    key: [{
      namespace: "/",
      limit: 0
    }],
    types: {
      "id": null,
      type: "/type/type",
      "return": "count"
    }
  }, options)];
};

function domain(options) {
  return h.extend({
    id: null,
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
    types: [{ // non-mediator types
      id: null,
      name: null,
      type: "/type/type",
      "/common/topic/article": qh.article_clause(true),
      "/freebase/type_hints/enumeration": null,
      "/freebase/type_hints/mediator": {
        value: true,
        optional: "forbidden",
        limit: 0
      },
      "!/freebase/domain_profile/base_type": {
        id: null,
        optional: "forbidden",
        limit: 0
      },
      properties: {
        id: null,
        type: "/type/property",
        "return": "count",
        optional: true
      },
      optional: true,
      limit: 1000
    }],
    "mediator:types": [{ // mediator types
      id: null,
      name: null,
      type: "/type/type",
      "/common/topic/article": qh.article_clause(true),
      "/freebase/type_hints/mediator": true,
      "/freebase/type_hints/enumeration": null,
      properties: {
        id: null,
        type: "/type/property",
        "return": "count",
        optional: true
      },
      optional: true,
      limit: 1000
    }]
  }, options);
};

function type(options) {
  return h.extend({
    id: null,
    guid: null,
    name: null,
    type: "/type/type",
    timestamp: null,
    key: [{
      value: null,
      namespace: null
    }],
    creator: qh.user_clause(),
    "/common/topic/article": qh.article_clause(true),
    domain: {
      id: null,
      name: null,
      type: "/type/domain"
    },
    "/freebase/type_hints/mediator": null,
    "/freebase/type_hints/enumeration": null,
    "/freebase/type_hints/included_types": [{
      id: null,
      name: null,
      optional: true,
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {
        id: null,
        optional: "forbidden",
        limit: 0
      }
    }],
    properties: [property({optional: true, index: null, sort: "index"})]
  }, options);
};

function property(options) {
  return h.extend({
    id: null,
    guid: null,
    name: null,
    type: "/type/property",
    key: [{
      namespace: null,
      value: null
    }],
    expected_type: {
      id: null,
      name: null,
      type: "/type/type",
      "/freebase/type_hints/mediator": null,
      optional:true
    },
    master_property: {
      id: null,
      name: null,
      type: "/type/property",
      schema: {
        id: null,
        name: null
      },
      optional: true
    },
    reverse_property: {
      id: null,
      name: null,
      type: "/type/property",
      schema: {
        id: null,
        name: null
      },
      optional: true
    },
    delegated: {
      id: null,
      name: null,
      optional: true
    },
    unit: {
        id: null,
        name: null,
        "/freebase/unit_profile/abbreviation": null,
        optional: true
    },
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null,
    "/freebase/documented_object/tip": null,
    "unique":   null
  }, options);
};



