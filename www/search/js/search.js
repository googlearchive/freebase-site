
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
      search.query = $('#query').focus();
      search.query
        .keypress(function(e) {
          if (e.keyCode === 13) {
            e.preventDefault();
            search.update_window_history();
            search.update_search();
          }
        });

      // Init filter box(es)
      $('.pill-box').each(function() {
        search.init_filter_box($(this));
      });

      // Init pill box management (+/-)
      // and handle options changes (checkboxes, select)
      $('#tabbar')
        .on('click', 'button.new-operator', search.new_filter_box)
        .on('click', 'button.remove-operator', search.remove_filter_box)
        .on('change', 'select', search.update_options)
        .on('change', ':checkbox', search.udpate_options);
      search.update_add_remove_filter_box_buttons();

      // Keyboard shorcut to filter 'f'
      fb.keyboard_shortcut.add('f', function() {
        $('.pill-suggest:first').focus();
      });

      // Handle infinite scroll
      search.infinitescroll();
    },

    init_filter_box: function(pill_box) {
      pill_box.click(function() {
        $(this).find('.pill-suggest').focus();
      });

      // Initialize filter suggest input
      $('.pill-suggest', pill_box)
          .suggest($.extend({
            scoring: 'schema'
          }, fb.suggest_options.all('type:/type/type')))
          .bind('fb-select', function(e, data) {
            var input = $(this);
            search.add_filter($(this).parents('.pill-box'), data.id);
            input.val('').trigger('textchange');
          })
          .focus(function() {
            $(this).parents('.pill-box').addClass('focused');
          })
          .blur(function() {
            $(this).parents('.pill-box').removeClass('focused');
          })
          .keydown(function(e) {
            // Backspace in empty input removes the last filter
            if (e.keyCode === 8 && $(this).val() === '') {
              $(this).parents('.pill-box').find('.pill-x:last').click();
            }
          });
    },

    new_filter_box: function(e) {
      var current = $(this).parents('.operator-filter');
      var clone = $('<div class="operator-filter">').append(current.html());
      $('.pill', clone).remove();
      $('button', clone).css('visibility', 'visible');
      current.after(clone);
      search.init_filter_box(clone.find('.pill-box'));
      $('.pill-suggest', clone).focus();
      search.update_add_remove_filter_box_buttons();
    },

    remove_filter_box: function(e) {
      $(this).parents('.operator-filter').remove();
      search.update_add_remove_filter_box_buttons();
      search.update_window_history();
      search.update_search();
    },

    /**
     * One filter box should always be present; you cannot remove
     * the last filter box. Otherwise, "+" and "-" should always be available.
     */
    update_add_remove_filter_box_buttons: function() {
      if ($('.operator-filter').length == 1) {
        $('button.remove-operator').css('visibility', 'hidden');
      }
      else {
        $('button.remove-operator').css('visibility', 'visible');
      }
    },

    /**
     * Add a filter pill.
     * @param {string} id The property id.
     */
    add_filter: function(pill_box, id) {
      if (search.get_filters(pill_box).indexOf(id) !== -1) {
        // already in the filter
        return;
      }
      var pill = search.pill(id);
      pill_box.find('.pill-suggest').before(pill);
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
      var params = {
        query: search.query.val(),
        lang: fb.h.lang_code(fb.lang)
      };
      var operators = {
        'any': [],
        'all': [],
        'should': [],
        'not': []
      };
      $('.operator-filter').each(function() {
        var filters = search.get_filters($(this).find('.pill-box'));
        if (filters.length) {
          var operator = $(this).find('select[name=operator]').val();
          if (operators[operator]) {
            operators[operator] = operators[operator].concat(filters);
          }
        }
      });
      for (var operator in operators) {
        if (operators[operator].length) {
          params[operator] = operators[operator];
        }
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
