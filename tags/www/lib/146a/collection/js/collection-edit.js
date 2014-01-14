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
;(function($, fb, propbox, formlib, editparams) {

  // requires:
  // propbox.js @see lib/propbox/propbox.js
  // form.js @see lib/propbox/form.js
  // editparams.js @see lib/propbox/editparams.js
  // jquery.metadata.js


  /**
   * TODO: use lib/propbox/form.js for form bindings
   */

  var edit = fb.collection.edit = {

    row_edit_begin: function(prop_row) {
      edit._row_edit_begin(prop_row);
    },

    row_edit_init: function(options) {
      propbox.init(options.form, {
        id: options.row.attr("data-id"),
        base_ajax_url: fb.h.ajax_url("lib/propbox"),
        base_static_url: fb.h.static_url("lib/propbox"),
        lang: fb.lang || "/lang/en",
        suggest_impl: fb.suggest_options,

        /**
         * The incompatible_types interface.
         * Must implement "check" and "inline_incompatible_callback"
         * @see lib/incompatible_types/incompatible-types.js
         */
        incompatible_types: fb.incompatible_types
      });
      $(".edit", options.form).show();
      $(".nicemenu", options.form).nicemenu({
        overlay: options.overlay.getOverlay()
      });

      // if mediator, update display name/title with 
      // the first property value in the row
      if ($(".modal-inner.mediator", options.form).length) {
          var name = $(".property-value:first", options.row).text();
          $(".modal-nav-title", options.form).text(name);
      }

      // update navs
      var prev = $(".modal-nav-prev", options.form).unbind();
      var next = $(".modal-nav-next", options.form).unbind();
      var prev_row = options.row.prev(".data-row");
      var next_row = options.row.next(".data-row");
      if (prev_row.length) {
        prev
          .click(function() {
            edit.row_edit_prev(prev_row, options);
            return false;
          })
          .css("visibility", "visible");
      }
      else {
        prev.css("visibility", "hidden");
      }
      if (next_row.length) {
        next
          .click(function() {
            edit.row_edit_next(next_row, options);
            return false;
          })
          .css("visibility", "visible");
      }
      else {
        next.css("visibility", "hidden");
      }
    },

    row_edit_prev: function(prop_row, options) {
      edit._row_edit_begin(prop_row, options);
    },

    row_edit_next: function(prop_row, options) {
      edit._row_edit_begin(prop_row, options);
    },

    /**
     * If options is specified, the modal is already on screen and
     * we're only getting new modal contents/form for the next/previous prop_row.
     */
    _row_edit_begin: function(prop_row, options) {
      // are we navigating to the next/previous row? (i.e. via nex/prev buttons)
      var nav = options != null;
      var row_id = prop_row.attr("data-id");
      var props = prop_row.parent("table").metadata().prop_structures;
      props = props.map(function(prop) {
        return prop.id;
      });
      var submit_data = {
        s: row_id,
        p: props,
        lang: fb.h.lang_code(fb.lang || "/lang/en"),
        nav: nav
      };
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url("lib/collection/row_edit_begin.ajax"),
        data: submit_data,
        traditional: true,
        onsuccess: function(data) {
          var form = $(data.result.html);
          if (nav) {
            $(".modal-inner", options.form).replaceWith(form);
            options.row = prop_row;
            edit.row_edit_init(options);
          }
          else {
            var event_prefix = "collection.edit.row_edit.";
            options = {
              event_prefix: event_prefix,
              // callbacks
              init: edit.row_edit_init,
              validate: function() {return true;},
              submit: function() {},
              // submit_ajax_options
              ajax: {},
              // jQuery objects,
              form: form,
              row: prop_row
            };
            // There is no submit button for this form
            $("button[type=submit]", form).hide();
            form
              .ajaxSuccess(function(e, xhr, ajaxOptions) {
                  if (ajaxOptions.type === "POST") {
                      // if a successful POST (write), we need to reload
                      $(window).data("reload.collection", true);
                  }
              })
              .bind(event_prefix + "cancel", function() {
                  if ($(window).data("reload.collection")) {
                      fb.status.success("Please reload to see your changes.");
                  }
              });
            formlib.init_modal_form(options);            
          }
        }
      }));
    }

  };

})(jQuery, window.freebase, window.propbox, window.formlib, window.editparams);
