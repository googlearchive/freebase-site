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

  var de = fb.schema.domain.edit = {

    /**
     * retrieve add_type form (ajax).
     */
    add_type_begin: function(table, domain_id, mediator) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("add_type_begin.ajax"),
        data: {id: domain_id, mediator: mediator, lang: fb.lang},
        onsuccess: function(data) {
          var html = $(data.result.html);
          var edit_row = $(".edit-row", html);
          var submit_row = $(".edit-row-submit", html);
          var event_prefix = "fb.schema.domain.add.type.";
          var options = {
            mode: "add",
            event_prefix: event_prefix,
            // callbacks
            init: de.init_type_form,
            validate: de.validate_type_form,
            submit: de.submit_type_form,
            reset: de.init_type_form,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("add_type_submit.ajax")
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

    /**
     * edit type
     */
    edit_type_begin: function(row, type_id) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("edit_type_begin.ajax"),
        data: {id:type_id, lang:fb.lang},
        onsuccess: function(data) {
          var html = $(data.result.html);
          var edit_row = $(".edit-row", html);
          var submit_row = $(".edit-row-submit", html);
          var event_prefix = "fb.schema.domain.edit.type.";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: de.init_type_form,
            validate: de.validate_type_form,
            submit: de.submit_type_form,
            // submit ajax_options,
            ajax: {
              url: fb.h.ajax_url("edit_type_submit.ajax")
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
     * init add_type/edit_type row
     */
    init_type_form: function(options) {
      var name = $("input[name=name]", options.edit_row);
      var key =  $("input[name=key]", options.edit_row);

      if (options.mode === "add") {
        name.val("");
        key.val("");
        $("textarea[name=description]", options.edit_row).val("");
        $("input[name=enumeration]", options.edit_row).removeAttr("checked");
      }

      if (!options.edit_row.data("initialized")) {
        var domain = $("input[name=domain]", options.edit_row).val();
        formlib.init_mqlkey(key, {
          mqlread: fb.mqlread,
          source: name,
          namespace: domain,
          schema: true
        });

        // enter/escape key handler
        $(":input:not(textarea)", options.edit_row).keypress(function(e) {
          if (e.keyCode === 13) { // enter
            options.edit_row.trigger(options.event_prefix + "submit");
          }
          else if (e.keyCode === 27) { // escape
            options.edit_row.trigger(options.event_prefix + "cancel");
          }
        });

        options.edit_row.bind("input, change", function() {
            de.validate_type_form(options);
        });

        options.edit_row.data("initialized", true);
      }

      name.focus();
    },

    /**
     * validate rows, if no errors submit
     */
    submit_type_form: function(options, ajax_options) {
      var key = $("input[name=key]", options.edit_row);
      var data = {
        domain:  $("input[name=domain]", options.edit_row).val(),
        name: $.trim($("input[name=name]:visible", options.edit_row).val()),
        key: key.val(),
        description: $.trim($("textarea[name=description]:visible", options.edit_row).val()),
        mediator: $("input[name=mediator]", options.edit_row).is(":checked") ? 1 : 0,
        enumeration: $("input[name=enumeration]", options.edit_row).is(":checked") ? 1 : 0,
        deprecated: $("input[name=deprecated]", options.edit_row).is(":checked") ? 1 : 0,
        never_assert: $("input[name=never_assert]", options.edit_row).is(":checked") ? 1 : 0,
        lang: fb.lang
      };

      $.extend(ajax_options.data, data);

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
          }
      }));
    },

    /**
     * validate row
     */
    validate_type_form: function(options) {
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
      formlib.enable_submit(options);
      return true;
    }

  };

})(jQuery, window.freebase, window.formlib);
