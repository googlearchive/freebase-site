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

;(function($, i18n, formlib, editparams) {

  i18n.edit = {

    text_edit_begin: function(base_url, id, prop_id, lang) {
      var submit_data = {
        s: id,
        p: prop_id,
        lang: lang
      };
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: base_url + "/text_edit_begin.ajax",
        data: submit_data,
        onsuccess: function(data) {
          var form = $(data.result.html);
          var event_prefix = "i18n.edit.text_edit.";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: i18n.edit.text_edit_init,
            validate: i18n.edit.text_edit_validate,
            submit: i18n.edit.text_edit_submit,
            // submit ajax options
            ajax: {
              url: base_url + "/text_edit_submit.ajax",
              data: submit_data
            },
            // jQuery objects
            form: form,
            // add new input elements
            add_input: $(".data-input:first", form).data_input(),
            add_lang: $(".lang-select", form),

            structure: form.metadata(),
            base_url: base_url
          };
          formlib.init_modal_form(options);
        }
      }));
/**
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
*/
    },

    text_edit_init: function(options) {
      // event handlers (add, delete, submit)
      var event_prefix = options.event_prefix;
      function value_row_init(row) {
        $(".icon-link.delete", row).click(function(e) {
          options.form.trigger(event_prefix + "delete", row);
        });
        var data_input = $(".data-input", row)
          .data_input()
          .bind("valid", function() {
            options.form.trigger(event_prefix + "valid");
          })
          .bind("empty", function() {
            options.form.trigger(event_prefix + "valid");
          })
          .bind("invalid", function() {
            options.form.trigger(event_prefix + "invalid");
          })
          .bind("submit", function() {
            options.form.trigger(event_prefix + "submit");
          })
          .bind("cancel", function() {
            options.form.trigger(event_prefix + "cancel");
          });
        if (data_input.metadata().lang === options.ajax.data.lang) {
          row.addClass("preferred");
        }
      };
      $(".values > tr", options.form).each(function() {
        value_row_init($(this));
      });

      // add row
      var $add_button = $(".icon-link.add", options.form)
        .unbind()  // unbind default init_modal_form submit/cancel
        .bind('mouseover, focus', function(e) {
          $(this).parent().addClass("focused");
        }).
        bind('mouseout, blur', function() {
          $(this).parent().removeClass("focused");
        })
        .click(function(e) {
          options.form.trigger(event_prefix + "add");
        })
        .focusin(function(){
          $(this).addClass("focused");
        })
        .focusout(function(){
          $(this).removeClass("focused");
        });
      options.add_lang
        .unbind() // unbind default init_modal_form submit/cancel
        .focus(function(){
          $(this).parent().addClass("focused");
        })
        .blur(function(){
          $(this).parent().removeClass("focused");
        })
        .keypress(function(e) {
          if (e.keyCode === 13) {
            options.form.trigger(event_prefix + "add");
          }
        });
      options.add_input
        .unbind() // unbind default init_modal_form submit/cancel
        .bind("submit", function() {
          options.form.trigger(event_prefix + "add");
        });


      options.form
        .bind(event_prefix + "add", function() {
          var data = options.add_input.data("data");
          var lang = options.add_lang.val();
          if (data && lang) {
            var value = $.trim(data.value);
            if (value === "") {
              return;
            }
            var option = $("option[value=" + lang.replace(/\//g, "\\/") + "]", options.add_lang);
            var lang_name = option.text();
            var new_row = i18n.edit.new_text_edit_row(value, lang, lang_name).hide();
            $("tbody.values", options.form).prepend(new_row);
            value_row_init(new_row);
            new_row.fadeIn(function() {
              options.add_input.data("$.data_input").reset();
              options.add_lang[0].selectedIndex = 0;
              // disable lang option if unique property
              if (options.structure.unique) {
                option.attr("disabled", "disabled");
              }
              $(":text", options.add_input).focus();
            });
            // enable submit button
            options.form.trigger(event_prefix + "valid");

            // If the newly added value does not match the user's primary language
            // we show a msg alerting them as much. We have to use this show method
            // as jQuery's fadeIn method does not work on visibility:hidden, which
            // we need to prevent the modal dialog from shifting.
            if (lang !== options.ajax.data.lang) {
              $(".lang-warning").css('visibility','visible').hide().fadeIn('slow');
            }
          }
          else {
            // TODO: required value and lang
            console.error("Text value and language required");
          }
        })
        .bind(event_prefix + "delete", function(e, row) {
          row = $(row);
          var lang = $(".data-input:first", row).metadata().lang;
          row.fadeOut(function() {
            // re-enable option[value=lang] if unique property
            if (options.structure.unique) {
              $("option[value=" + lang.replace(/\//g, "\\/") + "]", options.add_lang).removeAttr("disabled");
            }
            $(this).remove();
            // enable submit button
             options.form.trigger(event_prefix + "valid");
          });
        });
    },

    text_edit_validate: function(options) {
      return true;
    },

    text_edit_submit: function(options, ajax_options) {
      try {
        var o = editparams.parse(options.structure, $(".values", options.form));
      }
      catch (ex) {
        var errors = $(".data-input.error", options.form);
        if (errors.length) {
          options.form.trigger(options.event_prefix + "error", "Please specify a valid value");
          errors.eq(0).find(":input").focus().select();
        }
        else {
          options.form.trigger(options.event_prefix + "error", ex.toString());
        }
        return;
      }
      ajax_options.data.o = JSON.stringify(o);
      if (o.length) {
        $.ajax($.extend(ajax_options, {
          onsuccess: function(data) {
            window.location.reload(true);
          },
          onerror: function(errmsg) {
            options.form.trigger(options.event_prefix + "error", errmsg);
          }
        }));
      }
      else {
        options.form.trigger(options.event_prefix + "cancel");
      }
    },

    new_text_edit_row: function(value, lang, lang_name) {
      var row =
        $('<tr class="new">' +
          '  <th class="row-header" scope="row">' +
          '    <span class="data-input text">' +
          '      <input class="fb-input" type="text">' +
          '    </span>' +
          '  </th>' +
          '  <td class="lang">' +
          '    <span></span>' +
          '  </td>' +
          '  <td class="delete-row">' +
          '    <a class="icon-link delete" href="javascript:void(0);"><span class="delete-icon">delete</span></a>' +
          '  </td>' +
          '</tr>');
      var data_input = $(".data-input", row);
      data_input.addClass(JSON.stringify({value:value, lang:lang, type:"/type/text"}));  // for $.metadata
      $(".fb-input", data_input).val(value);
      $(".lang > span", row).text(lang_name);

      return row;
    }

  };

})(jQuery, window.i18n, window.formlib, window.editparams);

