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

  var se = fb.schema.edit;   // required;

  var ie = fb.schema.index.edit = {

    add_domain_begin: function(trigger) {
      $.ajax({
        url: fb.acre.request.app_url + "/schema/index/add_domain_begin",
        dataType: "json",
        success: function(data, status, xhr) {
          var html = $(data.result.html);
          var form = {
            event_prefix: "fb.schema.index.add.domain.",
            ajax: {
              url: fb.acre.request.app_url + "/schema/index/add_domain_submit"
            },

            init_form: ie.init_add_domain_form,
            validate_form: ie.validate_add_domain_form,
            submit_form: ie.submit_add_domain_form,

            form: html
          };

          se.init_modal_form(form);

          form.form
            .bind(form.event_prefix + "success", function(e, data) {
              window.location = data.location;
            });
        }
      });
    },

    init_add_domain_form: function(form) {
      var name = $("input[name=name]", form.form);
      var key = $("input[name=key]", form.form);
      se.auto_key(name, key);

      // enter key
      $(":input:not(textarea)", form.form)
        .keypress(function(e) {
          if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
            form.form.trigger(form.event_prefix + "submit");
          }
        });
    },

    validate_add_domain_form: function(form) {
      var name = $.trim($("input[name=name]:visible", form.form).val());
      var key =  $("input[name=key]", form.form);
      var keyval = key.val();
      if (name === "" || keyval === "") {
        form.form.trigger(form.event_prefix + "error", "Name and Key are required");
      }
      else if (key.data("original") !== keyval) {
        try {
          se.check_key_domain(keyval);
        }
        catch (e) {
          form.form.trigger(form.event_prefix + "error", e);
        }
      }
    },

    submit_add_domain_form: function(form) {
      var key = $("input[name=key]", form.form);
      var data = {
        name: $.trim($("input[name=name]:visible", form.form).val()),
        key: key.val(),
        description: $.trim($("textarea[name=description]:visible", form.form).val()),
        lang: $("select[name=lang]", form.form).val()
      };

      $.ajax({
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: $.extend(data, form.ajax.data),
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, null, form.form);
          }
          form.form.trigger(form.event_prefix + "success", data.result);
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, null, form.form);
        }
      });
    }

  };


})(jQuery, window.freebase);
