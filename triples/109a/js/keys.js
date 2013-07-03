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
(function($, fb, lh, propbox, formlib) {

  var keys = fb.keys = {
    current_tab: fb.c.current_tab || 'keys',
    property: fb.c.property || '/type/object/key',

    init: function() {
      lh.init_page(keys);
    },

    get_ajax_url: function() {
      return fb.h.ajax_url('keys.ajax');
    },

    get_ajax_params_callback: function(params) {
      params.id = fb.c.id;
      params.property = keys.property;
      return params;
    },

    /**********
     * EDITING
     **********/

    /**
     * Add key
     */
    add_key: function() {
      var body = $('#infinitescroll > tbody');
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url('add_key_begin.ajax'),
        data: {
          id: fb.c.id,
          p: keys.property,
          lang: fb.lang
        },
        onsuccess: function(data) {
          var form = $(data.result.html);
          var event_prefix = 'fb.keys.add_key.';
          var options = {
            event_prefix: event_prefix,
            // callbacks
            init: keys.add_key_init,
            validate: keys.add_key_validate,
            submit: keys.add_key_submit,
            reset: keys.add_key_reset,
            // submit ajax options
            ajax: {
              url: fb.h.ajax_url('edit_key_submit.ajax')
            },
            // jQuery objects
            body: body,
            form: form
          };
          formlib.init_modal_form(options);
        }
      }));
    },

    add_key_init: function(options) {
      keys.init_modal_help(options.form);
      keys.edit_key_reset(options);
    },

    add_key_validate: function(options) {
      var namespace = $(':input[name=namespace]', options.form);
      if (!namespace.data('data.suggest')) {
        formlib.disable_submit(options);
        return false;
      }
      var key = $(':input[name=value]', options.form);
      if (formlib.validate_mqlkey(options, key)) {
        formlib.enable_submit(options);
        return true;
      }
      else {
        formlib.disable_submit(options);
        return false;
      }
    },

    add_key_submit: function(options, ajax_options) {
      var p = $('input[name=p]', options.form).val();
      var namespace = $(':input[name=namespace]', options.form);
      var key = $(':input[name=value]', options.form);
      $.extend(ajax_options.data, {
        s: fb.c.id,
        p: p,
        namespace: namespace.data('data.suggest').id,
        value: key.val()
      });
      $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
          var new_row = $(data.result.html);
          options.body.prepend(new_row);
          propbox.init_menus(new_row, true);
          formlib.animate_new_row(new_row);
          keys.edit_key_reset(options);
          options.form.trigger(options.event_prefix + 'success');
          setTimeout(function() {
            fb.status.info('Key successfully added');
          });
        }
      }));
    },

    edit_key_reset: function(options) {
      var p = $('input[name=p]', options.form).val();
      var namespace = $(':input[name=namespace]', options.form);
      var key = $(':input[name=value]', options.form);
      if (namespace.is(':disabled')) {
        /**
         * Edit existing key
         */
        // validate key values
        formlib.init_mqlkey(key, {
          mqlread: fb.mqlread,
          namespace: p === '/type/namespace/keys' ?
              fb.c.id : namespace.attr('data-id'),
          check_key: true
        });
        key
          .bind('valid', function(e) {
            e.stopPropagation();
            formlib.enable_submit(options);
          })
          .bind('invalid textchange', function(e) {
            e.stopPropagation();
            formlib.disable_submit(options);
          })
          .focus();
      }
      else {
        /**
         * Add a new key
         */
        // clear out input values
        namespace.val('');
        // disable key input until they choose the namespace
        fb.disable(key.val(''));
        // reset key check status
        key.next('.key-status').removeClass('valid invalid loading');
        // hook up suggest to namespace input
        var suggest_options = null;
        if (p === '/type/namespace/keys') {
          // namespace input can be any object
          suggest_options = $.extend({}, fb.suggest_options.service_defaults);
        }
        else {
          // namespace input needs to be a namespace
          suggest_options = fb.suggest_options.instance('/type/namespace');
        }
        namespace
          .suggest(suggest_options)
          .bind('fb-select', function(e, data) {
            $(this).val(data.id);
            // enable key input
            fb.enable(key.val(''));
            // validate key values
            formlib.init_mqlkey(key, {
              mqlread: fb.mqlread,
              namespace: p === '/type/namespace/keys' ? fb.c.id : data.id,
              check_key: true
            });
            key
              .bind('valid', function(e) {
                e.stopPropagation();
                formlib.enable_submit(options);
              })
              .bind('invalid textchange', function(e) {
                e.stopPropagation();
                formlib.disable_submit(options);
              })
              .focus();
          })
          .focus();
      }
      formlib.disable_submit(options);
    },

    /**
     * Edit key
     */
    edit_key: function(context) {
      var key_row = $(context)
          .parents('.submenu').data('headmenu').parents('.data-row:first');
      var key_namespace = $('.key-namespace', key_row).attr('data-id');
      var key_value = $('.key-value', key_row).attr('data-value');
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url('edit_key_begin.ajax'),
        data: {
          s: fb.c.id,
          p: keys.property,
          namespace: key_namespace,
          value: key_value,
          lang: fb.lang
        },
        onsuccess: function(data) {
          var form = $(data.result.html);
          var options = null;
          var event_prefix = 'fb.keys.edit_key.';
          if (form.is('.not-permitted')) {
            options = {
              event_prefix: event_prefix,
              // callbacks
              init: $.noop,
              validate: $.noop,
              submit: $.noop,
              // jQuery objects
              form: form
            };
          }
          else {
            options = {
              event_prefix: event_prefix,
              // callbacks
              init: keys.edit_key_init,
              validate: keys.edit_key_validate,
              submit: keys.edit_key_submit,
              // submit ajax options
              ajax: {
                url: fb.h.ajax_url('edit_key_submit.ajax')
              },
              // jQuery objects
              form: form,
              row: key_row
            };
          }
          formlib.init_modal_form(options);
        }
      }));
    },

    edit_key_init: function(options) {
      keys.init_modal_help(options.form);
      keys.edit_key_reset(options);
    },

    edit_key_validate: function(options) {
      var key = $(':input[name=value]', options.form);
      if (formlib.validate_mqlkey(options, key)) {
        formlib.enable_submit(options);
        return true;
      }
      else {
        formlib.disable_submit(options);
        return false;
      }
    },

    edit_key_submit: function(options, ajax_options) {
      var namespace = $(':input[name=namespace]', options.form);
      var key = $(':input[name=value]', options.form);
      $.extend(ajax_options.data, {
        s: fb.c.id,
        p: keys.property,
        namespace: namespace.val(),
        // This is the new key value
        value: key.val()
        // The old key value (hidden input) is automatically
        // submitted by formlib (in ajax_options.data)
      });
      $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
          var new_row = $(data.result.html);
          options.row.hide()
              .before(new_row)
              .remove();
          propbox.init_menus(new_row, true);
          formlib.animate_new_row(new_row);
          options.form.trigger(options.event_prefix + 'cancel');
          setTimeout(function() {
            fb.status.info('Key successfully edited');
          });
        }
      }));
    },

    delete_key: function(context) {
      var key_row = $(context)
          .parents('.submenu').data('headmenu').parents('.data-row:first');
      var key_namespace = $('.key-namespace', key_row).attr('data-id');
      var key_value = $('.key-value', key_row).attr('data-value');
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url('delete_key_begin.ajax'),
        data: {
          s: fb.c.id,
          p: keys.property,
          namespace: key_namespace,
          value: key_value,
          lang: fb.lang
        },
        onsuccess: function(data) {
          var form = $(data.result.html);
          var options = null;
          var event_prefix = 'fb.keys.delete_key.';
          if (form.is('.not-permitted')) {
            options = {
              event_prefix: event_prefix,
              // callbacks
              init: $.noop,
              validate: $.noop,
              submit: $.noop,
              // jQuery objects
              form: form
            };
          }
          else {
            options = {
              event_prefix: event_prefix,
              // callbacks
              init: keys.delete_key_init,
              validate: keys.delete_key_validate,
              submit: keys.delete_key_submit,
              // submit ajax options
              ajax: {
                url: fb.h.ajax_url('delete_key_submit.ajax')
              },
              // jQuery objects
              form: form,
              row: key_row
            };
          }
          formlib.init_modal_form(options);
        }
      }));
    },

    delete_key_init: function(options) {
      formlib.enable_submit(options);
    },

    delete_key_validate: function(options) {
      return true;
    },

    delete_key_submit: function(options, ajax_options) {
      $.ajax($.extend(ajax_options, {
        onsuccess: function(data) {
          options.row.remove();
          options.form.trigger(options.event_prefix + 'cancel');
          setTimeout(function() {
            fb.status.info('Key successfully deleted');
          });
        }
      }));
    },

    /**
     * modal help dialog initialization
     */
    init_modal_help: function(context) {
      // Show/Hide help menu in domain creation dialog
      var link = $('.modal-help-toggle', context);
      var content = $('.modal-help', context);
      link.click(function() {
        if (content.is(':visible')) {
          content.slideUp(function() {
            link.text('[ + ] Show Help');
          });
        }
        else {
          content.slideDown(function() {
            link.text('[ - ] Hide Help');
          });
        }
      });
    }
  };

  $(keys.init);

})(jQuery, window.freebase, window.freebase.links_helpers,
   window.propbox, window.formlib);
