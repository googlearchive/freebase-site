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


(function($, fb) {

  var edit = fb.sameas.edit = {


    add_key_begin: function(trigger) {
      $.ajax({
        url: fb.h.ajax_url("add_key_begin.ajax"),
        dataType: "json",
        data: {id: fb.c.id},
        success: function(data) {
          if (!fb.form.check_ajax_success.apply(null, arguments)) {
            return;
          }
          var form = $(data.result.html);
          var event_prefix = "fb.sameas.add_key.";
          var options = {
            event_prefix: event_prefix,
            init: edit.add_key_init,
            validate: edit.add_key_validate,
            submit: edit.add_key_submit,
            reset: edit.add_key_reset,

            ajax: {
              url: fb.h.ajax_url("edit_key_submit.ajax")
            },

            trigger: trigger,
            table: trigger.parents("table:first"),
            form: form
          };
          form
            .bind(event_prefix + "cancel", function(e) {
              trigger.removeClass("editing");
            });
          fb.form.init_table_add_form(options);
        },
        error: function() {
          // TODO: ajax error handler
          var msg = fb.form.check_ajax_error.apply(null, arguments);
          console.error(msg);
        }
      });
    },

    add_key_init: function(options) {
      var select = $(":input[name=namespace]", options.form).chosen();
      var key = $(":input[name=key]", options.form);
      fb.disable(key);
      select.change(function(e) {
        key.val("");
        if (this.value) {
          fb.form.init_mqlkey(key, {
            mqlread_url: fb.acre.freebase.googleapis_url ? fb.h.fb_googleapis_url("/mqlread") : fb.h.fb_api_url("/api/service/mqlread"),
            namespace: this.value
          });
          key
            .bind("valid", function() {
              fb.form.enable_submit(options);
            })
            .bind("invalid", function() {
              fb.form.disable_submit(options);
            });
          fb.enable(key);
          key.focus();
        }
        else {
          fb.disable(key);
        }
        fb.form.disable_submit(options);
      });
    },

    add_key_validate: function(options) {
      var select = $(":input[name=namespace]", options.form);
      var key = $(":input[name=key]", options.form);
      if (!select.val()) {
        fb.form.trigger(options.event_prefix + "error", "Please select an authority/namespace");
        return false;
      }
      return fb.form.validate_mqlkey(options, key);
    },

    add_key_submit: function(options, ajax_options) {
      var namespace = $(":input[name=namespace]", options.form).val();
      var key = $(":input[name=key]", options.form).val();
      ajax_options.data.o = JSON.stringify([{
        namespace: namespace,
        value: key,
        connect: "insert"
      }]);
      $.ajax($.extend(ajax_options, {

        success: function(data) {
          if (!fb.form.check_ajax_success.apply(null, arguments)) {
            return;
          }
          var new_row = $(data.result.html);
          fb.form.success_table_add_form(options, new_row);
        },

        error: function(xhr) {
          // TODO: ajax error handler
          var msg = fb.form.check_ajax_error.apply(null, arguments);
          options.form.trigger(options.event_prefix + "error", msg);
        }

      }));
    },

    add_key_reset: function(options) {
      var select = $(":input[name=namespace]", options.form);
      var key = $(":input[name=key]", options.form);
      key.val("").focus().trigger("textchange")
        .next(".key-status").text("").removeClass("loading");
      fb.form.disable_submit(options);
    }

  };

})(jQuery, window.freebase);
