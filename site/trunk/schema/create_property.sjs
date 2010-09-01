var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var validators = mf.require("validator", "validators");

/**
 * Create a new property using the permission of the specified type.
 *
 * @param o:Object (required) - options specifying the new property.
 */
function create_property(options) {
  var o;
  try {
    o = {
      type: validators.MqlId(options, "type", {required:true}),
      name: validators.String(options, "name", {required:true}),
      key: validators.String(options, "key", {required:true}),
      expected_type: validators.MqlId(options, "expected_type", {required:true}),
      unit: validators.MqlId(options, "unit", {if_empty:""}),
      description: validators.String(options, "description", {if_empty:""}),
      disambiguator: validators.StringBool(options, "disambiguator", {if_empty:false}),
      unique: validators.StringBool(options, "unique", {if_empty:false}),
      hidden: validators.StringBool(options, "hidden", {if_empty:false}),
      master_property: validators.MqlId(options, "master_property", {if_empty:""}),
      delegated: validators.MqlId(options, "delegated", {if_empty:""}),

      mqlkey_quote: validators.StringBool(options, "mqlkey_quote", {if_empty:false}),
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }
  if (o.mqlkey_quote) {
    o.key = acre.freebase.mqlkey_quote(o.key);
  }

  var q = {
    id: null,
    guid: null,
    key: {
      value: o.key,
      namespace: o.type
    },
    type: {
      id: "/type/property"
    },
    "/type/property/schema": {
      id: o.type
    },
    create: "unless_exists"
  };
  return freebase.mqlwrite(q, {use_permission_of: o.type})
    .then(function(env) {
      return env.result;
    })
    .then(function(created) {
      if (created.create === "existed") {
        return deferred.rejected("key already exists: " + o.key);
      }
      // cleanup result
      created.schema = created["/type/property/schema"];

      q = {
        id: created.id,
        type: "/type/property",
        name: {
          value: o.name,
          lang: o.lang,
          connect: "update"
        },
        expected_type: {
          id: o.expected_type,
          connect: "update"
        },
        unique: {
          value: o.unique,
          connect: "update"
        },
        "/freebase/property_hints/disambiguator": {
          value: o.disambiguator,
          connect: "update"
        },
        "/freebase/property_hints/display_none": {
          value: o.hidden,
          connect: "update"
        }
      };
      if (o.unit) {
        q.unit = {
          id: o.unit,
          connect: "update"
        };
      }
      if (o.description) {
        q["/freebase/documented_object/tip"] = {
          value:o.description,
          lang:o.lang,
          connect:"update"
        };
      }
      if (o.master_property) {
        q.master_property = {
          id: o.master_property,
          connect: "update"
        };
      }
      if (o.delegated) {
        q.delegated = {
          id: o.delegated,
          connect: "update"
        };
      }
      return freebase.mqlwrite(q)
        .then(function(env) {
          return env.result;
        })
        .then(function(result) {
          return created;
        });
    });
};

