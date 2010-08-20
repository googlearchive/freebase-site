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
      type: validators.MqlId(options.type, {required:true}).to_js(),
      id: validators.MqlId(options.id, {required:true}).to_js(),
      name: validators.String(options.name, {if_empty:""}).to_js(),
      key: validators.String(options.key, {if_empty:""}).to_js(),
      expected_type: validators.MqlId(options.expected_type, {if_empty:""}).to_js(),
      unit: validators.MqlId(options.unit, {if_empty:""}).to_js(),
      description: validators.String(options.description, {if_empty:""}).to_js(),
      disambiguator: validators.StringBool(options.disambiguator, {if_empty:false}).to_js(),
      unique: validators.StringBool(options.unique, {if_empty:false}).to_js(),
      hidden: validators.StringBool(options.hidden, {if_empty:false}).to_js(),
      mqlkey_quote: validators.StringBool(options.mqlkey_quote, {if_empty:false}).to_js(),
      lang: validators.MqlId(options.lang, {if_empty:"/lang/en"}).to_js()
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
