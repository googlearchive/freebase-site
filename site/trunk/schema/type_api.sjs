var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");
var components = mf.require("type_components");
var editcomponents = mf.require("type_editcomponents");

var create_type = mf.require("create_type");
var update_type = mf.require("update_type");

var create_property = mf.require("create_property");
var delete_property = mf.require("delete_property");
var update_property = mf.require("update_property");

var create_topic = mf.require("queries", "create_topic");

var h = mf.require("core", "helpers");
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;

var api = {
  get_type_properties: function(args) {
    return queries.type_properties(args.id)
      .then(function(type) {
        return {
          html: acre.markup.stringify(components.native_properties(type.properties, args.id))
        };
      });
  },

  get_incoming_from_commons: function(args) {
    var promises = [];
    promises.push(queries.incoming_from_commons(args.id, args.exclude_domain));
    promises.push(queries.type_role(args.id));
    return deferred.all(promises)
      .then(function([props, role]) {
        return {
          html: acre.markup.stringify(components.incoming_props_tbody(props, role !== "cvt"))
        };
      });
  },

  get_incoming_from_bases: function(args) {
    var promises = [];
    promises.push(queries.incoming_from_bases(args.id, args.exclude_domain));
    promises.push(queries.type_role(args.id));
    return deferred.all(promises)
      .then(function([props, role]) {
        return {
          html: acre.markup.stringify(components.incoming_props_tbody(props, role !== "cvt"))
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
          html: acre.markup.stringify(editcomponents.type_settings_form(type))
        };
      });
  },

  type_settings_submit: function(args) {
    var update_type_options = h.extend({}, args, {mqlkey_quote:true});
    // if description is empty, delete from type
    if (!args.description) {
      update_type_options.remove = ["description"];
    }
    return update_type.update_type(update_type_options)
      .then(function(updated_id) {
         return {
          location: h.url_for("schema", "type", null, updated_id)
        };
      });
  },

  type_role_begin: function(args) {
    var promises = [];
    // check if type has any properties that are reciprocated
    promises.push(queries.minimal_type(args.id, {
      properties: [{
        optional: true,
        id: null,
        type: "/type/property",
        master_property: null,
        reverse_property: null
      }]
    }));
    // is the type being used?
    promises.push(queries.type_used(args.id));
    return deferred.all(promises)
      .then(function(result) {
        var type = result[0];
        type.used = result[1];
        return type;
      })
      .then(function(type) {
        // are there any return link properties?
        type.return_links = 0;
        for (var i=0,l=type.properties.length; i<l; i++) {
          var prop = type.properties[i];
          if (prop.master_property || prop.reverse_property) {
            type.return_links++;
          }
        }
        type.properties = type.properties.length;
        return type;
      })
      .then(function(type) {
        return {
          html: acre.markup.stringify(editcomponents.type_role_form(type))
        };
      });
  },

  type_role_submit: function(args) {
    var update_type_options = h.extend({}, args);
    // if description is empty, delete from type
    if (!args.role) {
      update_type_options.remove = ["role"];
    }
    return update_type.update_type(update_type_options)
      .then(function(updated_id) {
         return {
          location: h.url_for("schema", "type", null, updated_id)
        };
      });
  },

  add_property_begin: function(args) {
    return {
      html: acre.markup.stringify(editcomponents.add_property_form(args.id))
    };
  },

  add_property_submit: function(args) {
    var promise;
    if (!args.expected_type && args.expected_type_new) {
      // do we need to create a new expected type?
      promise = freebase.mqlread({id: args.type, "/type/type/domain": null})
        .then(function(env) {
          var create_type_options = {
            domain: env.result["/type/type/domain"],
            name: args.expected_type_new,
            key: args.expected_type_new.toLowerCase(),
            mqlkey_quote: true
          };
          return create_type.create_type(create_type_options)
            .then(function(type) {
              args.expected_type = type.id;
              return args;
            });
        });
    }
    else {
      promise = deferred.resolved(args);
    }
    return promise
      .then(function(args) {
        var create_property_options = h.extend({}, args, {mqlkey_quote:true});
        return create_property.create_property(create_property_options)
          .then(function(created) {
            return queries.property(created.id);
          })
          .then(function(prop) {
            return {
              html: acre.markup.stringify(components.type_property_row(prop))
            };
          });
      });
  },

  delete_property_submit: function(args) {
    // delete_property
    return delete_property.delete_property(args.id, args.user, false, true)
      .then(function([prop_info, result]) {
        return {
          html: acre.markup.stringify(editcomponents.delete_property_result(prop_info))
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
          html: acre.markup.stringify(components.type_property_row(prop))
        };
      });
  },

  edit_property_begin: function(args) {
    var promises = [];
    promises.push(queries.property(args.id));
    promises.push(queries.property_used(args.id));
    return deferred.all(promises)
      .then(function(results) {
        var prop = results[0];
        prop.used = results[1];
        return {html:acre.markup.stringify(editcomponents.edit_property_form(prop))};
      });
  },

  edit_property_submit: function(args) {
    var promise;
    if (!args.expected_type && args.expected_type_new) {
      // do we need to create a new expected type?
      promise = freebase.mqlread({id: args.type, "/type/type/domain": null})
        .then(function(env) {
          var create_type_options = {
            domain: env.result["/type/type/domain"],
            name: args.expected_type_new,
            key: args.expected_type_new.toLowerCase(),
            mqlkey_quote: true
          };
          return create_type.create_type(create_type_options)
            .then(function(type) {
              args.expected_type = type.id;
              return args;
            });
        });
    }
    else {
      promise = deferred.resolved(args);
    }
    return promise
      .then(function(args) {
        var update_prop_options = h.extend({}, args, {mqlkey_quote:true});
        if (!args.description) {
          update_prop_options.remove = ["description"];
        }
        return update_property.update_property(update_prop_options)
          .then(function(updated_id) {
            return queries.property(updated_id);
          })
          .then(function(prop) {
            return {
              html: acre.markup.stringify(components.type_property_row(prop))
            };
          });
      });
  },

  add_included_type_begin: function(args) {
    return {
      html: acre.markup.stringify(editcomponents.add_included_type_form(args.id))
    };
  },

  add_included_type_submit: function(args) {
    var promises = [];
    promises.push(queries.included_types(args.included_type));
    promises.push(freebase.mqlread({id:args.included_type, name:null})
      .then(function(env) {
        return env.result;
      }));
    return deferred.all(promises)
      .then(function(result) {
        // include the included types of args.included_type + args.included_type
        var to_include = result[0].concat(result[1]);
        return to_include;
      })
      .then(function(to_include) {
        return queries.add_included_types(args.id, [t.id for each (t in to_include)])
          .then(function(included) {
            var inserted = [t.id for each (t in included) if (t.connect === "inserted")];
            if (inserted.length) {
              var types_by_id = {};
              to_include.forEach(function(type) {
                types_by_id[type.id] = type;
              });
              var html = [];
              inserted.forEach(function(type) {
                html.push(acre.markup.stringify(components.included_type_thead(args.id, types_by_id[type])));
              });
              return {
                html: html.join("")
              };
            }
            else {
              return deferred.rejected(args.included_type + " is already included");
            }
          });
      });
  },

  delete_included_type_submit: function(args) {
    return queries.delete_included_type(args.id, args.included_type)
      .then(function(result) {
        return {
          html: acre.markup.stringify(editcomponents.delete_included_type_result(args.id, args.included_type))
        };
      });
  },

  undo_delete_included_type_submit: function(args) {
    var promises = [];
    promises.push(queries.add_included_types(args.id, [args.included_type]));
    promises.push(freebase.mqlread({id:args.included_type, name:null})
      .then(function(env) {
        return env.result;
      }));

    return deferred.all(promises)
      .then(function(result) {
        return {
          html: acre.markup.stringify(components.included_type_thead(args.id, result[1]))
        };
      });
  },

  reverse_property_begin: function(args) {
    return queries.property(args.master)
      .then(function(master_prop) {
        return {
          html: acre.markup.stringify(editcomponents.reverse_property_form(args.id, master_prop))
        };
      });
  },

  delegate_property_begin: function(args) {
    var q = {
      id: args.id,
      type: "/type/property",
      expected_type: null,
      unique: null,
      unit: {optional: true, id: null, name: null}
    };
    return freebase.mqlread(q)
      .then(function(env) {
        return env.result;
      })
      .then(function(prop) {
        return {
          message: acre.markup.stringify(editcomponents.delegated_property_message(prop)),
          expected_type: prop.expected_type,
          unique: prop.unique,
          unit: prop.unit
        };
      });
  },

  add_instance_begin: function(args) {
    return {
      html: acre.markup.stringify(editcomponents.add_instance_form(args.id))
    };
  },

  add_instance_submit: function(args) {
    var promise;
    if (!args.id && args.name) {
      var create_topic_options = {name:args.name};
      promise = create_topic.create_topic(create_topic_options)
        .then(function(created) {
          args.id = created.id;
          return args;
        });
    }
    else {
      promise = deferred.resolved(args);
    }
    return promise
      .then(function(args) {
        return queries.add_instance(args.id, args.type);
      })
      .then(function() {
        return queries.minimal_topic(args.id, true);
      })
      .then(function(topic) {
        return {
          html: acre.markup.stringify(components.enumerated_topic_row(topic, args.type))
        };
      });
  },

  delete_instance_submit: function(args) {
    return queries.delete_instance(args.id, args.type)
      .then(function(result) {
        return queries.minimal_topic(args.id)
          .then(function(topic) {
            return {
              html: acre.markup.stringify(editcomponents.delete_instance_result(topic, args.type))
            };
          });
      });
  },

  undo_delete_instance_submit: function(args) {
    // just re-run add_instance_submit
    return api.add_instance_submit(args);
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

api.type_settings_submit.args = ["id", "name", "key", "description"]; // type id, name, key and description
api.type_settings_submit.auth = true;
api.type_settings_submit.method = "POST";

api.type_role_begin.args = ["id"]; // type id
api.type_role_begin.auth = true;

api.type_role_submit.args = ["id", "role"]; // type id, type role
api.type_role_submit.auth = true;
api.type_role_submit.method = "POST";

api.add_property_begin.args = ["id"]; // type id
api.add_property_begin.auth = true;

api.add_property_submit.args = ["type", "name", "key", "expected_type"];
api.add_property_submit.auth = true;
api.add_property_submit.method = "POST";

api.delete_property_submit.args = ["id", "user"]; // property id, user id
api.delete_property_submit.auth = true;
api.delete_property_submit.method = "POST";

api.undo_delete_property_submit.args = ["prop_info"]; // JSON @see /freebase/site/queries/delete_property
api.undo_delete_property_submit.auth = true;
api.undo_delete_property_submit.method = "POST";

api.edit_property_begin.args = ["id"]; // property id
api.edit_property_begin.auth = true;

api.edit_property_submit.args = ["id", "type", "name", "key", "expected_type"];
api.edit_property_submit.auth = true;

api.add_included_type_begin.args = ["id"]; // type id
api.add_included_type_begin.auth = true;

api.add_included_type_submit.args = ["id", "included_type"]; // type id, id of type to include
api.add_included_type_submit.auth = true;
api.add_included_type_submit.method = "POST";

api.delete_included_type_submit.args = ["id", "included_type"]; // type id, id of type to remove from included_type
api.delete_included_type_submit.auth = true;
api.delete_included_type_submit.method = "POST";

api.reverse_property_begin.args = ["id", "master"]; // type id, master property id
api.reverse_property_begin.auth = true;

api.delegate_property_begin.args = ["id"]; // property id
api.delegate_property_begin.auth = true;

api.add_instance_begin.args = ["id"]; // type id
api.add_instance_begin.auth = true;

api.add_instance_submit.args = ["id", "type"]; // topic id, type id, name (optional - topic name if create new topic)
api.add_instance_submit.auth = true;
api.add_instance_submit.method = "POST";

api.delete_instance_submit.args = ["id", "type"]; // topic id, type id
api.delete_instance_submit.auth = true;
api.delete_instance_submit.method = "POST";

api.undo_delete_instance_submit.args = ["id", "type"]; // topic id, type id
api.undo_delete_instance_submit.auth = true;
api.undo_delete_instance_submit.method = "POST";
