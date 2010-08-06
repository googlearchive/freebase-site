
var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var edit = mf.require("editcomponents");
var ServiceError = mf.require("core", "service").lib.ServiceError;
var create_type = mf.require("queries", "create_type").create_type;
var queries = mf.require("queries");
var t = mf.require("templates");

var api = {
  get_type_properties: function(args) {
    return queries.type_properties(args.id)
      .then(function(props) {
        return {
          html: acre.markup.stringify(t.native_properties(props, args.id))
        };
      });
  },

  get_incoming_from_commons: function(args) {
    return queries.incoming_from_commons(args.id, args.exclude_domain)
      .then(function(props) {
        return {
          html: acre.markup.stringify(t.incoming_props_tbody(props))
        };
      });
  },

  get_incoming_from_bases: function(args) {
    return queries.incoming_from_bases(args.id, args.exclude_domain)
      .then(function(props) {
        return {
          html: acre.markup.stringify(t.incoming_props_tbody(props))
        };
      });
  },

  add_new_type_begin: function(args) {
    return {
      html: acre.markup.stringify(edit.add_new_type_form(args.id, args.cvt == 1))
    };
  },

  add_new_type_submit: function(args) {
    var create_type_options = h.extend({}, args, {mqlkey_quote:true});

    return create_type(create_type_options)
      .then(function(result) {
        var created = {name:args.name, id: result.id, properties: 0, instance_count: 0, blurb: args.description};
        return {
          html: acre.markup.stringify(t.domain_type_row(created))
        };
      });
  }
};

// required args and authorization
api.get_type_properties.args = ["id"]; // type id

api.get_incoming_from_commons.args = ["id"]; // type id, exclude_domain (ptional)

api.get_incoming_from_bases.args = ["id"]; // type id, exclude_domain (ptional)

api.add_new_type_begin.args = ["id"]; // domain id, cvt (optional)
api.add_new_type_begin.auth = true;

api.add_new_type_submit.args = ["domain", "name", "key", "typehint", "description"];
api.add_new_type_submit.auth = true;

function main(scope) {
  if (h.is_client()) {
    acre.response.set_cache_policy('fast');
  }
  var service = mf.require("core", "service");
  service.main(scope, api);
};

if (acre.current_script == acre.request.script) {
  main(this);
}
