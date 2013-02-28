/*
 * Copyright 2013, Google Inc.
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

(function($, fb, propbox, formlib) {

  var h = fb.links_helpers = {

    page: null,

    current_tab: fb.c.current_tab || 'links',

    init_page: function(page_impl) {
      /**
       * Assert page_impl
       */
      h.page = page_impl;

      propbox.init_menus($('#links-data'));

      // Focus input when the filter box gets focus
      $('.pill-box:not(.disabled)').click(function() {
        $('.pill-suggest', this).focus();
      });

      // Initialize filter suggest input
      var pill_suggest = $('#pill-filter-suggest')
          .suggest($.extend({
            scoring: 'schema'
          }, fb.suggest_options.all('type:/type/property')))
          .bind('fb-select', function(e, data) {
            var input = $(this);
            var type = null;
            h.add_filter(data.id);
            input.val('').trigger('textchange');
          })
          .focus(function() {
            $('#pill-filter-box').addClass('focused');
          })
          .blur(function() {
            $('#pill-filter-box').removeClass('focused');
          })
          .keydown(function(e) {
            // Backspace in empty input removes the last filter
            if (e.keyCode === 8 && $(this).val() === '') {
              $('#pill-filter-box').find('.pill-x:last').click();
            }
          });

      if (!pill_suggest.is('.disabled')) {
        // Keyboard shorcut to filter 'f'
        fb.keyboard_shortcut.add('f', function() {
          pill_suggest.focus();
        });
      }

      // Initialize creator suggest input
      var creator_suggest = $('#pill-creator-suggest')
          .suggest(fb.suggest_options.any(
              'type:/type/user',
              'type:/type/attribution'))
          .bind('fb-select', function(e, data) {
            h.update_creator(data.id);
          })
          .focus(function() {
            $('#pill-creator-box').addClass('focused');
          })
          .blur(function() {
            $('#pill-creator-box').removeClass('focused');
          });


      // toggle fullts, fullattr client-side
      h.toggle_timestamp($('#fullts').is(':checked'));
      h.toggle_attribution($('#fullattr').is(':checked'));

      // Handle options changes (checkboxes, text-input)
      $('.filter-options :checkbox').change(h.update_options);
      $('.filter-options :text').keypress(function(e) {
        if (e.keyCode === 13) {
          h.update_options(e);
        }
      });

      // Handle infinite scroll
      h.infinitescroll();

    },

    toggle_timestamp: function(full, context) {
      if (full) {
        $('.fullts', context).show();
      }
      else {
        $('.fullts', context).hide();
      }
    },

    toggle_attribution: function(full, context) {
      if (full) {
        $('.fullattr', context).show();
      }
      else {
        $('.fullattr', context).hide();
      }
    },

    /**
     * Add a filter pill.
     * @param {string} id The property id.
     */
    add_filter: function(id) {
      if ($('#pill-filter-box').is('.disabled')) {
        return;
      }
      if (h.get_filters().indexOf(id) !== -1) {
        // already in the filter
        return;
      }
      var pill = h.create_pill(id);
      $('#pill-filter-suggest').before(pill);
      h.update_window_history();
      h.update_links();

      if (h.page.add_filter_callback) {
        h.page.add_filter_callback(id);
      }
    },

    /**
     * Remove a filter.
     */
    remove_filter: function(x) {
      var id = $(x).prev('.pill-value').val();;
      $(x).parent('.pill').remove();
      h.update_window_history();
      h.update_links();
      return false;
    },

    /**
     * Get current filters.
     */
    get_filters: function(container) {
      var filters = [];
      container = container || $('#pill-filter-box');
      container.find('.pill:visible').each(function() {
        var val = $(this).find('.pill-value').val();
        filters.push(val);
      });
      return filters;
    },

    get_creator: function() {
      var creator = h.get_filters($('#pill-creator-box'));
      if (creator.length) {
        return creator[0];
      }
      return null;
    },

    update_creator: function(id) {
      var box = $('#pill-creator-box');
      if (box.is('.disabled') || h.get_creator() == id) {
        return;
      }
      var pill = h.create_creator_pill(id);
      box
        .find('.pill:visible').remove().end()
        .prepend(pill);
      $('#pill-creator-suggest').css('visibility', 'hidden');
      h.update_window_history();
      h.update_links();
    },

    remove_creator: function() {
      $('#pill-creator-box')
        .find('.pill:visible').remove();
      // show creator suggest
      $('#pill-creator-suggest').css('visibility', 'visible').val('').focus();
      h.update_window_history();
      h.update_links();
    },

    update_options: function(e) {
      h.update_window_history();
      var input = e.target;
      if (input.name === 'fullts') {
        h.toggle_timestamp(input.checked);
      } else if (input.name === 'fullattr') {
        h.toggle_attribution(input.checked);
      } else {
        h.update_links();
      }
    },

    /**
     * Update the main links section with the current filters using ajax.
     */
    update_links: function() {
      // disable infinitescroll
      h.destroy_infinitescroll();
      var params = h.get_ajax_params();
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: h.page.get_ajax_url(),
        data: params,
        traditional: true,
        onsuccess: function(data) {
          $('#infinitescroll > tbody').replaceWith(data.result.html);
          h.toggle_timestamp($('#fullts').is(':checked'));
          h.toggle_attribution($('#fullattr').is(':checked'));
          propbox.init_menus($("#links-data"), true);
          h.infinitescroll();
        }
      }));
    },

    get_ajax_params: function() {
      var params = h.get_page_params();
      if (h.page.get_ajax_params_callback) {
        return h.page.get_ajax_params_callback(params);
      }
      else {
        return params;
      }
    },

    /**
     * Get the url params that identify the current page state
     * with the filter and view options.
     */
    get_page_params: function() {
      var params = {
        lang: fb.h.lang_code(fb.lang)
      };
      var filters = h.get_filters();
      if (filters.length) {
        params.filter = filters;
      }
      var creator = h.get_creator();
      if (creator) {
        params.creator = creator;
      }
      $('.filter-options input').each(function() {
        var input = $(this);
        if (input.is(':checkbox')) {
          if (input.is(':checked')) {
            params[input.attr('name')] = input.val();
          }
        }
        else if (input.is(':text')) {
          var name = input.attr('name');
          var val = input.val();
          if (val == '') {
            return;
          }
          var existing = params[name];
          if (existing == null) {
            params[name] = val;
          }
          else {
            if (!$.isArray(existing)) {
              existing = params[name] = [existing];
            }
            existing.push(input.val());
          }
        }
      });
      if (h.page.get_page_params_callback) {
        return h.page.get_page_params_callback(params);
      }
      else {
        return params;
      }
    },

    /**
     * Update window history so that filters are bookmark-able.
     */
    update_window_history: function(reload) {
      var params = $.param(h.get_page_params(), true);
      // update window history
      var url_parts = window.location.href.split('?');
      var new_url = url_parts[0] + '?' + h.current_tab + '&' + params;
      if (new_url != window.location.href) {
        if (reload || typeof history.replaceState !== 'function') {
          fb.status.doing('Loading...');
          window.location.href = new_url;
        }
        else {
          history.replaceState(null, '', new_url);
        }
      }
    },

    destroy_infinitescroll: function() {
      $('#infinitescroll > tbody').infinitescroll('destroy');
    },

    infinitescroll: function() {
      var tbody = $('#infinitescroll > tbody');
      var next = tbody.attr('data-next');
      if (!next) {
        // nothing to scroll
        return;
      }
      var a_next = $('#infinitescroll-next');
      tbody.infinitescroll({
        //debug: true,
        loading: {
          msgText: 'Fetching more links',
          img: fb.h.static_url('lib/template/img/horizontal-loader.gif'),
          selector: a_next.parent('td')
        },
        nextSelector: '#infinitescroll-next',
        navSelector: '#infinitescroll-next',
        dataType: 'json',
        pathParse: function() {
          return [
            a_next[0].href + '?' +
                $.param($.extend(h.get_ajax_params(), {
                  next: tbody.attr('data-next'),
                  offset: tbody.find('>tr').length
                })) + '&page=',
            ''
          ];
        },
        appendCallback: false
      }, function(data) {
        data = JSON.parse(data);
        var new_tbody = $(data.result.html);
        propbox.init_menus(new_tbody, true);
        var next = new_tbody.attr('data-next');
        tbody.append($('>tr', new_tbody));
        h.toggle_timestamp($('#fullts').is(':checked'));
        h.toggle_attribution($('#fullattr').is(':checked'));
        tbody.attr('data-next', next);
        if (!next) {
          h.destroy_infinitescroll();
        }
      });
    },

    toggle_cvt: function(trigger, id) {
      trigger = $(trigger);
      var row = trigger.parents('.data-row:first');
      if (trigger.is('.expanded')) {
        row.next('.cvt-row').hide();
        trigger.removeClass('expanded');
      }
      else {
        var cvt_row = row.next('.cvt-row');
        if (cvt_row.length) {
          cvt_row.show();
          trigger.addClass('expanded');
        }
        else {
          $.ajax($.extend(formlib.default_begin_ajax_options(), {
            url: h.page.get_ajax_url(),
            data: {linked_id: id},
            traditional: true,
            onsuccess: function(data) {
              var cvt_tbody = $(data.result.html);
              var cvt_table = $('<table class="data-table">').append(cvt_tbody);
              var cvt_tr = $('<tr class="cvt-row">');
              var cvt_td = $('<td>').attr('colspan', 7);
              cvt_td.append(cvt_table);
              cvt_tr.append(cvt_td);
              row.after(cvt_tr);
              trigger.addClass('expanded');
            }
          }));
        }
      }
    },

    PILL_HTML: (function() {
      return $('#pill-template').html();
    })(),

    create_pill: function(id, use_template) {
      var pill = $(use_template || h.PILL_HTML);
      $('.pill-text', pill).text(id)[0].href = '#' + id;
      $('.pill-value', pill).val(id);
      return pill;
    },

    PILL_CREATOR_HTML: (function() {
      return $('#pill-creator-template').html();
    })(),

    create_creator_pill: function(creator_id) {
      return h.create_pill(creator_id, h.PILL_CREATOR_HTML);
    }

  };

})(jQuery, window.freebase, window.propbox, window.formlib);
