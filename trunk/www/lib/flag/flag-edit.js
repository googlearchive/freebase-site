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
  var edit = fb.flag.edit = {

    merge_begin: function(trigger) {
      $.ajax($.extend(fb.form.default_begin_ajax_options(), {
        url: fb.h.ajax_url("lib/flag/merge_begin.ajax"),
        data: {id: fb.c.id},
        onsuccess: function(data) {
          var form = $(data.result.html);
          var event_prefix = "fb.flag.merge.";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: edit.merge_init,
            validate: edit.merge_validate,
            submit: edit.merge_submit,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url("lib/flag/merge_submit.ajax")
            },
            // jQuery objects
            form: form
          };
          form
            .bind(event_prefix + "cancel", function(e) {
              trigger.removeClass("editing");
            })
            .bind(event_prefix + "submit", function(e) {
              trigger.removeClass("editing");
            });
          fb.form.init_modal_form(options);
        }
      }));
    },

    merge_init: function(options) {
      var input = $(".data-input:first", options.form);
      input
        .data_input({
          lang: fb.lang,
          suggest: fb.suggest_options.instance("/common/topic")
        })
        .bind("valid", function() {
          fb.form.enable_submit(options);
        })
        .bind("invalid", function() {
          fb.form.disable_submit(options);
        })
        .bind("empty", function() {
          fb.form.disable_submit(options);
        })
        .focus();
    },

    merge_validate: function(options) {
      var input = $(".data-input:first", options.form);
      var data = input.data("data");
      return data && data.id;
    },

    merge_submit: function(options, ajax_options) {
      var input = $(".data-input:first", options.form);
      var data = input.data("data");
      ajax_options.data[data.name] = data.id;
      $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
          window.location.reload(true);
        },
        onerror: function(errmsg) {
          options.form.trigger(options.event_prefix + "error", errmsg);
        }
      }));
    },

    split_begin: function(trigger) {

    },

    delete_begin: function(trigger) {

    },

    offensive_begin: function(trigger) {
      // TODO: ajax error handler
      var msg = fb.form.check_ajax_error.apply(null, arguments);
      console.error(msg);
    },

    undo_begin: function(trigger, flag_id) {
      $.ajax($.extend(fb.form.default_submit_ajax_options(), {
        url: fb.h.ajax_url("lib/flag/undo_submit.ajax"),
        data: {id:flag_id},
        onsuccess: function(data) {
          trigger.parents(".page-flag-kind:first").remove();
        }
      }));
    }

  };

})(jQuery, window.freebase);
