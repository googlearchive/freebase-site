var mf = acre.require("MANIFEST").MF;
var h = mf.require("core", "helpers");
var edit = mf.require("domain_editcomponents");
var dc = mf.require("domain_components");
var update_domain = mf.require("queries", "update_domain");
var create_type = mf.require("queries", "create_type");
var delete_type = mf.require("queries", "delete_type");
var update_type = mf.require("queries", "update_type");
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
          html: acre.markup.stringify(edit.domain_settings_form(domain))
        };
      });
  },

  domain_settings_submit: function(args) {
    var update_domain_options = h.extend({}, args, {mqlkey_quote:true, empty_delete:true});
    return update_domain.update_domain(update_domain_options)
      .then(function(updated_id) {
        return {
          location: h.url_for("schema", "domain", null, updated_id)
        };
      });
  },

  add_type_begin: function(args) {
    return {
      html: acre.markup.stringify(edit.add_type_form(args.id, args.role))
    };
  },

  add_type_submit: function(args) {
    var create_type_options = h.extend({}, args, {mqlkey_quote:true, empty_delete:false});

    return create_type.create_type(create_type_options)
      .then(function(result) {
        var created = {name:args.name, id: result.id, properties: 0, instance_count: 0, blurb: args.description};
        created.role = args.role;
        return {
          html: acre.markup.stringify(dc.domain_type_row(created))
        };
      });
  },

  delete_type_submit: function(args) {
    // delete_type
    return delete_type.delete_type(args.id, args.user, false, true)
      .then(function([type_info, result]) {
        return {
          html: acre.markup.stringify(edit.delete_type_result(type_info))
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
          html: acre.markup.stringify(dc.domain_type_row(type))
        };
      });
  },

  edit_type_begin: function(args) {
    return queries.minimal_type(args.id)
    .then(function(type) {
      return {
        html: acre.markup.stringify(edit.edit_type_form(type))
      };
    });
  },

  edit_type_submit: function(args) {
    var update_type_options = h.extend({}, args, {mqlkey_quote:true, empty_delete:true});
    return update_type.update_type(update_type_options)
      .then(function(updated_id) {
        return queries.minimal_type(updated_id);
      })
      .then(function(type) {
        return {
          html: acre.markup.stringify(dc.domain_type_row(type))
        };
      });
  }
};

// required args and authorization
api.domain_settings_begin.args = ["id"]; // domain id
api.domain_settings_begin.auth = true;

api.domain_settings_submit.args = ["id", "name", "namespace", "key"]; // domain id
api.domain_settings_submit.auth = true;

api.add_type_begin.args = ["id"]; // domain id, mediator (optional)
api.add_type_begin.auth = true;

api.add_type_submit.args = ["domain", "name", "key"];
api.add_type_submit.auth = true;

api.delete_type_submit.args = ["id", "user"]; // type id, user id
api.delete_type_submit.auth = true;

api.undo_delete_type_submit.args = ["type_info"]; // JSON @see /freebase/site/queries/delete_type
api.undo_delete_type_submit.auth = true;

api.edit_type_begin.args = ["id"]; // type id
api.edit_type_begin.auth = true;

api.edit_type_submit.args = ["id", "domain", "name", "key"];
api.edit_type_submit.auth = true;
