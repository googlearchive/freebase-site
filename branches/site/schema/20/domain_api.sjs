//
// i18n'ized
//
var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");
var editcomponents = mf.require("domain_editcomponents");
var components = mf.require("domain_components");
var validators = mf.require("validator", "validators");

var create_type = mf.require("create_type");
var delete_type = mf.require("delete_type");
var update_type = mf.require("update_type");

var update_domain = mf.require("update_domain");

var queries = mf.require("queries");
var freebase = mf.require("promise", "apis").freebase;

var api = {

  domain_settings_begin: function(args) {
    return queries.minimal_domain(args.id)
      .then(function(domain) {
        // choose the best key
        var key = domain.key[0];
        for (var i=0,l=domain.key.length; i<l; i++) {
          var k = domain.key[i];
          if ((k.namespace + "/" + k.value) === args.id) {
            key = k;
            break;
          }
        }
        domain.key = key;

        // does the user have permission to change the key?
        var q = {
          id: key.namespace,
          permission: [{permits: [{member: {id: acre.freebase.get_user_info().id}}]}]
        };
        return freebase.mqlread(q)
          .then(function(env) {
              if (env.result) {
                domain.key.permitted = true;
              }
              return domain;
            });
      })
      .then(function(domain) {
        return {
          html: acre.markup.stringify(editcomponents.domain_settings_form(domain))
        };
      });
  },

  domain_settings_submit: function(args) {
    var update_domain_options = h.extend({}, args);
    // if description is empty, remove from domain
    if (!args.description) {
      update_domain_options.remove = ["description"];
    }
    return update_domain.update_domain(update_domain_options)
      .then(function(updated_id) {
        return {
          location: h.url_for("schema", null, null, updated_id)
        };
      });
  },

  add_type_begin: function(args) {
    var mediator = validators.StringBool(args, "mediator", {if_empty:false});
    return {
      html: acre.markup.stringify(editcomponents.add_type_form(args.id, mediator))
    };
  },

  add_type_submit: function(args) {
    var create_type_options = h.extend({}, args);
    return create_type.create_type(create_type_options)
      .then(function(result) {
        return queries.minimal_type(result.id);
      })
      .then(function(type) {
        return {
          html: acre.markup.stringify(components.domain_type_row(type))
        };
      });
  },

  delete_type_submit: function(args) {
    // delete_type
    return delete_type.delete_type(args.id, args.user, false, true)
      .then(function([type_info, result]) {
        return {
          html: acre.markup.stringify(editcomponents.delete_type_result(type_info))
        };
      });
  },

  undo_delete_type_submit: function(args) {
    // undo delete_type
    var type_info = JSON.parse(args.type_info);
    return delete_type.undo(type_info)
      .then(function([info, result]) {
         return queries.minimal_type(type_info.id);
      })
      .then(function(type) {
        return {
          html: acre.markup.stringify(components.domain_type_row(type))
        };
      });
  },

  edit_type_begin: function(args) {
    return queries.minimal_type(args.id)
    .then(function(type) {
      return {
        html: acre.markup.stringify(editcomponents.edit_type_form(type))
      };
    });
  },

  edit_type_submit: function(args) {
    var update_type_options = h.extend({}, args);
    // if description is empty, delete from type
    var remove = [];
    if (!args.description) {
      remove.push("description");
    }
    update_type_options.remove = remove;
    return update_type.update_type(update_type_options)
      .then(function(updated_id) {
        return queries.minimal_type(updated_id);
      })
      .then(function(type) {
        return {
          html: acre.markup.stringify(components.domain_type_row(type))
        };
      });
  }
};

// required args and authorization
api.domain_settings_begin.args = ["id"]; // domain id
api.domain_settings_begin.auth = true;

api.domain_settings_submit.args = ["id", "name", "namespace", "key", "description", "lang"]; // domain id
api.domain_settings_submit.auth = true;
api.domain_settings_submit.method = "POST";

api.add_type_begin.args = ["id"]; // domain id, mediator (optional)
api.add_type_begin.auth = true;

api.add_type_submit.args = ["domain", "name", "key", "description", "mediator", "enumeration", "lang"];
api.add_type_submit.auth = true;
api.add_type_submit.method = "POST";

api.delete_type_submit.args = ["id", "user"]; // type id, user id
api.delete_type_submit.auth = true;
api.delete_type_submit.method = "POST";

api.undo_delete_type_submit.args = ["type_info"]; // JSON @see /freebase/site/queries/delete_type
api.undo_delete_type_submit.auth = true;
api.undo_delete_type_submit.method = "POST";

api.edit_type_begin.args = ["id"]; // type id
api.edit_type_begin.auth = true;

api.edit_type_submit.args = ["domain", "name", "key", "description", "enumeration", "lang"];
api.edit_type_submit.auth = true;
api.edit_type_submit.method = "POST";
