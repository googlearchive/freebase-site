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

  var links = fb.links = {

    init: function() {
      // Focus input when the filter box gets focus
      $('#pill-filter-box').click(function() {
        $('#pill-filter-suggest').focus();
      });

      // Initialize filter suggest input
      var pill_suggest = $('#pill-filter-suggest')
          .suggest($.extend({
            scoring: 'schema'
          }, fb.suggest_options.all('type:/type/property')))
          .bind('fb-select', function(e, data) {
            var input = $(this);
            var type = null;
            links.add_filter(data.id);
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

      // Initialize creator suggest input
      var creator_suggest = $('#pill-creator-suggest')
          .suggest(fb.suggest_options.any(
              'type:/type/user',
              'type:/type/attribution'))
          .bind('fb-select', function(e, data) {
            links.update_creator(data.id);
          })
          .focus(function() {
            $('#pill-creator-box').addClass('focused');
          })
          .blur(function() {
            $('#pill-creator-box').removeClass('focused');
          });

      // Keyboard shorcut to filter 'f'
      fb.keyboard_shortcut.add('f', function() {
        pill_suggest.focus();
      });

      // toggle fullts, fullattr client-side
      links.toggle_timestamp($('#fullts').is(':checked'));
      links.toggle_attribution($('#fullattr').is(':checked'));

      // Handle options changes (checkboxes, text-input)
      $('#tabbar-controls :checkbox').change(links.update_options);
      $('#tabbar-controls :text').keypress(function(e) {
        if (e.keyCode === 13) {
          links.update_options(e);
        }
      });

      // Handle infinite scroll
      links.infinitescroll();
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
      if (links.get_filters().indexOf(id) !== -1) {
        // already in the filter
        return;
      }
      var pill = links.pill(id);
      $('#pill-filter-suggest').before(pill);
      links.update_window_history();
      links.update_links();
    },

    /**
     * Remove a filter.
     */
    remove_filter: function(x) {
      var id = $(x).prev('.pill-value').val();;
      $(x).parent('.pill').remove();
      links.update_window_history();
      links.update_links();
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
      var creator = links.get_filters($('#pill-creator-box'));
      if (creator.length) {
        return creator[0];
      }
      return null;
    },

    update_creator: function(id) {
      if (links.get_creator() === id) {
        return;
      }
      var pill = links.pill_creator(id);
      $('#pill-creator-box')
        .find('.pill:visible').remove()
        .end()
        .prepend(pill);
      // hide creator suggest
      $('#pill-creator-suggest').css('visibility', 'hidden');
      links.update_window_history();
      links.update_links();
    },

    remove_creator: function() {
      $('#pill-creator-box')
        .find('.pill:visible').remove();
      // show creator suggest
      $('#pill-creator-suggest').css('visibility', 'visible').val('').focus();
      links.update_window_history();
      links.update_links();
    },

    update_options: function(e) {
      links.update_window_history();
      var input = e.target;
      if (input.name === 'fullts') {
        links.toggle_timestamp(input.checked);
      } else if (input.name === 'fullattr') {
        links.toggle_attribution(input.checked);
      } else {
        links.update_links();
      }
    },

    /**
     * Update the main links section with the current filters using ajax.
     */
    update_links: function() {
      var filters = links.get_filters();
      var params = links.get_page_params();
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url('links.ajax'),
        data: $.extend({id:fb.c.id}, params),
        traditional: true,
        onsuccess: function(data) {
          $('#infinitescroll > tbody').replaceWith(data.result.html);
          links.toggle_timestamp($('#fullts').is(':checked'));
          links.toggle_attribution($('#fullattr').is(':checked'));
          $("#links-data .nicemenu").nicemenu();
          links.infinitescroll();
        }
      }));
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
            url: fb.h.ajax_url('links.ajax'),
            data: {id: id},
            traditional: true,
            onsuccess: function(data) {
              var cvt_table = $(data.result.html).find('.data-table:first');
              // hide thead
              var thead = cvt_table.find('thead').remove();
              var tfoot = cvt_table.find('tfoot').remove();
              var cvt_tr = $('<tr class="cvt-row">');
              var cvt_td = $('<td>').attr('colspan', thead.find('th').length);
              cvt_td.append(cvt_table);
              cvt_tr.append(cvt_td);
              row.after(cvt_tr);
              trigger.addClass('expanded');
            }
          }));
        }
      }
    },

    /**
     * Get the url params that identify the current filter and option state.
     */
    get_page_params: function() {
      var filters = links.get_filters();
      var params = {links:'', lang:fb.h.lang_code(fb.lang)};
      if (filters.length) {
        params.filter = filters;
      }
      var creator = links.get_creator();
      if (creator) {
        params.creator = creator;
      }
      $('#tabbar-controls input').each(function() {
        var input = $(this);
        if (input.is(':checkbox')) {
          if (input.is(':checked')) {
            params[input.attr('name')] = input.val();
          }
        }
        else if (input.is(':text')) {
          var name = input.attr('name');
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
      var params = links.get_page_params();
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
                $.param($.extend(links.get_page_params(), {
                  id: fb.c.id,
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

        $('.nicemenu', new_tbody).nicemenu();

        var next = new_tbody.attr('data-next');
        tbody.append($('>tr', new_tbody));


        links.toggle_timestamp($('#fullts').is(':checked'));
        links.toggle_attribution($('#fullattr').is(':checked'));



        tbody.attr('data-next', next);
        if (!next) {
          $(window).unbind('.infscr');
        }
      });
//      $(window).trigger('scroll');
    },

    PILL_HTML: (function() {
      return $('#pill-template').html();
    })(),

    pill: function(id, use_template) {
      var pill = $(use_template || links.PILL_HTML);
      $('.pill-text', pill).text(id)[0].href = '#' + id;
      $('.pill-value', pill).val(id);
      return pill;
    },

    PILL_CREATOR_HTML: (function() {
      return $('#pill-creator-template').html();
    })(),

    pill_creator: function(creator_id) {
      return links.pill(creator_id, links.PILL_CREATOR_HTML);
    }
  };

  function escape_attr_(val) {
    return val.replace(/\//g, '\\\/');
  };

  function links_section_(name) {
    return $('.links-section[data-id=' + escape_attr_(name) + ']');
  };

  $(links.init);

})(jQuery, window.freebase, window.formlib);
