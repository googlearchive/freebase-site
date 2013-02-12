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


(function($, fb, formlib, propbox) {

  var edit = fb.i18n_tab.edit = {

      /**
       * Add name
       */
      add_name_begin: function(row, lang) {
          edit.edit_name_begin(row, null, lang);
      },

      /**
       * Edit (existing) name
       */
      edit_name_begin: function(row, value, lang) {
          var data = {
              s: fb.c.id,
              lang: lang
          };
          if (value != null) {
              data.value = value;
          }
          $.ajax($.extend(formlib.default_begin_ajax_options(), {
              url: fb.h.ajax_url("edit_name_begin.ajax"),
              data: data,
              onsuccess: function(data) {
                  var html = $(data.result.html);
                  var edit_row = $(".edit-row", html);
                  var submit_row = $(".edit-row-submit", html);
                  var event_prefix = "fb.i18n_tab.add_name.";
                  var options = {
                      event_prefix: event_prefix,
                      // callbacks
                      init: edit.edit_name_init,
                      validate: edit.edit_name_validate,
                      submit: edit.edit_name_submit,
                      // submit ajax options
                      ajax: {
                          url: fb.h.ajax_url("edit_name_submit.ajax")
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

      edit_name_init: function(options) {
          var name = $(":input[name=value]", options.edit_row);
          name.bind("input", function(e) {
              if ($.trim(this.value) !== "") {
                  formlib.enable_submit(options);
              }
              else {
                  formlib.disable_submit(options);
              }
          });
      },

      edit_name_validate: function(options) {
          var name = $(":input[name=value]", options.edit_row);
          return $.trim(name.val()) !== "";
      },

      edit_name_submit: function(options, ajax_options) {
          var name = $(":input[name=value]", options.edit_row);
          $.extend(ajax_options.data, {
              value: name.val()
          });
          $.ajax($.extend(ajax_options, {
              onsuccess: function(data) {
                  var new_row = $(data.result.html);
                  formlib.success_inline_edit_form(options, new_row);
                  propbox.init_menus(new_row, true);
                  new_row.parents("table:first").trigger("update");
              }
          }));
      },

      /**
       * Delete name
       */
      delete_name_begin: function(row, value, lang) {
          var submit_data = {
              s: fb.c.id,
              value: value,
              lang: lang
          };
          $.ajax($.extend(formlib.default_submit_ajax_options(), {
              url: fb.h.ajax_url("delete_name_submit.ajax"),
              data: submit_data,
              onsuccess: function(data) {
                  var new_row = $(data.result.html);
                  row.replaceWith(new_row);
                  propbox.init_menus(new_row, true);
                  new_row.parents("table:first").trigger("update");
              }
          }));
      }
  };

})(jQuery, window.freebase, window.formlib, window.propbox);
