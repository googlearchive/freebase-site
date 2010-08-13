var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");
var tc = mf.require("type_components");

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
  }
};

// required args and authorization
api.get_type_properties.args = ["id"]; // type id
api.get_type_properties.cache_policy = "fast";

api.get_incoming_from_commons.args = ["id"]; // type id, exclude_domain (ptional)
api.get_incoming_from_commons.cache_policy = "fast";

api.get_incoming_from_bases.args = ["id"]; // type id, exclude_domain (ptional)
api.get_incoming_from_commons.cache_policy = "fast";
