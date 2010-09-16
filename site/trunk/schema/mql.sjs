var mf = acre.require("MANIFEST").mf;
var qh = mf.require("queries", "helpers");
var h = mf.require("core", "helpers");
var i18n = mf.require("i18n", "i18n");

function domains(options) {
  return [h.extend({
    id: null,
    guid: null,
    name: i18n.mql.query.name(),
    type: "/type/domain",
    key: [{namespace: "/", limit: 0}],
    types: {"id": null, type: "/type/type", "return": "count"}
  }, options)];
};

function domain(options) {
  return h.extend({
    id: null,
    guid: null,
    name: i18n.mql.query.name(),
    type: "/type/domain",
    timestamp: null,
    key: [{value: null, namespace: null}],
    creator: {id:null, name: i18n.mql.query.name()},
    owners: [{member: [{id:null, name: i18n.mql.query.name()}]}],
    "/common/topic/article": i18n.mql.query.article(),
    types: [{
      optional: true,
      limit: 1000,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/type",
      "/common/topic/article": i18n.mql.query.article(),
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
    name: i18n.mql.query.name(),
    type: "/type/type",
    timestamp: null,
    key: [{value: null, namespace: null}],
    creator: {id:null, name: i18n.mql.query.name()},
    "/common/topic/article": i18n.mql.query.article(),
    domain: {id: null, name: i18n.mql.query.name(), type: "/type/domain"},
    "/freebase/type_hints/role": {optional: true, id: null},
    "/freebase/type_hints/mediator": null,
    "/freebase/type_hints/enumeration": null,
    "/freebase/type_hints/included_types": [{
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/type",
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }],
    properties: [property({optional: true, index: null, sort: "index"})]
  }, options);
};

function property(options) {
  return h.extend({
    id: null,
    guid: null,
    name: i18n.mql.query.name(),
    type: "/type/property",
    key: [{namespace: null, value: null}],
    expected_type: {
      optional: true,
      id: null,
      name:  i18n.mql.query.name(),
      type: "/type/type",
      "/freebase/type_hints/role": {optional: true, id: null},
      "/freebase/type_hints/mediator": null,
      "/freebase/type_hints/enumeration": null
    },
    master_property: {
      optional: true,
      id: null,
      name:  i18n.mql.query.name(),
      type: "/type/property",
      schema: {id: null, name: i18n.mql.query.name()},
      unique: null
    },
    reverse_property: {
      optional: true,
      id: null,
      name: i18n.mql.query.name(),
      type: "/type/property",
      schema: {id: null, name: i18n.mql.query.name()},
      unique: null
    },
    delegated: {optional: true, id: null, name: i18n.mql.query.name()},
    unit: {optional: true, id: null, name: i18n.mql.query.name(), "/freebase/unit_profile/abbreviation": null},
    "unique": null,
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null,
    "/freebase/documented_object/tip":  i18n.mql.query.text()
  }, options);
};



