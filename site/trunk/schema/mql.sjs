var mf = acre.require("MANIFEST").MF;
var qh = mf.require("queries", "helpers");
var h = mf.require("core", "helpers");

function domains(options) {
  return [h.extend({
    id: null,
    guid: null,
    name: null,
    type: "/type/domain",
    key: [{namespace: "/", limit: 0}],
    types: {"id": null, type: "/type/type", "return": "count"}
  }, options)];
};

function domain(options) {
  return h.extend({
    id: null,
    guid: null,
    name: null,
    type: "/type/domain",
    timestamp: null,
    key: [{value: null, namespace: null}],
    creator: qh.user_clause(),
    owners: [{member: [qh.user_clause()]}],
    "/common/topic/article": qh.article_clause(true),
    types: [{
      optional: true,
      id: null,
      name: null,
      type: "/type/type",
      "/common/topic/article": qh.article_clause(true),
      properties: {optional: true, id: null, type: "/type/property", "return": "count"},
      "/freebase/type_hints/role": {optional: true, id: null},
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/enumeration": null,
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
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
    key: [{value: null, namespace: null}],
    creator: qh.user_clause(),
    "/common/topic/article": qh.article_clause(true),
    domain: {id: null, name: null, type: "/type/domain"},
    "/freebase/type_hints/role": {optional: true, id: null},
    "/freebase/type_hints/mediator": null,
    "/freebase/type_hints/enumeration": null,
    "/freebase/type_hints/included_types": [{
      optional: true,
      id: null,
      name: null,
      type: "/type/type",
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }],
    properties: [property({optional: true, index: null, sort: "index"})]
  }, options);
};

function included_types(options) {
  return h.extend({
    id: null,
    "/freebase/type_hints/included_types": [{
      optional: true,
      id: null,
      name: null,
      type: "/type/type",
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }]
  }, options);
};

function property(options) {
  return h.extend({
    id: null,
    guid: null,
    name: null,
    type: "/type/property",
    key: [{namespace: null, value: null}],
    expected_type: {
      optional: true,
      id: null,
      name: null,
      type: "/type/type",
      "/freebase/type_hints/role": {optional: true, id: null},
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/enumeration": null
    },
    master_property: {
      optional: true,
      id: null,
      name: null,
      type: "/type/property",
      schema: {id: null, name: null},
      unique: null,
      unit: {optional: true, id: null, name: null, "/freebase/unit_profile/abbreviation": null}
    },
    reverse_property: {
      optional: true,
      id: null,
      name: null,
      type: "/type/property",
      schema: {id: null, name: null},
      unique: null,
      unit: {optional: true, id: null, name: null, "/freebase/unit_profile/abbreviation": null}
    },
    delegated: {optional: true, id: null, name: null},
    unit: {optional: true, id: null, name: null, "/freebase/unit_profile/abbreviation": null},
    "unique": null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null,
    "/freebase/documented_object/tip": null
  }, options);
};



