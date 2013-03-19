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
  var edit = fb.queryeditor.edit = {

    create_begin: function(trigger) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("create_begin.ajax"),
        data: {query: fb.queryeditor.cuecard.queryEditor._editor.getCode()},
        onsuccess: function(data) {
          var form = $(data.result.html);
          var event_prefix = "fb.queryeditor.create.";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: edit.create_init,
            validate: edit.create_validate,
            submit: edit.create_submit,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("create_submit.ajax")
            },
            // jQuery objects
            form: form
          };
          formlib.init_modal_form(options);
        }
      }));
    },

    create_init: function(options) {
      var set_domain = function(e) {
        if (this.value) {
          formlib.init_mqlkey(key, {
            source: name,
            namespace: this.value + "/views",
            mqlread: fb.mqlread
          });
          fb.enable(key);
        }
        else {
          fb.disable(key);
        }
        formlib.disable_submit(options);
      };

      var name = $("input[name=name]:visible", options.form)
        .focus();

      var select = $(":input[name=domain]", options.form)
        .chosen()
        .change(set_domain);

      var key = $(":input[name=key]", options.form)
        .bind("valid", function() {
          formlib.enable_submit(options);
        })
        .bind("invalid", function() {
          formlib.disable_submit(options);
        });

      set_domain.call(select[0]);
    },

    create_validate: function(options) {
      var name = $("input[name=name]:visible", options.form).val();
      var select = $(":input[name=domain]", options.form).val();
      var key = $(":input[name=key]", options.form).val();
      return name && select && key;
    },

    create_submit: function(options, ajax_options) {
      ajax_options.data.name = $("input[name=name]:visible", options.form).val();
      ajax_options.data.domain = $(":input[name=domain]", options.form).val();
      ajax_options.data.key = $(":input[name=key]", options.form).val();

      var description = $("textarea[name=description]", options.form).val();
      if (description) {
        ajax_options.data.description = description;
      }

      $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
          fb.status.info("Saved");
          formlib.cancel_modal_form(options);
          window.location = data.result.url;
        }
      }));
    },

    save_submit: function() {
      var options = formlib.default_submit_ajax_options();
      $.ajax($.extend(options, {
        url: fb.h.ajax_url("save_submit.ajax"),
        data: {
          topic: fb.c.id,
          query: fb.queryeditor.cuecard.queryEditor._editor.getCode()
        },
        onsuccess: function(data) {
          fb.status.info("Saved");
          fb.queryeditor.is_dirty = false;
          $("#save-query").addClass("disabled");
        }
      }));
    }

  };

})(jQuery, window.freebase, window.formlib);
