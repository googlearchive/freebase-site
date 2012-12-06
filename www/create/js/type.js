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
;(function($, fb, formlib, propbox, editparams) {

  function init() {

    var html_form = $(".edit-form");
    var structure = html_form.metadata();
    var event_prefix = "create.type.instance.";

    var submit_row = $(".edit-row-submit", html_form);
    var topic_id = $("input[name=s]", submit_row).val();
    var lang_id = fb.h.lang_id($("input[name=lang]", submit_row).val());

    propbox.init(html_form, {
      id: topic_id,
      base_ajax_url: fb.h.ajax_url("lib/propbox"),
      base_static_url: fb.h.static_url("lib/propbox"),
      lang: lang_id,
      suggest_impl: fb.suggest_options,
      /**
       * The incompatible_types interface.
       * Must implement "check" and "inline_incompatible_callback"
       * @see lib/incompatible_types/incompatible-types.js
       */
      incompatible_types: fb.incompatible_types
    });

    var options = {
        event_prefix: event_prefix,
        // callbacks
        init: init_create_type_instance_form,
        validate: validate_create_type_instance_form,
        submit: submit_create_type_instance_form,
        // submit ajax options
        ajax: {
            url: fb.h.ajax_url("lib/propbox/prop_edit_submit.ajax")
        },
        form: html_form,
        structure: structure
    };
    formlib.init(options);
  };

  function init_create_type_instance_form(options) {
    propbox.edit.init_data_inputs(options);
    // is name required?
    if (!options.structure.expected_type.mediator) {
        var name_input = $(".fb-input:first", options.form);
        if (name_input.attr("name") === "/type/object/name") {
            options.name_input = name_input.parent(".data-input");
        }
        else {
            console.error("Expected /type/object/name as the first input");
        } 
    }
    $(":input:visible:first", options.form).focus();
  };

  function validate_create_type_instance_form(options) {
      // if not mediator, /type/object/name is required
      if (options.name_input) {
          var data = options.name_input.data("data");
          if (!data.value) {
              options.form.trigger(options.event_prefix + "error", "Name is required");
              return false;
          }
      }
      // data_inputs do our validation
      // editparams.parse will do our validation on submit
      return true;
  };

  function submit_create_type_instance_form(options, ajax_options) {
    try {
      // This is a work around for editparams to handle "deep" properties.
      // Creating a new instance is like unconditionally creating an instance
      // of a type: 
      //   type -> /type/type/intance -> {id:null, create:unconditional, ...}
      options.structure.expected_type.mediator = true;

      var o = editparams.parse(options.structure, options.form);
      ajax_options.data.o = JSON.stringify(o);
    }
    catch(ex) {
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

    $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
            var new_item = $(data.result.html);
            var new_id = $(".property-value:first", new_item).attr("data-id");
            window.location.href = fb.h.fb_url(new_id);            
        }
    }));

  };


  $(init);

})(jQuery, window.freebase, window.formlib, window.propbox, window.editparams);
