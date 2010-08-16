var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var queries = mf.require("queries");
var tc = mf.require("type_components");
var edit = mf.require("type_editcomponents");
var create_property = mf.require("queries", "create_property");

var api = {
  get_type_properties: function(args) {
    return queries.type_properties(args.id)
      .then(function(props) {
        return {
          html: acre.markup.stringify(tc.native_properties(props, args.id))
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

  add_property_begin: function(args) {
    return {
      html: acre.markup.stringify(edit.add_property_form(args.id))
    };
  },

  add_property_submit: function(args) {
    var create_property_options = h.extend({}, args, {mqlkey_quote:true});
    return create_property.create_property(create_property_options)
      .then(function(created) {
        return queries.property(created.id);
      })
      .then(function(prop) {
        return {
          html: acre.markup.stringify(tc.type_property_row(prop, args.type))
        };
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

api.add_property_begin.args = ["id"]; // type id
api.add_property_begin.auth = true;

api.add_property_submit.args = ["type", "name", "key", "expected_type"];
api.add_property_submit.auth = true;
