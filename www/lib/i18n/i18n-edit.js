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
              data: $.extend({}, submit_data),
              url: base_url + "/text_edit_submit.ajax"
            },
            // add new input elements
            add_input: $(".data-input:first", html).data_input(),
            add_lang: $(".lang-select", html),

            structure: html.metadata()
          };
          // TODO: assert structure
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
      // event handlers (add, delete, submit)
      var event_prefix = "i18n.edit.text_edit.";
      var button_submit = $(".button-submit", form.form).click(function() {
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
          })
          .bind("valid", function() {
            // enable submit button
            button_submit.removeAttr("disabled").removeClass("disabled");
          });
        if ($(".lang", row).attr("data-value") === form.ajax.data.lang) {
          row.addClass("lang-primary");
        }
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
            var option = $("option[value=" + lang.replace(/\//g, "\\/") + "]", form.add_lang);
            var lang_name = option.text();
            var new_row = i18n.edit.new_text_edit_row(value, lang, lang_name).hide();
            $("tbody.values").prepend(new_row);
            value_row_init(new_row);
            new_row.fadeIn(function() {
              form.add_input.data("$.data_input").reset();
              form.add_lang[0].selectedIndex = 0;
              // disable lang option if unique property
              if (form.structure.unique) {
                option.attr("disabled", "disabled");
              }
              $(":text", form.add_input).focus();
            });
            // enable submit button
            button_submit.removeAttr("disabled").removeClass("disabled");
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
          row.fadeOut(function() {
            // re-enable option[value=lang] if unique property
            if (form.structure.unique) {
              $("option[value=" + lang.replace(/\//g, "\\/") + "]", form.add_lang).removeAttr("disabled");
            }
            $(this).remove();
            // enable submit button
            button_submit.removeAttr("disabled").removeClass("disabled");
          });
        });
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

      var old_values = form.structure.values;
      var new_values = [];
      $(".values > tr", form.form).each(function() {
        var row = $(this);
        var value = $.trim($(":text:first", row).val());
        if (value === "") {
          return;
        }
        var lang = $(".lang", row).attr("data-value");
        new_values.push({value:value, lang:lang});
      });
      var o = i18n.edit.text_edit_diff(old_values, new_values);

      console.log("old_values", old_values, "new_values", new_values, "o", o);

      if (o.length) {
        form.form.addClass("loading");
        $.ajax({
          url: form.ajax.url,
          type: "POST",
          dataType: "json",
          data: $.extend(form.ajax.data, {o:JSON.stringify(o)}),
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
      else {
        button_submit.attr("disabled", "disabled").addClass("disabled");
      }
    },

    text_edit_diff: function(old_values, new_values) {
      var operations = [];
      $.each(old_values, function(i, old_value) {
        // if not old_value in new_values (delete)
        if (i18n.edit.inArray(old_value, new_values, "lang", "value") === -1) {
          operations.push({value:old_value.value, lang:old_value.lang, connect:"delete"});
        }
      });
      $.each(new_values, function(i, new_value) {
        // if not new_value in old_values (insert)
        if (i18n.edit.inArray(new_value, old_values, "lang", "value") === -1) {
          operations.push({value:new_value.value, lang:new_value.lang, connect:"insert"});
        }
      });
      return operations;
    },

    inArray: function(value, array /**, key1, key2, ..., keyN **/) {
      var keys = Array.prototype.slice.call(arguments, 2);
      if (!keys.length) {
        return $.inArray(value, array);
      }
      for (var i=0,l=array.length; i<l; i++) {
        var item = array[i];
        var found = true;
        for (var j=0,k=keys.length; j<k; j++) {
          var key = keys[j];
          if (item[key] != value[key]) {
            found = false;
            break;
          }
        }
        if (found) {
          return i;
        }
      }
      return -1;
    },

    new_text_edit_row: function(value, lang, lang_name) {
      var row =
        $('<tr>' +
          '  <th class="row-header" scope="row">' +
          '    <span class="data-input text">' +
          '      <input class="fb-input" type="text">' +
          '    </span>' +
          '  </th>' +
          '  <td class="lang">' +
          '    <span class="lang"></span>' +
          '  </td>' +
          '  <td class="delete-row">' +
          '    <a class="icon-link delete" href="javascript:void(0);"><span class="delete-icon">delete</span></a>' +
          '  </td>' +
          '</tr>');
      $(":text", row).val(value);
      $(".lang", row).attr("data-value", lang).text(lang_name);
      return row;
    }

  };

})(jQuery, window.i18n);

