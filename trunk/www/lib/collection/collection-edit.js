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
;(function($, fb, propbox, formlib, editparams, i18n) {

  function suggest_options() {
    var o = $.extend({
      status: ["", "Searching...", "Select an item from the list:"]
    }, fb.suggest_options.service_defaults);
    if (fb.acre.freebase.googleapis_url) {
      o.mqlread_url = fb.h.fb_googleapis_url("/mqlread");
    }
    else {
      o.mqlread_url = fb.h.fb_api_url("/api/service/mqlread");
    }
    return o;
  };

  // requires:
  // propbox.js @see lib/propbox/propbox.js
  // form.js @see lib/propbox/form.js
  // editparams.js @see lib/propbox/editparams.js
  // i18n.js @see lib/i18n/i18n.js
  // jquery.metadata.js


  /**
   * TODO: use lib/propbox/form.js for form bindings
   */

  var edit = fb.collection.edit = {

    row_edit_begin: function(prop_row) {
      var row_id = prop_row.attr("data-id");
      var props = prop_row.parent("table").metadata().prop_structures;
      props = props.map(function(prop) {
        return prop.id;
      });
      var submit_data = {
        s: row_id,
        p: props,
        lang: fb.lang || "/lang/en"
      };
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("lib/collection/row_edit_begin.ajax"),
        data: submit_data,
        traditional: true,
        onsuccess: function(data) {
          var form = $(data.result.html);
          var event_prefix = "collection.edit.row_edit.";
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: edit.row_edit_init,
            validate: edit.row_edit_validate,
            submit: edit.row_edit_submit,
            // submit_ajax_options
            ajax: {},
            // jQuery objects,
            form: form,
            row: prop_row
          };
          formlib.init_modal_form(options);
        }
      }));
    },

    row_edit_init: function(options) {console.log("row_edit_init", options);
      i18n.ize(options.form);
      propbox.init(options.form, {
        id: options.row.attr("data-id"),
        base_ajax_url: fb.h.ajax_url("lib/propbox"),
        base_static_url: fb.h.static_url("lib/propbox"),
        lang: fb.lang || "/lang/en",
        suggest: suggest_options()
      });
      $(".edit", options.form).show();
      $(".nicemenu", options.form).nicemenu({
        overlay: options.overlay.getOverlay()
      });
    },
    row_edit_validate: function(options) {
    },
    row_edit_submit: function(options) {
    }

  };

})(jQuery, window.freebase, window.propbox, window.formlib, window.editparams, window.i18n);
