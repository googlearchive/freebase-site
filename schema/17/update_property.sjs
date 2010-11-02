var mf = acre.require("MANIFEST").mf;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var validators = mf.require("validator", "validators");

/**
 * Update an existing property values (name, key, expected_type, etc.)
 *
 * @param o:Object (required) - options specifying the updated values.
 */
function update_property(options) {
  var o;
  try {
    o = {
      // required
      type: validators.MqlId(options, "type", {required:true}),
      id: validators.MqlId(options, "id", {required:true}),

      // optional
      name: validators.String(options, "name", {if_empty:null}),
      key: validators.String(options, "key", {if_empty:null}),
      expected_type: validators.MqlId(options, "expected_type", {if_empty:null}),
      unit: validators.MqlId(options, "unit", {if_empty:null}),
      description: validators.String(options, "description", {if_empty:null}),
      disambiguator: validators.StringBool(options, "disambiguator", {if_empty:null}),
      unique: validators.StringBool(options, "unique", {if_empty:null}),
      hidden: validators.StringBool(options, "hidden", {if_empty:null}),

      // default lang for text is /lang/en
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"}),

      // if TRUE, acre.freebase.mqlkey_quote key. Default is FALSE
      mqlkey_quote: validators.StringBool(options, "mqlkey_quote", {if_empty:false}),

      // an array of options to remove/delete (name, key, ect, unit, description, disambiguator, unique, hidden);
      remove: validators.Array(options, "remove", {if_empty:[]})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }
  if (o.mqlkey_quote) {
    o.key = acre.freebase.mqlkey_quote(o.key);
  }

  var remove = {};
  o.remove.forEach(function(k) {
    remove[k] = true;
  });

  var q = {
    id: o.id,
    guid: null,
    type: "/type/property",
    key: {namespace:o.type, value:null, optional:true},
    name: {value:null, lang:o.lang, optional:true},
    expected_type: null,
    unit: null,
    unique: null,
    "/freebase/documented_object/tip": {value:null, lang:o.lang, optional:true},
    "/freebase/property_hints/disambiguator": null,
    "/freebase/property_hints/display_none": null
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(old) {
      if (remove.key && old.key) {
        return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.type, value:old.key.value, connect:"delete"}})
          .then(function(env) {
            // old id may no longer be valid since we deleted the key
            old.id = env.result.id;
            return old;
          });
      }
      else if (! (o.key == null || old.key.value == o.key)) {
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
      return old;
    })
    .then(function(old) {
      var update = {
        guid: old.guid,
        type: "/type/property"
      };
      if (remove.name && old.name) {
        update.name = {value:old.name.value, lang:old.name.lang, connect:"delete"};
      }
      else if (o.name != null) {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }

      if (remove.expected_type && old.expected_type) {
        update.expected_type = {id:old.expected_type, connect:"delete"};
      }
      else if (o.expected_type != null) {
        update.expected_type = {id:o.expected_type, connect:"update"};
      }

      if (remove.unit && old.unit) {
        update.unit = {id:old.unit, connect:"delete"};
      }
      else if (o.unit != null) {
        update.unit = {id:o.unit, connect:"update"};
      }

      if (remove.unique && old.unique != null) {
        update.unique = {value:old.unique, connect:"delete"};
      }
      else if (o.unique != null) {
        update.unique = {value:o.unique, connect:"update"};
      }

      if (remove.description && old["/freebase/documented_object/tip"]) {
        update["/freebase/documented_object/tip"] = {value:old["/freebase/documented_object/tip"].value, lang:o.lang, connect:"delete"};
      }
      else if (o.description != null) {
        update["/freebase/documented_object/tip"] = {value:o.description, lang:o.lang, connect:"update"};
      }

      if (remove.disambiguator && old["/freebase/property_hints/disambiguator"] != null) {
        update["/freebase/property_hints/disambiguator"] = {value:update["/freebase/property_hints/disambiguator"], connect:"delete"};
      }
      else if (o.disambiguator != null) {
        update["/freebase/property_hints/disambiguator"] = {value:o.disambiguator, connect:"update"};
      }

      if (remove.hidden &&  old["/freebase/property_hints/display_none"] != null) {
        update["/freebase/property_hints/display_none"] = {value:update["/freebase/property_hints/display_none"], connect:"delete"};
      }
      else if (o.hidden != null) {
        update["/freebase/property_hints/display_none"] = {value:o.hidden, connect:"update"};
      }

      var d = old.id;
      var keys = ["name", "expected_type", "unit", "unique",
                  "/freebase/documented_object/tip", "/freebase/property_hints/disambiguator",
                 "/freebase/property_hints/display_none"];
      for (var i=0,l=keys.length; i<l; i++) {
        if (keys[i] in update) {
          d = freebase.mqlwrite(update)
            .then(function(env) {
              return old.id;
            });
          break;
        }
      }
      return d;
    });
};
