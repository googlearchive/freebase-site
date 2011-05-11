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
;(function($, propbox, editparams) {

  // requires:
  // propbox.js @see lib/propbox/propbox.js
  // i18n.js @see lib/18n/i18n.js
  // jquery.metadata.js

  var base_url = propbox.options.base_url;
  var topic_id = propbox.options.id;
  var lang_id = propbox.options.lang;
  var suggest_options = propbox.options.suggest;

  var edit = propbox.edit = {

    /**
     * prop_add
     *
     * Add a new value to a property (topic, literal, cvt)
     */
    prop_add_begin: function(prop_section, unique) {
      var submit_data = {
        s: topic_id,
        p: prop_section.attr("data-id"),
        lang: lang_id
      };
      $.ajax({
        url: base_url + "/prop_add_begin.ajax",
        data: submit_data,
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code !== "/api/status/ok") {
            return edit.ajax_error(xhr, null, prop_section);
          }
          var html = $(data.result.html).hide();
          var event_prefix = "propbox.edit.prop_add.";
          var form = {
            mode: "add",
            event_prefix: event_prefix,
            ajax: {
              data: submit_data,
              url: base_url + "/prop_edit_submit.ajax"
            },

            init: edit.init_prop_add_form,
            submit: edit.submit_prop_add_form,

            prop_section: prop_section,

            msg_row: $(".row-msg", html),
            edit_row: $(".edit-row", html),
            submit_row: $(".edit-row-submit", html),

            structure: html.metadata()
          };

          edit.init(form);

          form.edit_row
            .bind(event_prefix + "success", function() {
              if (unique) {
                form.edit_row.trigger(form.event_prefix + "cancel");
              }
              else {
                edit.reset_data_inputs(form);
                $(":input:visible:first", form.edit_row).focus();
                $(".button-submit", form.submit_row).attr("disabled", "disabled").addClass("disabled");
                $(".button-cancel", form.submit_row).text("Done");
              }
            });
        },
        error: function(xhr) {
          edit.ajax_error(xhr, null, prop_section);
        }
      });
    },

    init_prop_add_form: function(form) {
      edit.init_data_inputs(form);
      $(":input:visible:first", form.edit_row).focus();
    },

    submit_prop_add_form: function(form) {
      var submit_data = $.extend({}, form.ajax.data);  // s, p, lang
      try {
        var o = editparams.parse(form.structure, form.edit_row);
        submit_data.o = JSON.stringify(o);
      }
      catch (ex) {
        var errors = $(".data-input.error", form.edit_row);
        if (errors.length) {
          form.edit_row.trigger(form.event_prefix + "error", "Please specify a valid value");
          errors.eq(0).find(":input").focus().select();
        }
        else {
          form.edit_row.trigger(form.event_prefix + "error", ex.toString());
        }
        return;
      }
      $.ajax({
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: submit_data,
        success: function(data, status, xhr) {
          if (data.code !== "/api/status/ok") {
            return edit.ajax_error(xhr, form);
          }
          var new_row = $(data.result.html);

          form.edit_row.before(new_row);
          $(".data-table > thead", form.prop_section).show();

          // i18n'ize dates and numbers
          i18n.ize(new_row);

          // initialize new row menu
          $(".edit", new_row).show();

          propbox.init_menus(new_row, true);
          propbox.kbs.set_next(null, new_row, true);

          form.edit_row.trigger(form.event_prefix + "success");
        },
        error: function(xhr) {
          edit.ajax_error(xhr, form);
        }
      });
    },

    /**
     * value_edit
     *
     * Edit an existing value (topic, literal, cvt).
     */
    value_edit_begin: function(prop_section, prop_row) {
      var value;
      if (prop_row.is("tr")) {
        value = prop_row.attr("data-id");
      }
      else {
        var prop_value = $(".property-value:first", prop_row);
        value = prop_value.attr("data-id") || prop_value.attr("data-value") || prop_value.attr("datetime");
      }
      var submit_data = {
        s: topic_id,
        p: prop_section.attr("data-id"),
        replace: value,
        lang: lang_id
      };
      $.ajax({
        url: base_url +  "/value_edit_begin.ajax",
        data: submit_data,
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code !== "/api/status/ok") {
            return edit.ajax_error(xhr, null, prop_section, prop_row);
          }
          var html = $(data.result.html).hide();
          var event_prefix = "propbox.edit.value_edit.";
          var form = {
            mode: "edit",
            event_prefix: event_prefix,
            ajax: {
              data: submit_data,
              url: base_url + "/prop_edit_submit.ajax"
            },

            init: edit.init_value_edit_form,
            submit: edit.submit_value_edit_form,

            prop_section: prop_section,
            prop_row: prop_row,

            msg_row: $(".row-msg", html),
            edit_row: $(".edit-row", html),
            submit_row: $(".edit-row-submit", html),

            structure: html.metadata()
          };

          edit.init(form);
          form.edit_row
            .bind(event_prefix + "success", function() {
              //console.log(event_prefix + "success");
              form.msg_row.remove();
              form.edit_row.remove();
              form.submit_row.remove();
            })
            .bind(event_prefix + "cancel", function() {
              //console.log(event_prefix + "cancel");
              form.prop_row.show();
            })
            .bind(event_prefix + "delete", function() {
              // ensure form is not submitted while we are deleting
              form.edit_row.addClass("loading");
              propbox.edit.value_delete_begin(prop_section, prop_row, function() {
                form.msg_row.remove();
                form.edit_row.remove();
                form.submit_row.remove();
              });
            });
        },
        error: function(xhr) {
          edit.ajax_error(xhr, null, prop_section, prop_row);
        }
      });
    },

    init_value_edit_form: function(form) {
      edit.init_data_inputs(form);
      $(":input:visible:first", form.edit_row).focus();
    },

    submit_value_edit_form: function(form) {
      var submit_data = $.extend({}, form.ajax.data);  // s, p, lang
      try {
        var o = editparams.parse(form.structure, form.edit_row);
        submit_data.o = JSON.stringify(o);
      }
      catch(ex) {
        var errors = $(".data-input.error", form.edit_row);
        if (errors.length) {
          form.edit_row.trigger(form.event_prefix + "error", "Please specify a valid value");
          errors.eq(0).find(":input").focus().select();
        }
        else {
          form.edit_row.trigger(form.event_prefix + "error", ex.toString());
        }
        return;
      }
      $.ajax({
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: submit_data,
        success: function(data, status, xhr) {
          if (data.code !== "/api/status/ok") {
            return edit.ajax_error(xhr, form);
          }
          var new_row = $(data.result.html);
          if (new_row.is("tr")) {
            $(".data-table > thead", form.prop_section).show();
          }
          form.prop_row.after(new_row);

          // i18n'ize dates and numbers
          i18n.ize(new_row);
          // initialize new row menu
          $(".edit", new_row).show();
          propbox.init_menus(new_row, true);
          propbox.kbs.set_next(null, new_row, true);


          form.prop_row.remove();
          form.edit_row.trigger(form.event_prefix + "success");
        },
        error: function(xhr) {
          edit.ajax_error(xhr, form);
        }
      });
    },

    /**
     * value_delete_begin
     *
     * Delete an exiting value (topic, literal, cvt).
     */
    value_delete_begin: function(prop_section, prop_row, callback) {
      var value;
      if (prop_row.is("tr")) {
        value = prop_row.attr("data-id");
      }
      else {
        var prop_value = $(".property-value:first", prop_row);
        value = prop_value.attr("data-id") || prop_value.attr("data-value") || prop_value.attr("datetime");
      }
      var submit_data = {
        s: topic_id,
        p: prop_section.attr("data-id"),
        o: value,
        lang: lang_id
      };
      $.ajax({
        url: base_url + "/value_delete_submit.ajax",
        type: "POST",
        data: submit_data,
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code !== "/api/status/ok") {
            return edit.ajax_error(xhr, null, prop_section, prop_row);
          }
          var new_row = $(data.result.html);
          prop_row.before(new_row);
          prop_row.hide();
          // TODO: update property menu (edit vs add for unique)
          prop_section.removeClass("editing");

          if (callback) {
            callback();
          }
        },
        error: function(xhr) {
          edit.ajax_error(xhr, null, prop_section, prop_row);
        }
      });
    },

    /**
     * value_delete_undo
     *
     * Undo operations by value_delete_begin
     */
    value_delete_undo: function(trigger) {
      var msg_row = $(trigger).parents(".row-msg:first");
      var prop_row = msg_row.next(".data-row:hidden");
      var prop_section = prop_row.parents(".property-section");
      var value;
      if (prop_row.is("tr")) {
        value = prop_row.attr("data-id");
      }
      else {
        var prop_value = $(".property-value:first", prop_row);
        value = prop_value.attr("data-id") || prop_value.attr("data-value") || prop_value.attr("datetime");
      }
      var submit_data = {
        s: topic_id,
        p: prop_section.attr("data-id"),
        o: value,
        lang: lang_id
      };
      $.ajax({
        url: base_url + "/value_delete_undo.ajax",
        type: "POST",
        data: submit_data,
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code !== "/api/status/ok") {
            return edit.ajax_error(xhr, null, prop_section, prop_row);
          }
          prop_row.show();
          msg_row.remove();
          // TODO: update property menu (edit vs add for unique)
        },
        error: function(xhr) {
          edit.ajax_error(xhr, null, prop_section, prop_row);
        }
      });

      return false;
    },







    /**
     * Generic form utiltiies
     */

    init_data_inputs: function(form) {
      $(".data-input", form.edit_row).each(function() {
        edit.init_data_input($(this), form);
      });
    },

    init_data_input: function(data_input, form) {
      data_input
        .data_input({
          lang: lang_id,
          suggest: suggest_options
        })
        .bind("valid", function() {
          form.edit_row.trigger(form.event_prefix + "valid");
          var form_field = data_input.parent(".form-field");
          var magicbox_template = form_field.next(".magicbox-template");
          if (magicbox_template.length) {
            var div = $("<div>").html(magicbox_template.html());
            var new_form_field = $(".form-field", div);
            form_field.after(new_form_field);
            edit.init_data_input($(".data-input", new_form_field), form);
          }
        })
        .bind("empty", function() {
          form.edit_row.trigger(form.event_prefix + "valid");
        })
        .bind("invalid", function() {
          form.edit_row.trigger(form.event_prefix + "invalid");
        })
        .bind("submit", function() {
          form.edit_row.trigger(form.event_prefix + "submit");
        })
        .bind("cancel", function() {
          form.edit_row.trigger(form.event_prefix + "cancel");
        })
        .bind("loading", function() {
          $(this).addClass("loading");
        })
        .bind("loading_complete", function() {
          $(this).removeClass("loading");
        });

      if (data_input.is(".datetime")) {
        i18n.ize_datetime_input($(":text", data_input));
      }
      else if (data_input.is(".int") || data_input.is(".float")) {
        i18n.ize_number_input($(":text", data_input));
      }
    },

    reset_data_inputs: function(form) {
      $(".data-input", form.edit_row).each(function() {
        var inst = $(this).data("$.data_input").reset();
      });
    },

    init: function(form) {
      if (form.mode === "add") {
        var ls = $(">.data-section", form.prop_section);
        $("> .data-table > tbody > .empty-row, > .data-list > .empty-row", ls).hide();
        $("> .data-table > tbody, > .data-list", ls).append(form.msg_row).append(form.edit_row).append(form.submit_row);
      }
      else if (form.mode === "edit") {
        form.prop_row.hide();
        form.prop_row.after(form.msg_row);
        form.msg_row.after(form.edit_row);
        form.edit_row.after(form.submit_row);
      }

      var event_prefix = form.event_prefix || "propbox.edit.";

      form.edit_row
        .bind(event_prefix + "valid", function() {
          $(".button-submit", form.submit_row).removeAttr("disabled").removeClass("disabled");
        })
        .bind(event_prefix + "invalid", function() {
          $(".button-submit", form.submit_row).attr("disabled", "disabled").addClass("disabled");
        })
        .bind(event_prefix + "submit", function() {
          edit.submit(form);
        })
        .bind(event_prefix + "cancel", function() {
          edit.cancel(form);
        })
        .bind(event_prefix + "error", function(e, msg) {
          edit.error(form, msg);
          form.edit_row.removeClass("loading");
          form.prop_section.removeClass("editing");
        })
        .bind(event_prefix + "success", function() {
          form.edit_row.removeClass("loading");
          form.prop_section.removeClass("editing");
        });


      // submit handler
      $(".button-submit", form.submit_row).click(function() {
        form.edit_row.trigger(event_prefix + "submit");
      });
      $(".button-cancel", form.submit_row).click(function() {
        form.edit_row.trigger(event_prefix + "cancel");
      });
      $(".button-delete", form.submit_row).click(function() {
        form.edit_row.trigger(event_prefix + "delete");
      });

      form.edit_row.show();
      form.submit_row.show();

      propbox.kbs.scroll_to(form.prop_section);

      if (form.init) {
        form.init(form);
      }
    },

    cancel: function(form) {
      form.msg_row.remove();
      form.edit_row.remove();
      form.submit_row.remove();
      form.prop_section.removeClass("editing");
      var ls = $(">.data-section", form.prop_section);
      if (!$("> .data-table > tbody > tr, > .data-list > li", ls).filter(":not(.empty-row)").length) {
        $("> .data-table > tbody > .empty-row, > .data-list > .empty-row", ls).show();
      }
    },

    submit: function(form) {
      // are we already submitting?
      if (form.edit_row.is(".loading")) {
        return;
      }

      // submit button enabled?
      if ($(".button-submit", form.submit_row).is(":disabled")) {
        return;
      }

      // remove focus from activeElement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }

      // clear messages
      edit.clear_form_message(form);

      // form submitting/loading
      form.edit_row.addClass("loading");
      // submit form
      if (form.submit) {
        form.submit(form);
      }
    },

    error: function(form, msg) {
      $(".button-submit", form.submit_row).attr("disabled", "disabled").addClass("disabled");
      return edit.form_message(form, msg, "error");
    },

    form_message: function(form, msg, type) {
      form.msg_row.find(".close-msg").css("visibility", "visible").next("span").text(msg);
      form.msg_row.attr("class", "row-msg");
      if (type) {
        form.msg_row.addClass("row-msg-" + type);
      }
    },

    clear_form_message: function(form) {
      form.msg_row.find(".close-msg").css("visibility", "hidden").next("span").html("&nbsp;");
    },


    /**
     * Usage:
     *   ajax_error(xhr, form)
     *
     *     or
     *
     *   ajax_error(xhr, null, prop_section, prop_row)
     */
    ajax_error: function(xhr, form, prop_section, prop_row) {
      var msg = xhr.responseText;
      if (form) {
        form.edit_row.trigger(form.event_prefix + "error", msg);
      }
      else {
        var table = $(".data-table", prop_section);
        var row;
        if (table.length) {
          row = edit.row_msg(msg, "error", "tr", $(">thead>tr:first>th", table).length);
        }
        else {
          row = edit.row_msg(msg, "error", "li");
        }
        if (prop_row) {
          prop_row.before(row);
          if (prop_row.is(".edit-row")) {
            prop_row.removeClass("loading");
          }
          else {
            prop_section.removeClass("editing");
          }
        }
        else {
          if (table.length) {
            $(">tbody", table).append(row);
          }
          else {
            $(".data-list", prop_section).append(row);
          }
          prop_section.removeClass("editing");
        }
      }
    },

    row_msg: function(msg, msg_type, row_tag, colspan) {
      var close = $('<a class="close-msg" href="#">x</a>').click(function(e) {
        $(this).parents(".row-msg:first").remove();
        return false;
      });
      var span =  $("<span>").text(msg);
      var row = $('<' + row_tag + ' class="row-msg">');
      if (row_tag === "tr") {
        var td = $('<td>').append(close).append(span);
        if (colspan) {
          td.attr("colspan", colspan);
        }
        row.append(td);
      }
      else {
        row.append(close).append(span);
      }
      if (msg_type) {
        row.addClass("row-msg-" + msg_type);
      }
      return row;
    }

  };


})(jQuery, window.propbox, window.editparams);
