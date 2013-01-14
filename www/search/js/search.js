
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
(function($, fb, formlib) {

  var search = fb.search = {

    init: function() {

      // Take over main search box
      search.query = $('#fb-search-input');
      search.query.data('suggest')._destroy();
      search.query
        .unbind()
        .keypress(function(e) {
          if (e.keyCode === 13) {
            e.preventDefault();
            search.update_window_history();
            search.update_search();
          }
        });

      // Focus input when the filter box gets focus
      $('#pill-filter-box').click(function() {
        $('#pill-filter-suggest').focus();
      });

      // Initialize filter suggest input
      var pill_suggest = $('#pill-filter-suggest')
          .suggest($.extend({
            scoring: 'schema'
          }, fb.suggest_options.all('type:/type/type')))
          .bind('fb-select', function(e, data) {
            var input = $(this);
            search.add_filter(data.id);
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

      // Keyboard shorcut to filter 'f'
      fb.keyboard_shortcut.add('f', function() {
        pill_suggest.focus();
      });

      // Handle options changes (checkboxes, text-input)
      $('#tabbar-controls select').change(search.update_options);
      $('#tabbar-controls :checkbox').change(search.update_options);
      $('#tabbar-controls :text').keypress(function(e) {
        if (e.keyCode === 13) {
          search.update_options(e);
        }
      });

      // Handle infinite scroll
      search.infinitescroll();
    },

    /**
     * Add a filter pill.
     * @param {string} id The property id.
     */
    add_filter: function(id) {
      if (search.get_filters().indexOf(id) !== -1) {
        // already in the filter
        return;
      }
      var pill = search.pill(id);
      $('#pill-filter-suggest').before(pill);
      search.update_window_history();
      search.update_search();
    },

    /**
     * Remove a filter.
     */
    remove_filter: function(x) {
      var id = $(x).prev('.pill-value').val();;
      $(x).parent('.pill').remove();
      search.update_window_history();
      search.update_search();
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

    correction: function(value) {
      search.query.val(value);
      search.update_window_history();
      search.update_search();
    },

    update_options: function(e) {
      search.update_window_history();
      search.update_search();
    },

    /**
     * Update the main links section with the current filters using ajax.
     */
    update_search: function() {
      // disable infinitescroll
      search.destroy_infinitescroll();
      var params = search.get_page_params();
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url('search.ajax'),
        data: params,
        traditional: true,
        onsuccess: function(data) {
          $('#infinitescroll > tbody').replaceWith(data.result.html);
          // re-enable infinitescroll
          search.infinitescroll();
        }
      }));
    },

    /**
     * Get the url params that identify the current filter and option state.
     */
    get_page_params: function() {
      var filters = search.get_filters();
      var params = {
        query: search.query.val(),
        lang:fb.h.lang_code(fb.lang)
      };
      if (filters.length) {
        params.type = filters;
      }
      $('#tabbar-controls :input').each(function() {
        var input = $(this);
        var name = input.attr('name');
        if (input.is(':checkbox')) {
          if (input.is(':checked')) {
            params[name] = input.val();
          }
        }
        else {
          var value = params[name];
          if (value == null) {
            params[name] = input.val();
          }
          else {
            if ($.type(value) === 'string') {
              value = params[name] = [value];
            };
            value.push(input.val());
          }
        }
      });
      return params;
    },

    /**
     * Update window history so that filters are bookmark-able.
     */
    update_window_history: function(reload) {
      var params = search.get_page_params();
      // update window history
      var url_parts = window.location.href.split('?');
      var new_url = url_parts[0];
      new_url = fb.h.build_url(new_url, params);
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
      var cursor = tbody.attr('data-next');
      if (!cursor) {
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
                $.param($.extend(search.get_page_params(), {
                  cursor: tbody.attr('data-next')
                })) + '&page=',
            ''
          ];
        },
        appendCallback: false
      }, function(data) {
        data = JSON.parse(data);
        var new_tbody = $(data.result.html);
        tbody.append($('>tr.search-row', new_tbody));
        var cursor = new_tbody.attr('data-next');
        if (cursor) {
          tbody.attr('data-next', cursor);
        }
        else {
          tbody.removeAttr('data-next');
          search.destroy_infinitescroll();
        }
      });
    },

    PILL_HTML: (function() {
      return $('#pill-template').html();
    })(),

    pill: function(id, use_template) {
      var pill = $(use_template || search.PILL_HTML);
      $('.pill-text', pill).text(id)[0].href = '#' + id;
      $('.pill-value', pill).val(id);
      return pill;
    }
  };

  $(search.init);

})(jQuery, window.freebase, window.formlib);
