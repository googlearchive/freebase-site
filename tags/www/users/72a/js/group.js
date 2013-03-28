/*
 * Copyright 2012, Google Inc.
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

(function($, fb, propbox, formlib) {

  var group = fb.group = {

    init: function() {
      propbox.init_menus();
      group.check_remaining_users($("tbody"));
    },

    /**
    * ADD USER
    **/
    add_user: function(e) {
      var trigger = $(this);
      group.add_user_begin(trigger, trigger.parents("table:first").find("tbody:first"));
      return false;
    },

    add_user_begin: function(trigger, body) {
      var md = body.metadata();
      if (!md.id) {
        console.error("Missing usergroup id.");
        return false;
      }
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("add_user_begin.ajax"),
        data: {id: md.id},
        onsuccess: function(data) {
          var html = $(data.result.html);
          var edit_row = $(".edit-row", html);
          var submit_row = $(".edit-row-submit", html);
          var event_prefix = "fb.group.add_user.";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: group.add_user_init,
            validate: group.add_user_validate,
            submit: group.add_user_submit,
            reset: group.add_user_reset,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("edit_group_submit.ajax")
            },
            // jQuery objects
            trigger: trigger,
            body: body,
            edit_row: edit_row,
            submit_row: submit_row
          };
          formlib.init_inline_add_form(options);
        }
      }));
    },

    add_user_init: function(options) {
      var md = options.body.metadata();
      var user = $(":input[name=user]", options.edit_row);
      propbox.init(null, {
        id: md.id,
        base_ajax_url: fb.h.ajax_url("lib/propbox"),
        base_static_url: fb.h.static_url("lib/propbox"),
        suggest_impl: fb.suggest_options,
        lang: fb.lang || "/lang/en"
      });
      propbox.edit.init_data_inputs(options);
      user.focus();
    },

    add_user_validate: function(options) {
      return true;
    },

    add_user_submit: function(options, ajax_options) {
      var md = options.body.metadata();
      var user = $(":input[name=user]", options.edit_row).data("data.suggest");
      ajax_options.data.type = md.type;
      ajax_options.data.o = JSON.stringify({
        id: user.id,
        connect: "insert"
      });
      $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
          var new_row = $(data.result.html);
          formlib.success_inline_add_form(options, new_row);
          propbox.init_menus(new_row, true);
          $(".edit", new_row).show();
          group.check_remaining_users(options.body);
        }
      }));
    },

    add_user_reset: function(options) {
      var user = $(":input[name=user]", options.edit_row);
      user.val("").focus().trigger("textchange");
    },


    /**
    * REMOVE USER
    **/
    remove_user: function(context) {
      var user_row = $(context).parents(".submenu").data("headmenu").parents(".data-row:first");
      group.remove_user_begin(user_row, user_row.parents("table:first").find("tbody:first"));
      return false;
    },
    
    remove_user_begin: function(user_row, body) {
      var md = body.metadata();
      var user = user_row.metadata();
      $.ajax($.extend(formlib.default_submit_ajax_options(), {
        url: fb.h.ajax_url("edit_group_submit.ajax"),
        data: {
          s: md.id,
          p: "/type/usergroup/member",
          o: JSON.stringify({
            id: user.id,
            connect: "delete"
          })
        },
        onsuccess: function(data) {
          var msg_row = $(data.result.html);
          formlib.success_inline_delete(user_row, msg_row, function() {
            $.ajax($.extend(formlib.default_submit_ajax_options(),  {
              url: fb.h.ajax_url("edit_group_submit.ajax"),
              data: {
                s: md.id,
                p: "/type/usergroup/member",
                o: JSON.stringify({
                  id: user.id,
                  connect: "insert"
                })
              },
              onsuccess: function(data) {
                formlib.success_inline_delete_undo(msg_row);
              }
            }));
          });
          group.check_remaining_users(body);
        }
      }));
    },

    check_remaining_users: function(bodies) {
      bodies.each(function(body) {
        var user_rows = $(".data-row", body).not(".old-row");
        if (user_rows.length == 1) {
          $(".combo-menu", user_rows).hide();
        } else {
          $(".combo-menu", user_rows).show();
        }
      });
    }

  };

  $(group.init);

})(jQuery, window.freebase, window.propbox, window.formlib);
