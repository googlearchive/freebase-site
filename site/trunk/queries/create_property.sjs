var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");


/*
 * @param o:Object (required) - options specifying the new type (name, key, etc.):
 *   type (required)
 *   name (required)
 *   key (required)
 *   expected_type (required)
 *   unit (optional)
 *   description (optional)
 *   disambiguator (optional)
 *   unique (optional)
 *   hidden (optional)
 *   mqlkey_quote (optional) - acre.freebase.mqlkey_quote(key) if TRUE, default is False.
 *
 * Note: this will modify o with the validated values
 */
function validate_options(o, required) {
  o.type = o.type == null ? "" : h.trim(o.type);
  o.name = o.name == null ? "" : h.trim(o.name);
  o.key = o.key == null ? "" : h.trim(o.key);
  o.expected_type = o.expected_type == null ? "" : h.trim(o.expected_type);
  o.unit = o.unit == null ? "" : h.trim(o.unit);
  o.description = o.description == null ? "" : h.trim(o.description);
  o.disambiguator = o.disambiguator === true || o.disambiguator === "true" || o.disambiguator === "1";
  o.unique = o.unique === true || o.unique === "true" || o.unique === "1";
  o.hidden = o.hidden === true || o.hidden === "true" || o.hidden === "1";
  o.mqlkey_quote = o.mqlkey_quote === true;
  o.lang = o.lang == null ? "/lang/en" : o.lang;  // this should be set globally somehow
  if (required) {
    for (var i=0,l=required.length; i<l; i++) {
      if (o[required[i]] === "") {
        return deferred.rejected(required[i] + " required");
      }
    }
  }
  if (o.mqlkey_quote) {
    o.key = acre.freebase.mqlkey_quote(o.key);
  }
  return o;
};

/**
 * Create a new property using the permission of the specified type.
 *
 * @param o:Object (required) - options specifying the new property @see validate_options
 */
function create_property(o) {
  // validate args
  validate_options(o, ["type", "name", "key", "expected_type"]);

  var q = {
    id: null,
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
      return freebase.mqlwrite(q)
        .then(function(env) {
          return env.result;
        })
        .then(function(result) {
          return created;
        });
    });
};

