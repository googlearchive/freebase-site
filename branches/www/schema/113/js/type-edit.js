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

(function($, fb, formlib) {

  var te = fb.schema.type.edit = {

    /**
     * retrieve add_property form (ajax).
     */
    add_property_begin: function(table, type_id) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("add_property_begin.ajax"),    
        data: {id: type_id, lang:fb.lang},
        onsuccess: function(data) {
          var html = $(data.result.html);
          var edit_row = $(".edit-row", html);
          var submit_row = $(".edit-row-submit", html);
          var event_prefix = "fb.schema.type.add.property.";
          var options = {
            mode: "add",
            event_prefix: event_prefix,
            // callbacks
            init: te.init_property_form,
            validate: te.validate_property_form,
            submit: te.submit_property_form,
            reset: te.init_property_form,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("add_property_submit.ajax")
            },
            // jQuery objects
            body: $(">tbody:first", table),
            edit_row: edit_row,
            submit_row: submit_row
          };
          var tfoot = $("tfoot", table).hide();
          formlib.init_inline_add_form(options);
          edit_row.bind(event_prefix + "cancel", function() {
            tfoot.show();
          });         
        }
      }));
    },


    edit_property_begin: function(row, prop_id) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("edit_property_begin.ajax"),
        data: {id:prop_id, lang:fb.lang},
        onsuccess: function(data) {
          var html = $(data.result.html);
          var edit_row = $(".edit-row", html);
          var submit_row = $(".edit-row-submit", html);
          var event_prefix = "fb.schema.type.edit.property.";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: te.init_property_form,
            validate: te.validate_property_form,
            submit: te.submit_property_form,
            // submit ajax_options,
            ajax: {
              url: fb.h.ajax_url("edit_property_submit.ajax")
            },
            // jQuery objects
            row: row,
            edit_row: edit_row,
            submit_row: submit_row
          };
          formlib.init_inline_edit_form(options);
        }
      }));
    },

    /**
     * init property form
     */
    init_property_form: function(options) {
      var name = $("input[name=name]", options.edit_row);
      var key =  $("input[name=key]", options.edit_row);
      var expected_type_input = $("input[name=expected_type_input]", options.edit_row);
      var description = $("textarea[name=description]", options.edit_row);
      var disambiguator = $("input[name=disambiguator]", options.edit_row);
      var unique = $("input[name=unique]", options.edit_row);
      var hidden = $("input[name=hidden]", options.edit_row);

      // hidden inputs
      var type = $("input[name=type]", options.submit_row);
      var expected_type = $("input[name=expected_type]", options.submit_row);
      var expected_type_new = $("input[name=expected_type_new]", options.submit_row);
      var unit = $("input[name=unit]", options.submit_row);
      var enumeration = $("input[name=enumeration]", options.submit_row);

      if (options.mode === "add") {
        name.val("");
        key.val("");
        expected_type_input.val("");
        expected_type.val("");
        expected_type_new.val("");
        unit.val("");
        description.val("");
        $.each([disambiguator, unique, hidden], function(i, checkbox) {
          if (!checkbox.is(":disabled")) {
            checkbox.removeAttr("checked");
          }
        });
      }

      if (!options.edit_row.data("initialized")) {
        formlib.init_mqlkey(key, {
          source: name,
          namespace: type.val(),
          mqlread: fb.mqlread,
          schema: true
        });

        //
        // suggest expected_type
        //
        // this is a hacky way to get the domain id of the current context of the property form
        var domain = type.val().split("/");
        domain.pop();
        domain = domain.join("/");
        expected_type_input
          .suggest_expected_type($.extend(fb.suggest_options.expected_type(), {
            status: [
                "Start typing to get suggestions...", 
                "Searching...", 
                "Select an item from the list:"
            ],
            domain: domain,
            suggest_new: "Create new type"
          }))
          .bind("fb-select", function(e, data) {
            if (data.unit) {
              expected_type_input.val(data.id + " (" + data.unit.name + ")");
              expected_type.val(data.id);
              expected_type_new.val("");
              unit.val(data.unit.id);
            }
            else if (data.enumeration) { // /type/property/enumeration (namespace)
              expected_type_input.val(data.id + " (" + data.enumeration + ")");
              expected_type.val(data.id);
              expected_type_new.val("");
              enumeration.val(data.enumeration);
            }
            else {
              expected_type_input.val(data.id);
              expected_type.val(data.id);
              expected_type_new.val("");
              unit.val("");
              if (data.id === "/type/boolean") {
                // auto-check unique on /type/boolean
                $("input[name=unique]", options.edit_row).attr("checked", "checked");
              }
            }
            te.validate_property_form(options);
          })
          .bind("fb-textchange", function() {            
            expected_type.val("");
            expected_type_new.val("");
            unit.val("");
            formlib.disable_submit(options);
          })
          .bind("fb-select-new", function(e, val) {
            expected_type_new.val($.trim(val));
            expected_type.val("");
            unit.val("");
            te.validate_property_form(options);
          });

        // enter/escape key handler
        $(":input:not(textarea)", options.edit_row)
          .keypress(function(e) {
            if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
              options.edit_row.trigger(options.event_prefix + "submit");
            }
          })
          .keyup(function(e) {
            if (e.keyCode === 27) { // escape
              options.edit_row.trigger(options.event_prefix + "cancel");
            }
          });

        options.edit_row.bind("input, change", function() {
            te.validate_property_form(options);
        });

        options.edit_row.data("initialized", true);
      }
      name.focus();
    },

    /**
     * validate rows, if no errors submit
     */
    submit_property_form: function(options, ajax_options) {
      $.extend(ajax_options.data, {
        name: $("input[name=name]", options.edit_row).val(),
        key: $("input[name=key]", options.edit_row).val(),
        description: $("textarea[name=description]", options.edit_row).val(),
        disambiguator: $("input[name=disambiguator]", options.edit_row)
            .is(":checked") ? 1 : 0,
        unique: $(":input[name=unique]", options.edit_row)
            .is(":checked") ? 1 : 0,
        hidden: $(":input[name=hidden]", options.edit_row)
            .is(":checked") ? 1 : 0,
        deprecated: $(":input[name=deprecated]", options.edit_row)
            .is(":checked") ? 1 : 0,

        // hidden inputs
        type: $("input[name=type]", options.submit_row).val(),
        expected_type: $("input[name=expected_type]", options.submit_row)
            .val(),
        expected_type_new: $(
            "input[name=expected_type_new]", options.submit_row).val(),
        unit: $("input[name=unit]", options.submit_row).val(),
        enumeration: $("input[name=enumeration]", options.submit_row).val(),
        master_property: $("input[name=master_property]", options.submit_row)
            .val(),

        lang: fb.lang
      });


      $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
          var new_row = $(data.result.html);
          if (options.mode === "add") {
            formlib.success_inline_add_form(options, new_row);
          }
          else {
            formlib.success_inline_edit_form(options, new_row);
          }
          propbox.init_menus(new_row, true);
          $(".nicemenu .edit", new_row).show();

          var prop_table = $("#type-table table:first");
          te.toggle_reorder_link(prop_table);
        }
      }));
    },

    /**
     * validate row
     */
    validate_property_form: function(options) {
      var name = $.trim($("input[name=name]:visible", options.edit_row).val());
      if (name === "") {
        formlib.disable_submit(options);
        return false;
      }
      var key = $("input[name=key]", options.edit_row);
      if (key.is(".loading")) {
        formlib.disable_submit(options);
        return false;
      }
      else if (key.is(".invalid")) {
        formlib.disable_submit(options);
        return false;
      }
      var ect = $(":input[name=expected_type]", options.submit_row).val();
      var ect_new = $(":input[name=expected_type_new]", options.submit_row).val();
      if (ect === "" && ect_new === "") {
        formlib.disable_submit(options);
        return false;
      }
      formlib.enable_submit(options);
      return true;
    },

    /**
     * add included_type
     */
    add_included_type_begin: function(table, type_id) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("add_included_type_begin.ajax"),
        data: {id: type_id, lang:fb.lang},
        onsuccess: function(data) {
          var html = $(data.result.html);
          var edit_row = $(".edit-row", html);
          var submit_row = $(".edit-row-submit", html);
          var event_prefix = "fb.schema.type.add.included_type.";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: te.init_included_type_form,
            validate: te.validate_included_type_form,
            submit: te.submit_included_type_form,
            reset: te.init_included_type_form,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("add_included_type_submit.ajax")
            },
            // jQuery objects
            body: table,
            edit_row: edit_row,
            submit_row: submit_row
          };
          var tfoot = $("tfoot", table).hide();
          formlib.init_inline_add_form(options);
          edit_row.bind(event_prefix + "cancel", function() {
            tfoot.show();
          });
        }
      }));
    },

    init_included_type_form: function(options) {
      var included_type_input = 
          $("input[name=included_type_input]", options.edit_row).val("");
      var included_type = 
          $("input[name=included_type]", options.submit_row).val("");
      var included_type_new = 
          $("input[name=included_type_new]", options.submit_row).val("");

      if (!options.edit_row.data("initialized")) {
        included_type_input
          .suggest($.extend(fb.suggest_options.included_type(), {
            suggest_new: "Create new type"
          }))
          .bind("fb-select", function(e, data) {
            included_type_input.val(data.id);
            included_type.val(data.id);
            included_type_new.val("");
            formlib.enable_submit(options);
          })
          .bind("fb-textchange", function() {
            included_type.val("");
            included_type_new.val("");
            formlib.disable_submit(options);
          })
          .bind("fb-select-new", function(e, val) {
            included_type_new.val($.trim(val));
            included_type.val("");
            formlib.enable_submit(options);
          });

        // enter/escape key handler
        $(":input:not(textarea)", options.edit_row)
          .keypress(function(e) {
            if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
              options.edit_row.trigger(options.event_prefix + "submit");
            }
          })
          .keyup(function(e) {
            if (e.keyCode === 27) { // escape
              options.edit_row.trigger(options.event_prefix + "cancel");
            }
          });
        options.edit_row.data("initialized", true);
      }
      included_type_input.focus();
    },

    validate_included_type_form: function(options) {
      var included_type = $.trim(
          $(":input[name=included_type]", options.submit_row).val());
      var included_type_new = $.trim(
          $(":input[name=included_type_new]", options.submit_row).val());
      if (included_type === "" && included_type_new === "") {
        formlib.disable_submit(options);
        return false;
      }
      else {
        formlib.enable_submit(options);
        return true;
      }
    },

    submit_included_type_form: function(options, ajax_options) {
      $.extend(ajax_options.data, {
        included_type: $.trim(
            $(":input[name=included_type]", options.submit_row).val()),
        included_type_new: $.trim(
            $(":input[name=included_type_new]", options.submit_row).val())
      });

      $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
          var container = $("<table>");
          container.html(data.result.html);
          $(".tbody-header", container).each(function() {
            $(this).data("ajax", true).click(fb.schema.type.toggle);    
          });
          var tfoot = $("tfoot", options.body);
          tfoot.before($("thead", container));
          options.reset(options);
          $(">thead .edit", options.body).show();
          options.edit_row.trigger(options.event_prefix + "success");
        }
      }));
    },

    delete_included_type_begin: function(row, type_id, included_type_id) {
      $.ajax($.extend(formlib.default_submit_ajax_options(), {
        url: fb.h.ajax_url("delete_included_type_submit.ajax"),
        data: {id: type_id, included_type: included_type_id, lang:fb.lang},
        onsuccess: function(data) {
          var new_row = $(data.result.html);
          row.parent("thead").next("tbody:first").remove();
          formlib.success_inline_delete(row, new_row, function() {
            $.ajax($.extend(formlib.default_submit_ajax_options(), {
              url: fb.h.ajax_url("undo_delete_included_type_submit.ajax"),
              data: {id: type_id, included_type: included_type_id, lang:fb.lang},
              onsuccess: function(data) {
                // we need to re-get the body onclick
                $(".tbody-header", new_row)
                    .removeClass("expanded").data("ajax", true);
                formlib.success_inline_delete_undo(new_row);
              }
            }));
          });          
        }
      }));
    },

    reverse_property_begin: function(trigger, type_id, master_id) {
      var row = trigger
          .parents(".submenu").data("headmenu").parents(".data-row:first");

      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("reverse_property_begin.ajax"),
        data: {id: type_id, master: master_id, lang:fb.lang},
        onsuccess: function(data, status, xhr) {
          var html = $(data.result.html);   
          var edit_row = $(".edit-row", html);
          var submit_row = $(".edit-row-submit", html);
          var event_prefix = "fb.schema.type.reverse.property.";
          var options = {
            mode: "edit",
            event_prefix: event_prefix,
            // callbacks
            init: te.init_property_form,
            validate: te.validate_property_form,
            submit: te.submit_property_form,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("add_property_submit.ajax"),
              // override formlib default ajax success to call 
              // te.reverse_property_success after
              // te.submit_property_form
              success: function(data, status, xhr) {
                if (!formlib.check_ajax_success(data, status, xhr)) {
                  return this._error(xhr);
                }
                return te.reverse_property_success(options, data);
              }
            },
            trigger: trigger,
            row: row,
            edit_row: edit_row,
            submit_row: submit_row
          };
          formlib.init_inline_edit_form(options);
        }
      }));
    },

    reverse_property_success: function(options, data) {
      // add the new row to the main property table
      var new_row = $(data.result.html);
      var prop_table = $("#type-table table:first");
      var prop_body = $("> tbody", prop_table);
      prop_body.append(new_row);
      propbox.init_menus(new_row, true);
      $(".nicemenu .edit", new_row).show();
      te.toggle_reorder_link(prop_table);

      // remove the 'Create return link' menu item
      options.trigger.parents(".row-menu-item:first").remove();
      // remove the edit form
      options.edit_row.remove();
      options.submit_row.remove();
      // show the original row
      options.row.show();
    },

    /**
     * Add a topic to an enumerated type.
     */
    add_instance_begin: function(table, type_id) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("add_instance_begin.ajax"),
        data: {id: type_id, lang:fb.lang},
        onsuccess: function(data, status, xhr) {
          var html = $(data.result.html);
          var edit_row = $(".edit-row", html);
          var submit_row = $(".edit-row-submit", html);
          var event_prefix = "fb.schema.type.add.instance.";
          var options = {
            event_prefix: "fb.schema.type.add.instance.",
            // callbacks
            init: te.init_instance_form,
            validate: te.validate_instance_form,
            submit: te.submit_instance_form,
            reset: te.init_instance_form,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("add_instance_submit.ajax")
            },
            // jQuery objects
            body: $(">tbody:first", table),
            edit_row: edit_row,
            submit_row: submit_row
          };
          var tfoot = $("tfoot", table).hide();
          formlib.init_inline_add_form(options);
          edit_row.bind(event_prefix + "cancel", function() {
            tfoot.show();
          });
        }
      }));
    },

    init_instance_form: function(options) {
      var name = $("input[name=name]", options.edit_row).val("");
      var id =  $("input[name=id]", options.submit_row).val("");
      var suggest = name.data("suggest");
      if (!suggest) {
        name
          .suggest($.extend(fb.suggest_options.instance("/common/topic"), {
            suggest_new: "Create new"
          }))
          .bind("fb-select", function(e, data) {
            id.val(data.id);
            formlib.enable_submit(options);
          })
          .bind("fb-select-new", function() {
            id.val("");
            formlib.enable_submit(options);
          })
          .bind("fb-textchange", function() {
            id.val("");
            formlib.disable_submit(options);
          });

        // enter/escape key handler
        name
          .keypress(function(e) {
            if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
              options.edit_row.trigger(options.event_prefix + "submit");
            }
          })
          .keyup(function(e) {
            if (e.keyCode === 27) { // escape
              options.edit_row.trigger(options.event_prefix + "cancel");
            }
          });
      }
      name.focus();
    },

    validate_instance_form: function(options) {
      var name = $.trim($(":input[name=name]", options.edit_row).val());
      var id = $(":input[name=id]", options.submit_row).val();
      if (name === "" && id === "") {
        formlib.disable_submit(options);
        return false;
      }
      else {
        formlib.enable_submit(options);
        return true;
      }
    },

    submit_instance_form: function(options, ajax_options) {
      $.extend(ajax_options.data, {
        name: $.trim($(":input[name=name]", options.edit_row)),
        id: $(":input[name=id]", options.submit_row).val()
      });
      $.ajax($.extend(ajax_options, {
        onsuccess: function(data, status, xhr) {
          var new_row = $(data.result.html).addClass("new-row");
          formlib.success_inline_add_form(options, new_row);
          propbox.init_menus(new_row, true);
          $(".nicemenu .edit", new_row).show();     
        }
      }));
    },

    /**
     * Remove a topic from an enumerated type.
     */
    delete_instance_begin: function(row, topic_id, type_id) {
     $.ajax($.extend(formlib.default_submit_ajax_options(), {      
        url: fb.h.ajax_url("delete_instance_submit.ajax"),
        data: {id: topic_id, type: type_id, lang:fb.lang},
        onsuccess: function(data) {
          var new_row = $(data.result.html).addClass("new-row");
          formlib.success_inline_delete(row, new_row, function() {
            $.ajax($.extend(formlib.default_submit_ajax_options(), {                           
              url: fb.h.ajax_url("undo_delete_instance_submit.ajax"),
              data: {id: topic_id, type: type_id, lang:fb.lang},
              onsuccess: function(data) {
                formlib.success_inline_delete_undo(new_row);
              }
            }));
          });
        }
      }));
    },

    reorder_property_begin: function(trigger, type_id) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("reorder_property_begin.ajax"),
        data: {id:type_id, lang:fb.lang},
        onsuccess: function(data) {
          var html = $(data.result.html);
          var event_prefix = "fb.schema.type.reorder.property";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: te.init_reorder_property_form,
            validate: function() {return true;},
            submit: te.submit_reorder_property_form,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("reorder_property_submit.ajax")
            },
            // jQuery objects
            form: html
          };
          formlib.init_modal_form(options);
        }
      }));
    },

    init_reorder_property_form: function(options) {
      var list = $(".reorderable", options.form).sortable({
        change: function() {
          formlib.enable_submit(options);
        }
      });
      $(".btn-mv-top", options.form).click(function(e) {
        var row = $(this).parent(".reorderable-item");
        list.prepend(row);
        formlib.enable_submit(options);
      });
    },

    submit_reorder_property_form: function(options, ajax_options) {
      var properties = [];
      $("input[name=properties]", options.form).each(function() {
        properties.push($(this).val());
      });

      $.extend(ajax_options.data, {
        properties: properties
      });

      $.ajax($.extend(ajax_options, {
        traditional: true,
        onsuccess: function(data) {
          window.location.reload(true);
        }
      }));
    },

    toggle_reorder_link: function(table) {
      var reorder_link = $(".reorder-link", table);
      if ($("> tbody > tr.data-row", table).length > 1) {
        reorder_link.show();
      }
      else {
        reorder_link.hide();
      }
    }

  };


})(jQuery, window.freebase, window.formlib);
