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


(function($, fb) {

  var it = fb.incompatible_types = {

    overlay_dialog: null,
    inline_dialog: null,

    /**
     * Add incompatible parameters to suggest/search options for a type
     * and its included types.
     * <ol>
     *   <li>filter=(should (not incompatible:type_id))</li>
     *   <li>output=(incompatible:type_id incompatible:included_type1 ...)</li>
     * </ol>
     * @param {string} type_id The type to check for incompatibility.
     * @param {Array.<string>} included_types The included types of type_id to
     *    to check for incompatibility.
     * @param {Object} opt_suggest_options Existing suggest options that will
     *    be extended to include the incompatible search options.
     * @return opt_suggest_options or a new dictionary
     *     with the search incompatible parameters.
     */
    suggest_options: function(
        type_id, included_types, opt_suggest_options) {
      var o = opt_suggest_options || {};
      var types = [type_id].concat(included_types || []);
      // Add filter=(should (not incompatible:type_id))
      var filter = o.filter;
      if (!$.isArray(filter)) {
        filter = [];
        if (filter != null) {
          filter.push(o.filter);
        }
        o.filter = filter;
      }
      filter.push('(should (not incompatible:' + type_id + '))');
      o.filter = filter;

      // Add output=(incompatible:type_id)
      var output = o.output;
      if (output) {
        var m = /^\((.*)\)$/.exec(o.output);
        if (m) {
          output = '(' + it.search_output_(types) + ' ' + m[1] + ')';
        }
      }
      if (!output) {
        output = it.search_output_(types, true);
      }
      o.output = output;

      return o;
    },

    /**
     * For a list of types, get the search output parameter value to get the
     * incompatibility info for each type. For example:
     * <code>
     *   search_output_(['t1', 't2']) == 'incompatible:t1 incompatible:t2';
     *   search_output_(['t1', 't2'], true) ==
     *       '(incompatible:t1 incompatible:t2)';
     * </code>
     * If wrap is TRUE, wrap the result within parentheses '()'.
     * @param {Array.<string>} types The list of type ids.
     * @param {?Boolean} opt_wrap If TRUE, wrap the result with parens.
     * @return {String} A valid search output value with or without parens.
     */
    search_output_: function(types, opt_wrap) {
      var o = types.map(function(t) {
        return 'incompatible:' + t;
      }).join(' ');
      if (opt_wrap) {
        o = '(' + o + ')';
      }
      return o;
    },

    /**
     * Check the suggest item (that was selected) containing the
     * Search API incompatible output result as specified in
     * fb.incompatible_types.suggest_options.
     *
     * If search deemed the item incompatible with the specified type,
     * callbacks.incompatible will be invoked with 3 arguments:
     * <ol>
     *   <li>{Object} data - The suggest data on fb-select.</li>
     *   <li>{string} type_id - The type that is incompatible or whose
     *       included types are incompatible.</li>
     *   <li>included_types - The included types of type_id.</li>
     * </ol>
     * Otherwise, callbacks.compatible will be invoked.
     *
     * Usage:
     * <code>
     *   check(
     *       suggest_data,
     *       "/location/country",
     *       ['/location/location', '/common/topic'],
     *       {
     *         compatible: function(data, type_id) { ... },
     *         incompatible: function(data, type_id) { ... }
     *       });
     * </code>
     *
     * @param {Object} suggest_data The suggest data or search result item to
     *    check for incompatible results.
     * @param {string} type_id The type we are checking for incompatibility
     * @param {Array.<string>} included_types The included types of type_id we
     *    are checking for incompatibility.
     * @param {Object} callbacks Object signature:
     *     {Function} callbacks.compatible, {Function} callbacks.incompatible.
     */
    check: function(suggest_data, type_id, included_types, callbacks) {
      callbacks = callbacks || {};
      var incompatible = false;
      var output = suggest_data.output;
      if (output) {
        // Check type_id and included_types in the search output
        var check_types = [type_id].concat(included_types || []);
        $.each(check_types, function(i, t) {
          var key = 'incompatible:' + t;
          if (// Search return 'true' instead of boolean
              output[key]['/type/object/type'][0] === 'true' ||
              output[key]['/type/object/type'][0] === true) {
            incompatible = true;
          }
          // Short-circuit if incompatible==TRUE
          return !incompatible;
        });
      }
      if (incompatible) {
        if (callbacks.incompatible) {
          // incompatible types
          callbacks.incompatible(suggest_data, type_id, included_types);
        }
      }
      else if (callbacks.compatible) {
        callbacks.compatible(suggest_data, type_id, included_types);
      }
    },

    /**
     * Invoke Search API directly to check incompatibility of a topic id to a
     * type and its included types.
     * @param {string} id The topic id to check if incompatible with type_id.
     * @param {string} type_id The type id to check if incompatible with id.
     * @param {Array.<string>} included_types The included types of type_id.
     * @param {Object} callbacks Signature: {Function} callbacks.compatible,
     *     {Function} callbacks.incompatible.
     * @see check
     */
    search: function(id, type_id, included_types, callbacks) {
      var types = [type_id].concat(included_types || []);
      var options = {
        filter: '(all mid:' + id + ')',
        output: it.search_output_(types, true),
        key: fb.acre.freebase.api_key
      };
      $.ajax({
        url: fb.h.fb_googleapis_url('/search', options),
        dataType: 'jsonp',
        success: function(data) {
          if ($.isArray(data.result) && data.result.length > 0) {
            it.check(data.result[0], type_id, included_types, callbacks);
          }
          else if (callbacks.compatible) {
            // Search did not return any results.
            // http://bugs.freebase.com/browse/SITE-1290
            // Assume it's compatible.
            callbacks.compatible({id:id}, type_id, included_types);
          }
        }
      });
    },

    /**
     * The default incompatible callback allowing the user to override
     * or cancel.
     *
     * This will return a callback function that can be used as
     * incompatible callback for check().
     *
     * Usage:
     * <code>
     *   check(
     *       data, 
     *       '/location/country', 
     *       ['/location/location', '/common/topic'],
     *       {
     *         compatible: function() {...},
     *         incompatible: overlay_incompatible_callback({
     *           onLoad: function() {...},   // optional
     *           onClose: function() {...},  // optional
     *           onCancel: function() {...}, // optional
     *           onConfirm:
     *               function(data, type_id, included_types) {...} // optional
     *         })
     *       });
     *
     * @param callbacks:Object - A map of callback options with respect
     *     to the overlay with the following signature:
     *     <ul>
     *       <li>{Function} onLoad When the dialog is loaded and displayed.
     *       <li>{Function} onClose When the dialog is closed.
     *       <li>{Function} onCancel When the user clicks the cancel button.
     *       <li>{Function} onConfirm When the user confirms (override) the
     *         incompatibility dialog. This method will invoked with the
     *         suggest_data, type_id and included_types.</li>
     * @param opt_input:Object - jQuery object referring to the input element
     *     that initiated the incompatible check. This is most likely a suggest
     *     input.
     */
    overlay_incompatible_callback: function(callbacks, opt_input) {
      if (!it.overlay_dialog) {
        it.overlay_dialog = $(".incompatible-overlay-dialog");
      }
      if (it.overlay_dialog.length) {
        callbacks = callbacks || {};
        return function(suggest_data, type_id, included_types) {
          it.overlay_dialog.removeData("overlay");

          $(".modal-content", it.overlay_dialog)
            .empty()
            .append(it.description_html(suggest_data, type_id, included_types));

          it.overlay_dialog.overlay({
            close: "button",
            closeOnClick: false,
            load: true,
            fixed: false,
            mask: {
              color: '#000',
              loadSpeed: 200,
              opacity: 0.5
            },
            onClose: function() {
              if (opt_input) {
                opt_input.focus().select();
              }
              $("button", it.overlay_dialog).unbind();
              if (callbacks.onClose) {
                callbacks.onClose();
              }
            },
            onLoad: function() {
              $(".cancel", it.overlay_dialog)
                .focus()
                .click(function() {
                  if (opt_input) {
                    opt_input.focus().select().trigger("textchange");
                  }
                  if (callbacks.onCancel) {
                    callbacks.onCancel();
                  }
                });
                $(".save", it.overlay_dialog)
                  .click(function() {
                    if (opt_input) {
                      opt_input.focus().select();
                    }
                    if (callbacks.onConfirm) {
                      callbacks.onConfirm(
                          suggest_data, type_id, included_types);
                    }
                  });
                if (callbacks.onLoad) {
                  callbacks.onLoad();
                }
              }
            });
        };
      }
      else {
        return it.native_confirm_incompatible_callback(callbacks, opt_input);
      }
    },

    /**
     * This is like overlay_incompatible_callback but displayed inline
     * with the an_input instead of using an overlay.
     *
     * @see overlay_suggest_incompatible_callback
     */
    inline_incompatible_callback: function(callbacks, input) {
      if (!it.inline_dialog) {
        it.inline_dialog = $(".incompatible-inline-dialog");
      }
      if (it.inline_dialog.length) {
        callbacks = callbacks || {};
        return function(suggest_data, type_id, included_types) {
          $(".modal-content", it.inline_dialog)
            .empty()
            .append(it.description_html(suggest_data, type_id, included_types));

          $(".save", it.inline_dialog)
            .unbind()
            .click(function() {
              input.focus().select();
              if (callbacks.onConfirm) {
                callbacks.onConfirm(suggest_data, type_id, included_types);
              }
              it.inline_dialog.hide(callbacks.onClose);
            });
          $(".cancel", it.inline_dialog)
            .unbind()
            .click(function() {
              input.focus().select().trigger("textchange");
              if (callbacks.onCancel) {
                callbacks.onCancel();
              }
              it.inline_dialog.hide(callbacks.onClose);
            });
          var offset_parent = input.offsetParent();
          var offset = input.position();
          offset_parent.append(it.inline_dialog);
          it.inline_dialog.css({
              top:offset.top+input.outerHeight(),
              left:offset.left
          });
          it.inline_dialog.show(callbacks.onLoad);
        };
      }
      else {
        return it.native_confirm_incompatible_callback(callbacks, input);
      }
    },

    /**
     * This is like overlay_incompatible_callback but using the native
     * confirm dialog.
     *
     * @see overlay_suggest_incompatible_callback
     */
    native_confirm_incompatible_callback: function(callbacks, opt_input) {
      callbacks = callbacks || {};
      return function(suggest_data, type_id, included_types) {
        // Since we are using the native confirm dialog,
        // there is no way to add a hook for callbacks.onLoad.
        if (confirm(it.description_text(
            suggest_data, type_id, included_types))) {
          if (opt_input) {
            opt_input.focus().select();
          }
          if (callbacks.onConfirm) {
            callbacks.onConfirm(suggest_data, type_id, included_types);
          }
        }
        else {
          if (opt_input) {
            opt_input.focus().select().trigger("textchange");
          }
          if (callbacks.onCancel) {
            callbacks.onCancel();
          }
        }
        if (callbacks.onClose) {
          callbacks.onClose();
        }
        if (opt_input) {
          opt_input.focus().select();
        }
      };
    },

    /**
     * Generate the description html for the incompatible dialogs
     * (overlay and inline).
     *
     * @param topic_id:String - The topic we are trying to assert the
     *     incompatible_type_id.
     * @param type_id:String - The incompatible type id.
     * @param included_types:Object - The included types of type_id.
     */
    description_html: function(suggest_data, type_id, included_types) {
      var html = $("<p>");
      var div;
      div = $('<div><b class="incompatible-topic"></b> '
              + 'is incompatible with '
              + '<b class="incompatible-type"></b>.</div>');
      $(".incompatible-topic", div).text(
        suggest_data.name || suggest_data.id);
      $(".incompatible-type", div).text(type_id);
      html.append(div);

      div = $('<div>If you continue, '
              + '<b class="incompatible-topic"></b> '
              + 'will be typed as <b class="incompatible-type"></b> '
              + 'and its included types (if any).</div>');
      $(".incompatible-topic", div).text(suggest_data.name || suggest_data.id);
      $(".incompatible-type", div).text(type_id);
      html.append(div);

      html.append("<p>Are you sure you want to continue?<p>");

      return html;
    },

    /**
     * Generate the description text for the incompatible native confirm dialog.
     */
    description_text: function(suggest_data, type_id, included_types) {
      return it.description_html(suggest_data, type_id, included_types).text();
    }

  };

})(jQuery, window.freebase);
