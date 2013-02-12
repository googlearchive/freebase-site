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
  var edit = fb.flag.edit = {

    merge_begin: function(trigger) {
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
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
          formlib.init_modal_form(options);
        }
      }));
    },

    merge_init: function(options) {
      var input = $(".data-input:first", options.form);
      input
        .data_input({
          lang: fb.lang,
          suggest_impl: fb.suggest_options,
          strict: true
        })
        .bind("valid", function() {
          formlib.enable_submit(options);
        })
        .bind("invalid", function() {
          formlib.disable_submit(options);
        })
        .bind("empty", function() {
          formlib.disable_submit(options);
        });
      $(":input", input).focus();
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
        }
      }));
    },

    split_begin: function(trigger) {
      edit.flag_submit(trigger, "split");
    },

    delete_begin: function(trigger) {
      edit.flag_submit(trigger, "delete");
    },

    offensive_begin: function(trigger) {
      edit.flag_submit(trigger, "offensive");
    },

    flag_submit: function(trigger, kind) {
      $.ajax($.extend(formlib.default_submit_ajax_options(), {
        url: fb.h.ajax_url("lib/flag/flag_submit.ajax"),
        data: {id:fb.c.id, kind:kind},
        onsuccess: function(data) {
          window.location.reload(true);
        }
      }));
    },

    undo_begin: function(trigger, flag_id) {
      $.ajax($.extend(formlib.default_submit_ajax_options(), {
        url: fb.h.ajax_url("lib/flag/undo_submit.ajax"),
        data: {id:flag_id},
        onsuccess: function(data) {
          trigger.parents(".page-flag-kind:first").remove();
        }
      }));
    }

  };

})(jQuery, window.freebase, window.formlib);
