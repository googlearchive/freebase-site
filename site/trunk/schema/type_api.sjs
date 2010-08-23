var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var queries = mf.require("queries");
var tc = mf.require("type_components");
var edit = mf.require("type_editcomponents");
var create_property = mf.require("queries", "create_property");
var delete_property = mf.require("queries", "delete_property");
var update_property = mf.require("queries", "update_property");
var update_type = mf.require("queries", "update_type");
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;

var api = {
  get_type_properties: function(args) {
    return queries.type_properties(args.id)
      .then(function(type) {
        return {
          html: acre.markup.stringify(tc.native_properties(type.properties, args.id))
        };
      });
  },

  get_incoming_from_commons: function(args) {
    return queries.incoming_from_commons(args.id, args.exclude_domain)
      .then(function(props) {
        return {
          html: acre.markup.stringify(tc.incoming_props_tbody(props))
        };
      });
  },

  get_incoming_from_bases: function(args) {
    return queries.incoming_from_bases(args.id, args.exclude_domain)
      .then(function(props) {
        return {
          html: acre.markup.stringify(tc.incoming_props_tbody(props))
        };
      });
  },

  type_settings_begin: function(args) {
    return queries.minimal_type(args.id)
      .then(function(type) {
        // choose the best key
        var key = type.key[0];
        for (var i=0,l=type.key.length; i<l; i++) {
          var k = type.key[i];
          if (k.namespace === type.domain.id) {
            key = k;
            break;
          }
        }
        type.key = key;
        return {
          html: acre.markup.stringify(edit.type_settings_form(type))
        };
      });
  },

  type_settings_submit: function(args) {
    var update_type_options = h.extend({}, args, {mqlkey_quote:true, empty_delete:true});
    return update_type.update_type(update_type_options)
      .then(function(updated_id) {
         return {
          location: h.url_for("schema", "type", null, updated_id)
        };
      });
  },

  add_property_begin: function(args) {
    return {
      html: acre.markup.stringify(edit.add_property_form(args.id))
    };
  },

  add_property_submit: function(args) {
    var create_property_options = h.extend({}, args, {mqlkey_quote:true, empty_delete:false});
    return create_property.create_property(create_property_options)
      .then(function(created) {
        return queries.property(created.id);
      })
      .then(function(prop) {
        return {
          html: acre.markup.stringify(tc.type_property_row(prop))
        };
      });
  },

  delete_property_submit: function(args) {
    // delete_property
    return delete_property.delete_property(args.id, args.user, false, true)
      .then(function([prop_info, result]) {
        return {
          html: acre.markup.stringify(edit.delete_property_result(prop_info))
        };
      });
  },

  undo_delete_property_submit: function(args) {
    // undo delete_type
    var prop_info = JSON.parse(args.prop_info);
    return delete_property.undo(prop_info)
      .then(function([info, result]) {
         return queries.property(prop_info.id);
      })
      .then(function(prop) {
        return {
          html: acre.markup.stringify(tc.type_property_row(prop))
        };
      });
  },

  edit_property_begin: function(args) {
    var promises = [];
    promises.push(queries.property(args.id));
    promises.push(mf.require("queries", "property").used(args.id));
    return deferred.all(promises)
      .then(function(results) {
        var prop = results[0];
        prop.used = results[1];
        return {html:acre.markup.stringify(edit.edit_property_form(prop))};
      });
  },

  edit_property_submit: function(args) {
    var update_prop_options = h.extend({}, args, {mqlkey_quote:true, empty_delete:true});
    return update_property.update_property(update_prop_options)
      .then(function(updated_id) {
        return queries.property(updated_id);
      })
      .then(function(prop) {
        return {
          html: acre.markup.stringify(tc.type_property_row(prop))
        };
      });
  },

  add_included_type_begin: function(args) {
    return {
      html: acre.markup.stringify(edit.add_included_type_form(args.id))
    };
  },

  add_included_type_submit: function(args) {
    var q = {
      id: args.type,
      "/freebase/type_hints/included_types": {id:args.included_type, connect:"insert"}
    };
    return freebase.mqlwrite(q)
      .then(function(env) {
        return env.result;
      })
      .then(function(result) {
        var present = result["/freebase/type_hints/included_types"].connect === "present";
        if (present) {
          return deferred.rejected(args.included_type + " is already included");
        }
        else {
          return freebase.mqlread({id:args.included_type, name:null})
            .then(function(env) {
              return {
                html: acre.markup.stringify(tc.included_type_thead(env.result))
              };
            });
        }
      });
  }
};

// required args and authorization
api.get_type_properties.args = ["id"]; // type id
api.get_type_properties.cache_policy = "fast";

api.get_incoming_from_commons.args = ["id"]; // type id, exclude_domain (optional)
api.get_incoming_from_commons.cache_policy = "fast";

api.get_incoming_from_bases.args = ["id"]; // type id, exclude_domain (optional)
api.get_incoming_from_commons.cache_policy = "fast";

api.type_settings_begin.args = ["id"]; // type id
api.type_settings_begin.auth = true;

api.add_property_begin.args = ["id"]; // type id
api.add_property_begin.auth = true;

api.add_property_submit.args = ["type", "name", "key", "expected_type"];
api.add_property_submit.auth = true;

api.delete_property_submit.args = ["id", "user"]; // property id, user id
api.delete_property_submit.auth = true;

api.undo_delete_property_submit.args = ["prop_info"]; // JSON @see /freebase/site/queries/delete_property
api.undo_delete_property_submit.auth = true;

api.edit_property_begin.args = ["id"]; // property id
api.edit_property_begin.auth = true;

api.edit_property_submit.args = ["id", "type", "name", "key", "expected_type"];
api.edit_property_submit.auth = true;

api.add_included_type_begin.args = ["id"]; // type id
api.add_included_type_begin.auth = true;

api.add_included_type_submit.args = ["type", "included_type"]; // type id, id of type to include
api.add_included_type_submit.auth = true;
