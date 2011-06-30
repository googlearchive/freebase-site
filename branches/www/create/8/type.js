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
;(function($, fb, propbox, editparams) {

  function init() {

    var html_form = $(".edit-form");
    var event_prefix = "create.type.instance.";
    var submit_row = $(".edit-row-submit", html_form);

    var topic_id = $("input[name=s]", submit_row).val();
    var lang_id = $("input[name=lang]", submit_row).val();

    propbox.init(html_form, {
      id: topic_id,
      base_ajax_url: fb.h.ajax_url("lib/propbox"),
      base_static_url: fb.h.static_url("lib/propbox"),
      lang: lang_id,
      suggest: {
        service_url: fb.h.legacy_fb_url(),
        service_path: "/private/suggest",
        flyout_service_url: fb.h.legacy_fb_url(),
        flyout_service_path: "/private/flyout",
        mqlread_url: fb.h.fb_api_url("/api/service/mqlread"),
        category: "object",
        type: "/common/topic",
        status: ["", "Searching...", "Select an item from the list:"]
      }
    });

    var form = {
      mode: event_prefix,
      event_prefix: event_prefix,
      ajax: {
        data: {
          s: $("input[name=s]", submit_row).val(),
          p: $("input[name=p]", submit_row).val(),
          lang: $("input[name=lang]", submit_row).val()
        },
        url: fb.h.ajax_url("lib/propbox/prop_edit_submit.ajax")
      },

      init: init_create_type_instance_form,
      submit: submit_create_type_instance_form,

      prop_section: html_form,

      msg_row: $(".row-msg", html_form),
      edit_row: html_form,
      submit_row: submit_row,

      structure: html_form.metadata()
    };

    propbox.edit.init(form);
  };

  function init_create_type_instance_form(form) {
    propbox.edit.init_data_inputs(form);
    $(":input:visible:first", form.edit_row).focus();
  };

  function submit_create_type_instance_form(form) {
    var submit_data = $.extend({}, form.ajax.data);  // s, p, lang
    var o;
    try {
      o = editparams.parse(form.structure, form.edit_row);
    }
    catch(ex) {
      var errors = $(".data-input.error", form.edit_row);
      if (errors.length) {
        form.edit_row.trigger(form.event_prefix + "error", "Please specify a valid value");
        errors.eq(0).find(":input").focus().select();
      }
      else {
        form.edit_row.trigger(form.event_prefix + "error", ex.toString());
      }
      return;
    }
    if (!(o && o.length)) {
      form.edit_row.trigger(form.event_prefix + "error", "Please specify a valid value");
      $("input:first", form.edit_row).focus();
      return;
    }
    submit_data.o = JSON.stringify(o);
    //console.log("submit_data", submit_data);
    $.ajax({
      url: form.ajax.url,
      type: "POST",
      dataType: "json",
      data: submit_data,
      success: function(data, status, xhr) {
        // TODO: handle error
        var new_item = $(data.result.html);
        var new_id = $(".property-value:first", new_item).attr("data-id");
        window.location.href = fb.h.fb_url(new_id);
      }
    });
  };


  $(init);

})(jQuery, window.freebase, window.propbox, window.editparams);
