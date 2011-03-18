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
;(function($, propbox) {

  // propbox namespace required @see propbox.js

  var base_url = propbox.options.base_url;
  var topic_id = propbox.options.id;
  var lang_id = propbox.options.lang;
  var suggest_options = propbox.options.suggest;

  var edit = propbox.edit = {

    /**
     * Add a new value to a property (topic, literal, cvt)
     */
    prop_add_begin: function(prop_section) {
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
          var html = $(data.result.html).hide();
          var event_prefix = "propbox.edit.prop_add.";
          var form = {
            mode: "add",
            event_prefix: event_prefix,
            ajax: {
              data: submit_data,
              url: base_url + "/prop_add_submit.ajax"
            },
            init: edit.init_prop_add_form,
            validate: edit.validate_prop_add_form,
            submit: edit.submit_prop_add_form,
            form: html,
            prop_section: prop_section
          };
          edit.init(form);

          form.form
            .bind(event_prefix + "success", function() {
              edit.reset_data_input(form);
              $(":input:visible:first", form.form).focus();
              $(".button-cancel", form.form).text("Done");
            });

        },
        error: function(xhr) {
          edit.ajax_error(xhr, form);
        }
      });
    },

    init_prop_add_form: function(form) {
      edit.init_data_input(form);
      $(":input:visible:first", form.form).focus();
    },

    validate_prop_add_form: function(form) {
      return edit.validate_data_input(form);
    },

    submit_prop_add_form: function(form) {
      var submit_data = $.extend({}, form.ajax.data);  // s, p, lang
      $(".data-input", form.form).each(function() {
        var name_value = $(this).data("name_value");
        if (name_value) {
          submit_data[name_value[0]] = name_value[1];
        }
      });
      $(".lang-input :text[data-lang]", form.form).each(function() {
        var $this = $(this);
        submit_data[$this.attr("name")] = $this.val();
      });
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
            $(".data-table > tbody", form.prop_section).append(new_row);
            $(".data-table > thead", form.prop_section).show();
          }
          else {
            $(".data-list", form.prop_section).append(new_row);
          }
          form.form.trigger(form.event_prefix + "success");
        },
        error: function(xhr) {
          edit.ajax_error(xhr, form);
        }
      });
    },

    /**
     * Edit an existing value (topic, literal, cvt).
     */
    value_edit_begin: function(prop_section, prop_row) {
      var value;
      if (prop_row.is("tr")) {
        value = prop_row.attr("data-id");
      }
      else {
        var prop_value = $(".property-value:first", prop_row);
        value = prop_value.attr("data-id") || prop_value.attr("data-value");
      }
      var submit_data = {
        s: topic_id,
        p: prop_section.attr("data-id"),
        o: value,
        lang: lang_id
      };
      $.ajax({
        url: base_url +  "/value_edit_begin.ajax",
        data: submit_data,
        dataType: "json",
        success: function(data, status, xhr) {
          var html = $(data.result.html).hide();
          var event_prefix = "propbox.edit.value_edit.";
          var form = {
            mode: "edit",
            event_prefix: event_prefix,
            ajax: {
              data: submit_data,
              url: base_url + "/value_edit_submit.ajax"
            },
            init: edit.init_value_edit_form,
            validate: edit.validate_value_edit_form,
            submit: edit.submit_value_edit_form,
            form: html,
            prop_section: prop_section,
            prop_row: prop_row
          };
          edit.init(form);
          form.form
            .bind(event_prefix + "success", function() {
              console.log(event_prefix + "success");
              form.form.remove();
            })
            .bind(event_prefix + "cancel", function() {
              console.log(event_prefix + "cancel");
              form.prop_row.show();
            });
        },
        error: function(xhr) {
          edit.ajax_error(xhr, form);
        }
      });
    },

    init_value_edit_form: function(form) {
      edit.init_data_input(form);
      $(":input:visible:first", form.form).focus();
    },

    validate_value_edit_form: function(form) {
      return edit.validate_data_input(form);
    },

    submit_value_edit_form: function(form) {
      var submit_data = $.extend({}, form.ajax.data);  // s, p, o, lang
      $(".data-input", form.form).each(function() {
        var name_value = $(this).data("name_value");
        if (name_value) {
          submit_data[name_value[0]] = name_value[1];
        }
      });
      $(".lang-input :text[data-lang]", form.form).each(function() {
        var $this = $(this);
        submit_data[$this.attr("name")] = $this.val();
      });
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
          form.prop_row.remove();
          form.form.trigger(form.event_prefix + "success");
        },
        error: function(xhr) {
          edit.ajax_error(xhr, form);
        }
      });
    },

    /**
     * Generic form utiltiies
     */

    init_data_input: function(form) {
      $(".data-input", form.form).each(function() {
        $(this)
          .data_input({
            suggest: suggest_options
          })
          .bind("submit", function() {
            form.form.trigger(form.event_prefix + "submit");
          })
          .bind("cancel", function() {
            form.form.trigger(form.event_prefix + "cancel");
          })
          .bind("loading", function() {
            $(this).addClass("loading");
          })
          .bind("loading_complete", function() {
            $(this).removeClass("loading");
          });
      });
    },

    validate_data_input: function(form) {
      var valid = true;
      $(".data-input", form.form).each(function(i) {
        var data_input = $(this);
        if (data_input.is(".loading")) {
          console.log("data_input.is(.loading)");
          valid = false;
          return false;
        }
        var data_input_instance = data_input.data("$.data_input");
        // force validation
        data_input_instance.validate(true);
        if (i === 0 && !data_input.is(".valid")) {
          // first data_input is always required
          valid = edit.data_input_required(form, data_input);
        }
        else if (data_input.is(".error")) {
          valid = edit.data_input_invalid(form, data_input);
        }
      });
      return valid;
    },

    reset_data_input: function(form) {
      $(".data-input", form.form).each(function() {
        var inst = $(this).data("$.data_input").reset();
      });
    },

    init: function(form) {
      if (form.mode === "add") {
        var ls = $(">.data-section", form.prop_section);
        $(".data-table tr.empty-row, .data-list li.empty-row", ls).hide();
        form.prop_section.append(form.form);
      }
      else if (form.mode === "edit") {
        form.prop_row.hide();
        form.prop_row.after(form.form);
      }

      var event_prefix = form.event_prefix || "propbox.edit.";

      form.form
        .bind(event_prefix + "submit", function() {
          edit.submit(form);
        })
        .bind(event_prefix + "cancel", function() {
          edit.cancel(form);
        })
        .bind(event_prefix + "error", function(e, msg) {
          edit.error(form, msg);
          form.form.removeClass("loading");
          form.prop_section.removeClass("editing");
        })
        .bind(event_prefix + "success", function() {
          form.form.removeClass("loading");
          form.prop_section.removeClass("editing");
        });

      // submit handler
      $(".button-submit", form.form).click(function() {
        form.form.trigger(event_prefix + "submit");
      });
      $(".button-cancel", form.form).click(function() {
        form.form.trigger(event_prefix + "cancel");
      });

      form.form.show();
      propbox.kbs.scroll_to(form.prop_section);

      if (form.init) {
        form.init(form);
      }
    },

    cancel: function(form) {
      form.form.hide().remove();
      form.prop_section.removeClass("editing");
      var ls = $(">.data-section", form.prop_section);
      if (!$(".data-table tr, .data-list li", ls).filter(":not(.empty-row)").length) {
        $(".data-table tr.empty-row, .data-list li.empty-row", ls).show();
      }
    },

    submit: function(form) {
      // are we already submitting?
      if (form.form.is(".loading")) {
        return;
      }

      // remove focus from activeElement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }

      // clear messages
      edit.clear_form_message(form);

      // validate form
      if (form.validate) {
        if (!form.validate(form)) {
          return;
        }
      }

      // form submitting/loading
      form.form.addClass("loading");
      // submit form
      if (form.submit) {
        form.submit(form);
      }
    },

    data_input_required: function(form, data_input) {
      var label = data_input.prev(".form-label").text();
      edit.form_error(form, "Required: " + label);
    },

    data_input_invalid: function(form, data_input) {
      var label = data_input.prev(".form-label").text();
      edit.form_error(form, "Invalid: " + label);
    },

    form_error: function(form, msg) {
      return edit.form_message(form, msg, "error");
    },

    form_message: function(form, msg, type) {
      var close = $('<a class="close-msg" href="#">x</a>').click(function(e) {
        $(this).parents("tr:first").remove();
        return false;
      });
      var span =  $("<span>").text(msg);
      var td = $('<td>').append(close).append(span);
      var row_msg = $('<tr class="row-msg">').append(td);
      if (type) {
        row_msg.addClass("row-msg-" + type);
      }

      var row = form.prop_row || $(".edit-row", form.form);
      // prepend row_msg to row
      row.before(row_msg);

      return row_msg;
    },

    clear_form_message: function(form) {
      if (form.prop_row) {
        form.prop_row.prev(".row-msg").remove();
      }
      else {
        $(".row-msg", form.form).remove();
      }
    },

    ajax_error: function(xhr, form) {
      var msg;
      try {
        msg = JSON.parse(xhr.responseText);
        if (msg.messages && msg.messages.length) {
          msg = JSON.stringify(msg.messages[0]); // display the first message
        }
      }
      catch (e) {
        // ignore
      }
      if (!msg) {
        msg = xhr.responseText;
      }
      edit.form_error(form, msg);
      form.form.removeClass("loading");
    }

  };


})(jQuery, window.propbox);
