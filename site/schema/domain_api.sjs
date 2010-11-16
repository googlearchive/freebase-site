/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
var delete_domain = mf.require("delete_domain");

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

  delete_domain_submit: function(args) {
    return delete_domain.delete_domain(args.id, args.user)
      .then(function(deleted) {
        return {
          location: h.url_for("schema")
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

api.delete_domain_submit.args = ["id", "user"];  // domain id, user id
api.delete_domain_submit.auth = true;
api.delete_domain_submit.method = "POST";

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
