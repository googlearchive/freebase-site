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
;(function($, fb) {

  // fb.topic namespace required (topic.js)

  var edit = fb.topic.edit = {

    prop_add_begin: function(topic_id, prop_section, lang_id) {
      $.ajax({
        url: fb.h.fb_url("/topic/prop_add_begin.ajax"),
        data: {
          id: topic_id,
          pid: prop_section.attr("data-id"),
          lang: lang_id
        },
        dataType: "json",
        success: function(data, status, xhr) {
          var html = $(data.result.html);
          var event_prefix = "fb.topic.add.property.";
          var form = {
            mode: "add",
            event_prefix: event_prefix,
            ajax: {
              url: fb.h.fb_url("/topic/prop_add_submit.ajax")
            },
            init: edit.init_prop_add_form,
            validate: edit.validate_prop_add_form,
            submit: edit.submit_prop_add_form,
            form: html.hide(),
            prop_section: prop_section
          };
          edit.init(form);


          form.form
            .bind(event_prefix + "success", function() {

            });

        },
        error: function(xhr) {
          edit.ajax_error(xhr, form);
        }
      });
    },

    init_prop_add_form: function(form) {
      edit.init_input_elements(form);
      $(":input:visible:first", form.form).focus();
    },

    validate_prop_add_form: function(form) {

    },

    submit_prop_add_form: function(form) {

    },

    init_input_elements: function(form) {
      $(".data-input", form.form).each(function() {
        var $this = $(this);
        $(":input", $this)
          .validate_input({
            validator: $.validate_input.get_validator($this)
          })
          .bind("valid", function(e, data) {
            $(this).parent().removeClass("error").addClass("valid");
          })
          .bind("invalid", function(e, data) {
            $(this).parent().removeClass("valid").addClass("error");
          });
      });
    },


    init: function(form) {
      if (form.mode === "add") {
        var ls = $(">.list-section", form.prop_section);
        if ($(">.empty-property", ls).length) {
          // hide empty prop placeholder
          ls.hide();
        }
        form.prop_section.append(form.form);
      }

      var event_prefix = form.event_prefix || "fb.topic.edit.";

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
        })
        .bind(event_prefix + "success", function() {
          form.form.removeClass("loading");
        });

      // submit handler
      $(".button-submit", form.form).click(function() {
        form.form.trigger(event_prefix + "submit");
      });
      $(".button-cancel", form.form).click(function() {
        form.form.trigger(event_prefix + "cancel");
      });

      form.form.show();
      fb.kbs.scroll_to(form.form);
      form.init(form);
    },

    cancel: function(form) {
      form.form.hide();
      form.prop_section
        .find(">.list-section")
        .show()
        .end()
        .removeClass("editing");
    },

    submit: function(form) {

    },

    error: function(form, msg) {
      var form_msg = $("<div class='form-msg'>").text(msg);
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
      edit.error(form, msg);
      form.form.removeClass("loading");
    }
  };


})(jQuery, window.freebase);
