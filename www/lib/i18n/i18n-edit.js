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

;(function($, i18n) {

  i18n.edit = {

    text_edit_begin: function(base_url, id, prop_id, lang) {
      var submit_data = {
        s: id,
        p: prop_id,
        lang: lang
      };
      $.ajax({
        url: base_url + "/text_edit_begin.ajax",
        data: submit_data,
        dataType: "json",
        success: function(data, status, xhr) {
          var html = $(data.result.html);
          var form = {
            form: html,
            ajax: {
              base_url: base_url,
              data: submit_data,
              url: base_url + "/text_edit_submit.ajax"
            },
            input: $(".data-input:first", html).data_input(),
            lang_select: $(".lang-select", html)
          };
          i18n.edit.text_edit_init(form);
        },
        error: function(xhr) {
          // TODO: handle error
          console.error("text_edit_begin", xhr);
        }
      });

    },

    text_edit_init: function(form) {
      $(document.body).append(form.form.hide());
      //$(".table-sortable", content).tablesorter();
      form.form.overlay({
        close: ".modal-buttons .button-cancel",
        closeOnClick: false,
        load: true,
        mask: {
          color: '#000',
          loadSpeed: 200,
          opacity: 0.5
        }
      });
      var event_prefix = "i18n.edit.text_edit.";
      $(".button-submit", form.form).click(function() {
        form.form.trigger(event_prefix + "submit");
      });
      $(".icon-link.delete", form.form).click(function(e) {
        var row = $(this).parents("tr:first");
        form.form.trigger(event_prefix + "delete", row);
      });
      $(".icon-link.add", form.form).click(function(e) {
        form.form.trigger(event_prefix + "add");
      });
      form.lang_select
        .keypress(function(e) {
          if (e.keyCode === 13) {
            form.form.trigger(event_prefix + "add");
          }
        });
      form.input.bind("submit", function() {
        form.form.trigger(event_prefix + "add");
      });

      form.form
        .bind(event_prefix + "add", function() {
          var name_value = form.input.data("name_value");
          var lang_id = form.lang_select.val();
          if (name_value && lang_id && name_value[1] != "") {
            var option = $("option[value=" + lang_id.replace(/\//g, "\\/") + "]", form.lang_select);
            var lang_name = option.text();
            var new_row = i18n.edit.new_text_edit_row(name_value[1], lang_id, lang_name).hide();
            $("tbody.values").prepend(new_row);
            new_row.fadeIn(function() {
              form.input.data("$.data_input").reset();
              form.lang_select[0].selectedIndex = 0;
              // disable only if unique property
              option.attr("disabled", "disabled");
              $(":text", form.input).focus();
            });
          }
          else {
            // TODO: required value and lang
            console.error("Text value and language required");
          }
        })
        .bind(event_prefix + "submit", function() {

        })
        .bind(event_prefix + "delete", function(e, row) {
          row = $(row);
          var lang = $(".lang", row).attr("data-value");
          row.fadeOut(function() {
            // re-enable option[value=lang]
            $("option[value=" + lang.replace(/\//g, "\\/") + "]", form.lang_select).removeAttr("disabled");
            $(this).remove();
          });
        });
    },


    new_text_edit_row: function(value, lang_id, lang_name) {
      var row =
        $('<tr>' +
          '  <th class="row-header" scope="row">' +
          '    <span class="data-input text">' +
          '      <input class="fb-input" type="text">' +
          '    </span>' +
          '  </th>' +
          '  <td>' +
          '    <span class="lang"></span>' +
          '  </td>' +
          '  <td>' +
          '    <a class="icon-link delete" href="javascript:void(0);"><span class="delete-icon">delete</span></a>' +
          '  </td>' +
          '</tr>');
      $(":text", row).val(value);
      $(".lang", row).attr("data-value", lang_id).text(lang_name);
      return row;
    }

  };

})(jQuery, window.i18n);
