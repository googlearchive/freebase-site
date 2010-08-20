var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var validators = mf.require("validator", "validators");

/**
 * Update an existing property values (name, key, expected_type, etc.)
 *
 * @param o:Object (required) - options specifying the updated values. @see validate_options
 */
function update_property(options) {
  var o;
  try {
    o = {
      // required
      type: validators.MqlId(options.type, {required:true}).to_js(),
      id: validators.MqlId(options.id, {required:true}).to_js(),

      // optional
      name: validators.String(options.name, {if_empty:null}).to_js(),
      key: validators.String(options.key, {if_empty:null}).to_js(),
      expected_type: validators.MqlId(options.expected_type, {if_empty:null}).to_js(),
      unit: validators.MqlId(options.unit, {if_empty:null}).to_js(),
      description: validators.String(options.description, {if_empty:null}).to_js(),
      disambiguator: validators.StringBool(options.disambiguator, {if_empty:null}).to_js(),
      unique: validators.StringBool(options.unique, {if_empty:null}).to_js(),
      hidden: validators.StringBool(options.hidden, {if_empty:null}).to_js(),

      // default lang for text is /lang/en
      lang: validators.MqlId(options.lang, {if_empty:"/lang/en"}).to_js(),

      // if TRUE, acre.freebase.mqlkey_quote key. Default is FALSE
      mqlkey_quote: validators.StringBool(options.mqlkey_quote, {if_empty:false}).to_js(),

      // if TRUE, name, key, ect, unit, description, disambiguator, unique, hidden is deleted if empty. Default is FALSE
      empty_delete: validators.StringBool(options.empty_delete, {if_empty:false}).to_js()
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }
  if (o.mqlkey_quote) {
    o.key = acre.freebase.mqlkey_quote(o.key);
  }

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
      if (o.key === null) {
        if (o.empty_delete && old.key) {
          return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.type, value:old.key.value, connect:"delete"}})
            .then(function(env) {
              // old id may no longer be valid since we deleted the key
              old.id = env.result.id;
              return old;
            });
        }
      }
      else if (old.key.value !== o.key) {
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
      if (o.name === null) {
        if (o.empty_delete && old.name) {
          update.name = {value:old.name.value, lang:o.ang, connect:"delete"};
        }
      }
      else {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }

      if (o.expected_type === null) {
        if (o.empty_delete && old.expected_type) {
          update.expected_type = {id:old.expected_type, connect:"delete"};
        }
      }
      else {
        update.expected_type = {id:o.expected_type, connect:"update"};
      }

      if (o.unit === null) {
        if (o.empty_delete && old.unit) {
          update.unit = {id:old.unit, connect:"delete"};
        }
      }
      else {
        update.unit = {id:o.unit, connect:"update"};
      }

      if (o.unique === null) {
        if (o.empty_delete && old.unique != null) {
          update.unique = {value:old.unique, connect:"delete"};
        }
      }
      else {
        update.unique = {value:o.unique, connect:"update"};
      }

      if (o.description === null) {
        if (o.empty_delete && old["/freebase/documented_object/tip"]) {
          update["/freebase/documented_object/tip"] = {value:old["/freebase/documented_object/tip"].value, lang:o.lang, connect:"delete"};
        }
      }
      else {
        update["/freebase/documented_object/tip"] = {value:o.description, lang:o.lang, connect:"update"};
      }

      if (o.disambiguator === null) {
        if (o.empty_delete && old["/freebase/property_hints/disambiguator"] != null) {
          update["/freebase/property_hints/disambiguator"] = {value:update["/freebase/property_hints/disambiguator"], connect:"delete"};
        }
      }
      else {
        update["/freebase/property_hints/disambiguator"] = {value:o.disambiguator, connect:"update"};
      }

      if (o.hidden === null) {
        if (o.empty_delete && old["/freebase/property_hints/display_none"] != null) {
          update["/freebase/property_hints/display_none"] = {value:update["/freebase/property_hints/display_none"], connect:"delete"};
        }
      }
      else {
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
