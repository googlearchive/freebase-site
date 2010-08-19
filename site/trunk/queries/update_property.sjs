var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var create_property = mf.require("create_property");

/**
 * validation for update_property options
 * @see create_property.validate_options
 */
function validate_options(o) {
  create_property.validate_options(o, ["type"]);
  if (!o.id) {
    throw ("property id required");
  }
  return o;
};

/**
 * Update an existing property values (name, key, expected_type, etc.)
 *
 * @param o:Object (required) - options specifying the updated values. @see validate_options
 */
function update_property(o) {
  // validate args
  try {
    validate_options(o);
  }
  catch (e) {
    return deferred.rejected(e);
  }

  var q = {
    id: o.id,
    guid: null,
    type: "/type/property",
    key: {namespace:o.type,value:null}
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(old) {
      if (o.key && old.key.value !== o.key) {
        // delete old key
        return freebase.mqlwrite({guid:old.guid, key:{namespace:o.type, value:old.key.value, connect:"delete"}})
          .then(function(env) {
            // insert new key
            return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.type, value:o.key, connect:"insert"}})
              .then(function(env) {
                // id may have changed
                old.id = env.result.id;
                return old;
              });
          });
      }
      else {
        return old;
      }
    })
    .then(function(old) {
      var update = {
        guid: old.guid,
        type: "/type/property"
      };
      if (o.name) {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }
      if (o.expected_type) {
        update.expected_type = {id:o.expected_type, connect:"update"};
      }
      if (o.unit) {
        update.unit = {id:o.unit, connect:"update"};
      }
      if (o.description) {
        update["/freebase/documented_object/tip"] = {value:o.description, lang:o.lang, connect:"update"};
      }
      update.unique = {value:o.unique === true, connect:"update"};
      update["/freebase/property_hints/disambiguator"] = {value:o.disambiguator === true, connect:"update"};
      update["/freebase/property_hints/display_none"] = {value:o.hidden === true, connect:"update"};
      return freebase.mqlwrite(update)
        .then(function(env) {
          return old.id;
        });
    });
};
