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

    /**
     * linked_id is the id that the current set of links are "linked" to.
     * In other words, linked_id is either the "source" or "target"
     * of the links. In most cases, fb.c.id IS c.linked_id but
     * for property instances and user/attribution writes,
     * c.linked_id is NULL since the "source" and "target" can be anything
     */
    linked_id: fb.c.linked_id || null,
    object_type: fb.c.object_type || '/type/object',
    current_tab: fb.c.current_tab || 'links',
    provenance_type: fb.c.provenance_type || null,

    init: function() {
      // Recent filters
      $('#recent-filters-container').lrulist({
        key: 'links.filters',
        max: 10,
        separator: '<span class="sep">|</span>',
        template: links.recent_filter
      });

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
      $('.filter-options :checkbox').change(links.update_options);
      $('.filter-options :text').keypress(function(e) {
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
      $('#recent-filters-container').lrulist('update', id);
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
     * Callback for $.lrulist to create a recent filter item.
     */
    recent_filter: function(id) {
      return $('<a href="#">').text(id).click(links.click_filter);
    },

    /**
     * Click on a filter link whose text is the filter.
     */
    click_filter: function(e) {
      links.add_filter($(this).text());
      return false;
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
      // disable infinitescroll
      links.destroy_infinitescroll();
      var params = links.get_ajax_params();
      $.ajax($.extend(formlib.default_begin_ajax_options(), {
        url: fb.h.ajax_url('links.ajax'),
        data: params,
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

    get_ajax_params: function() {
      if (links.current_tab == 'instances' &&
          links.object_type == '/type/property') {
        // /type/property?instances
        return links.get_ajax_params_for_property_instances_();
      }
      else if (links.current_tab == 'writes') {
        if (links.object_type == '/type/user') {
          // /type/user?writes
          return links.get_ajax_params_for_user_writes_();
        }
        else if (links.object_type == '/type/attribution') {
          // /type/attribution?writes
          return links.get_ajax_params_for_attribution_writes_();
        }
        else {
          // I.e. /dataword/information_source?writes
          return links.get_ajax_params_for_provenance_writes_();
        }
      }
      else {
        // ?links
        return links.get_default_ajax_params_();
      }
    },

    get_ajax_params_for_property_instances_: function() {
      return links.get_default_ajax_params_();
    },

    get_ajax_params_for_user_writes_ : function() {
      return links.get_default_ajax_params_();
    },

    get_ajax_params_for_attribution_writes_ : function() {
      return links.get_default_ajax_params_();
    },

    get_ajax_params_for_provenance_writes_ : function() {
      var params = links.get_default_ajax_params_();
      params.provenance = params.creator;
      params.object_type = params.provenance_type;
      return params;
    },

    get_ajax_params_for_writes_: function() {
      return links.get_default_ajax_params_();
    },

    get_default_ajax_params_: function() {
      var params = links.get_default_page_params_();
      return $.extend(params, {
        linked_id: links.linked_id,
        current_tab: links.current_tab,
        object_type: links.object_type,
        provenance_type: links.provenance_type
      });
    },

    /**
     * Get the url params that identify the current filter and option state.
     */
    get_page_params: function() {
      if (links.current_tab == 'instances' &&
          links.object_type == '/type/property') {
        // /type/property?instances
        return links.get_page_params_for_property_instances_();
      }
      else if (links.current_tab == 'writes') {
        if (links.object_type == '/type/user') {
          // /type/user?writes
          return links.get_page_params_for_user_writes_();
        }
        else if (links.object_type == '/type/attribution') {
          // /type/attribution?writes
          return links.get_page_params_for_attribution_writes_();
        }
        else {
          // I.e. /dataword/information_source?writes
          return links.get_page_params_for_provenance_writes_();
        }
      }
      else {
        // ?links
        return links.get_default_page_params_();
      }
    },

    get_page_params_for_property_instances_: function() {
      // For property instances, we overload and disable the property filter
      // box with the current property being viewed.
      var params = links.get_default_page_params_();
      delete params.filter;
      return params;
    },

    get_page_params_for_user_writes_: function() {
      return links.get_page_params_for_writes_();
    },

    get_page_params_for_attribution_writes_: function() {
      return links.get_page_params_for_writes_();
    },

    get_page_params_for_provenance_writes_: function() {
      return links.get_page_params_for_writes_();
    },

    get_page_params_for_writes_: function() {
      // For all ?writes, we overload and disable the creator filter
      // box with the current object being viewed (user|attribution|provenance).
      var params = links.get_default_page_params_();
      delete params.creator;
      return params;
    },

    get_default_page_params_: function(){
      var params = {
        lang: fb.h.lang_code(fb.lang)
      };
      params[links.current_tab] = '';
      var filters = links.get_filters();
      if (filters.length) {
        params.filter = filters;
      }
      var creator = links.get_creator();
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
                $.param($.extend(links.get_ajax_params(), {
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
          links.destroy_infinitescroll();
        }
      });
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
