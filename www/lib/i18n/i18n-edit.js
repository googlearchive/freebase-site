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
              data: $.extend({}, submit_data, {"insert": [], "delete": []}),
              url: base_url + "/text_edit_submit.ajax"
            },
            // add new input elements
            add_input: $(".data-input:first", html).data_input(),
            add_lang: $(".lang-select", html)
          };
          // unique property?
          form.unique = form.add_lang.is(".unique");
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
        },
        onLoad: function() {
          $(":text:first", form.form).focus();
        }
      });
      var event_prefix = "i18n.edit.text_edit.";
      $(".button-submit", form.form).click(function() {
        form.form.trigger(event_prefix + "submit");
      });

      function value_row_init(row) {
        $(".icon-link.delete", row).click(function(e) {
          form.form.trigger(event_prefix + "delete", row);
        });
        $(".data-input", row)
          .data_input()
          .bind("submit", function() {
            form.form.trigger(event_prefix + "submit");
          });
      };

      $(".values > tr", form.form).each(function() {
        value_row_init($(this));
      });

      $(".icon-link.add", form.form).click(function(e) {
        form.form.trigger(event_prefix + "add");
      });
      form.add_lang.keypress(function(e) {
        if (e.keyCode === 13) {
          form.form.trigger(event_prefix + "add");
        }
      });
      form.add_input.bind("submit", function() {
        form.form.trigger(event_prefix + "add");
      });

      form.form
        .bind(event_prefix + "add", function() {
          var name_value = form.add_input.data("name_value");
          var lang = form.add_lang.val();
          if (name_value && lang) {
            var value = $.trim(name_value[1]);
            if (value === "") {
              return;
            }

            i18n.edit.text_edit_insert(form, value, lang);

            var option = $("option[value=" + lang.replace(/\//g, "\\/") + "]", form.add_lang);
            var lang_name = option.text();
            var new_row = i18n.edit.new_text_edit_row(value, lang, lang_name).hide();
            $("tbody.values").prepend(new_row);
            value_row_init(new_row);
            new_row.fadeIn(function() {
              form.add_input.data("$.data_input").reset();
              form.add_lang[0].selectedIndex = 0;
              // disable lang option if unique property
              if (form.unique) {
                option.attr("disabled", "disabled");
              }
              $(":text", form.add_input).focus();
            });
          }
          else {
            // TODO: required value and lang
            console.error("Text value and language required");
          }
        })
        .bind(event_prefix + "submit", function() {
          i18n.edit.text_edit_submit(form);
        })
        .bind(event_prefix + "delete", function(e, row) {
          row = $(row);
          var lang = $(".lang", row).attr("data-value");
          var value = $.trim($(".fb-input", row).data("$.validate_input").original_value);
          if (value !== "") {
            i18n.edit.text_edit_delete(form, value, lang);
          }
          row.fadeOut(function() {
            // re-enable option[value=lang] if unique property
            if (form.unique) {
              $("option[value=" + lang.replace(/\//g, "\\/") + "]", form.add_lang).removeAttr("disabled");
            }
            $(this).remove();
          });
        });
    },

    text_edit_insert: function(form, value, lang) {
      form.ajax.data["insert"].push({value:value, lang:lang});
      form.ajax.data["delete"] = $.grep(form.ajax.data["delete"], function(v) {
        return v.value === value && v.lang === lang;
      }, true);
    },

    text_edit_delete: function(form, value, lang) {
      form.ajax.data["delete"].push({value:value, lang:lang});
      form.ajax.data["insert"] = $.grep(form.ajax.data["insert"], function(v) {
        return v.value === value && v.lang === lang;
      }, true);
    },

    text_edit_submit: function(form) {
      // are we already submitting?
      if (form.form.is(".loading")) {
        return;
      }
      // submit button enabled?
      var button_submit = $(".button-submit", form.form);
      if (button_submit.is(":disabled")) {
        return;
      }
      // remove focus from activeElement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }
      $(".values .data-input", form.form).each(function() {
        var name_value = $(this).data("name_value");
        if (name_value) {
          var value = name_value[1];
          if (value === "") {
            return;
          }
          var original_value = $.trim($(".fb-input", this).data("$.validate_input").original_value);
          if (value !== original_value) {
            var lang = $(this).parents("tr:first").find(".lang").attr("data-value");
            i18n.edit.text_edit_delete(form, original_value, lang);
            i18n.edit.text_edit_insert(form, value, lang);
          }
        }
      });

      //console.log("text_edit_submit DELETE", JSON.stringify(form.ajax.data["delete"], null, 2));
      //console.log("text_edit_submit INSERT", JSON.stringify(form.ajax.data["insert"], null, 2));

      if (form.ajax.data["delete"].length ||
          form.ajax.data["insert"].length) {
        form.form.addClass("loading");
        button_submit.addClass("disabled").attr("disabled", "disabled");
        var submit_data = $.extend({}, form.ajax.data, {
          "delete": JSON.stringify(form.ajax.data["delete"]),
          "insert": JSON.stringify(form.ajax.data["insert"])
        });
        $.ajax({
          url: form.ajax.url,
          type: "POST",
          dataType: "json",
          data: submit_data,
          success: function(data, status, xhr) {
            if (data.code !== "/api/status/ok") {
              // TODO: handle error
              return console.error("text_edit_submt", xhr);
            }
            window.location.reload(true);
          },
          error: function(xhr) {
            // TODO: handle error
            console.error("text_edit_submt", xhr);
          }
        });
      }
    },

    new_text_edit_row: function(value, lang, lang_name) {
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
      $(".lang", row).attr("data-value", lang).text(lang_name);
      return row;
    }

  };

})(jQuery, window.i18n);

