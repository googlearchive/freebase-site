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
;(function($, fb, propbox) {

  var topic = fb.topic = {

    facet: null,

    init: function() {

      topic.facet = new TopicFacet();

      $('#page-content')
        .on('click', 'a.toc-link', function(e) {
          // Animate scroll table-of-content nav links
          var name = this.href.substring(this.href.indexOf('#') + 1);
          var a = $('a[name=' + escape_attr_(name) + ']');
          if (a.length) {
            $('html, body').animate({
              scrollTop: a.offset().top
            }, 1000);
          }
          return false;
        })
        .on('click', 'a.schema-name', function(e) {
          // Clicking on a schema (domain|type|property) name applies a filter.
          var name = $(this).attr('name');
          topic.add_filter(name);
          return false;
        });

      // Focus input when the filter box gets focus
      $('#pill-filter-box').click(function() {
        $('#pill-filter-suggest').focus();
      });

      propbox.init("#topic-data", {
        id: fb.c.id,
        base_ajax_url: fb.h.ajax_url("lib/propbox"),
        base_static_url: fb.h.static_url("lib/propbox"),
        lang: fb.lang || "/lang/en",
        suggest_impl: fb.suggest_options,

        /**
         * The incompatible_types interface.
         * Must implement "check" and "inline_suggest_incompatible_callback"
         * @see lib/incompatible_types/incompatible-types.js
         */
        incompatible_types: fb.incompatible_types
      });

      topic.update_facet();

      // Initialize toggle-types menu collapse/expand
      if ($.localstore('types_expanded')) {
        topic.toggle_types($('#types-toggle > a'));
      }

      // Initialize filter suggest input
      $('#pill-filter-suggest')
          .suggest($.extend({
            scoring: 'schema'
          }, fb.suggest_options.any('type:/type/domain',
                                    'type:/type/type',
                                    'type:/type/property')))
          .bind('fb-select', function(e, data) {
            var input = $(this);
            topic.add_filter(data.id);
            input.val('').trigger('textchange');
          });

      // Keyboard shortcuts overlay
      $(".keyboard-shortcuts > a").overlay({
          close: ".modal-buttons .button.cancel",
          closeOnClick: false,
          fixed: false,
          mask: {
            color: '#000',
            loadSpeed: 200,
            opacity: 0.5
          }
      });
    },

    /**
     * When scrolling, we want the nav to be fixed so it's always accessible.
     */
    init_nav_scrolling: function(nav) {
      if (nav.data('init_nav_scrolling')) {
        return;
      }
      var orig_offset = nav.offset();
      var nav_height = nav.outerHeight();
      var last_scroll_top = 0;

      var scroll_timer = null;
      var resize_timer = null;

      function delay_scroll() {
        var scroll_top = $(window).scrollTop();
        var scroll_down = scroll_top > last_scroll_top;

        if (scroll_down) {
          // 50px for the footer
          var window_height = $(window).innerHeight() - 50;
          if (scroll_top > orig_offset.top) {
            if (nav_height < window_height) {
              nav.offset({top: scroll_top});
              nav.addClass('fixed-nav');
            }
            else {
              var scroll_bottom = scroll_top + window_height;
              var nav_bottom = nav.offset().top + nav_height;
              if (nav_bottom < scroll_bottom) {
                nav.offset({top: scroll_bottom - nav_height, left:orig_offset.left});
                nav.addClass('fixed-nav');
              }
            }
          }
        }
        else {
          if (scroll_top > orig_offset.top) {
            if (scroll_top < nav.offset().top) {
              nav.offset({top: scroll_top});
              nav.addClass('fixed-nav');
            }
          }
          else {
            nav.removeClass('fixed-nav');
            nav.css({top:'', left:''});
          }
        }
        last_scroll_top = scroll_top;
      };

      function delay_resize() {
        var current_offset = nav.offset();
        nav.removeClass('fixed-nav');
        nav.css({top:'', left:''});
        orig_offset = nav.offset();
        nav_height = nav.outerHeight();
        last_scroll_top = 0;
        $(window).trigger('scroll');
      };

      $(window)
        .scroll(function(e) {
          clearTimeout(scroll_timer);
          scroll_timer = setTimeout(delay_scroll, 100);
        })
        .resize(function() {
          clearTimeout(resize_timer);
          resize_timer = setTimeout(delay_resize, 0);
        });
      nav.data('init_nav_scrolling', true);
      $(window).trigger('scroll');
    },

    /**
     * Collapse/expand domains/types table-of-contents.
     */
    toggle_types: function(toggle) {
      $(toggle).toggleClass('expanded');
      if ($(toggle).is('.expanded')) {
        var width = $('.nav.column').width() + 20;
        $.localstore('types_expanded', 1, false);
        $('.data.column').animate({marginRight: width}, function() {
          $('.nav.column').slideDown(function() {
            topic.init_nav_scrolling($(this));
          });
        });
      }
      else {
        $.localstore('types_expanded', 0, false);
        $('.nav.column').slideUp(function() {
          $('.data.column').animate({marginRight: 0});
        });
      }
    },

    /**
     * Add a filter pill.
     */
    add_filter: function(id) {
      var escape_id = escape_attr_(id);
      if ($('#pill-filter-box')
        .find('input[value=' + escape_id + ']').length) {
        // already in the filter
        return;
      }
      var pill = topic.pill(id);
      $('#pill-filter-suggest').before(pill);
      topic.update_facet(true);
    },

    /**
     * Remove a filter.
     */
    remove_filter: function(x) {
      $(x).parent('.pill').remove();
      topic.update_facet(true);
      return false;
    },

    update_facet: function(update_history) {
      var show_all = $('#show-all');
      var filters = topic.get_filters();
      if (filters.length) {
        topic.facet.filter(filters);
        fb.disable(show_all);
        $('.show-all-section').hide();
      }
      else {
        var checked = show_all.is(':checked');
        topic.facet.show_all(checked);
        fb.enable(show_all);
        // Update show all text
        if (checked) {
          $('.show-all-text').hide();
          $('.show-less-text').show();
        }
        else {
          $('.show-all-text').show();
          $('.show-less-text').hide();
        }
        $('.show-all-section').show();
      }
      if (update_history) {
        topic.update_window_history(filters);
      }

      // Need to trigger a window.resize to re-position nav scrolling
      // since nav toc size may have changed.
      $(window).trigger('resize');
    },

    /**
     * Get current filters.
     */
    get_filters: function() {
      var filters = [];
      $('#pill-filter-box').find('.pill:visible').each(function() {
        filters.push($(this).find('.pill-value').val());
      });
      return filters;
    },

    /**
     * Show all domains and properties checkbox
     */
    show_all: function(checked) {
      topic.update_facet(true);
      return false;
    },

    /**
     * Update window history so that filters are bookmark-able.
     */
    update_window_history: function(filters) {
      if (filters == null) {
        filters = topic.get_filters();
      }
      var all = $('#show-all').is(':checked');;
      var params = {props:''};
      if (filters.length) {
        params.filter = filters;
      }
      if (all === true) {
        params.all = true;
      }
      // update window history
      var url_parts = window.location.href.split('?');
      var new_url = url_parts[0];
      new_url = fb.h.build_url(new_url, params);
      if (new_url != window.location.href) {
        if (typeof history.replaceState === 'function') {
          history.replaceState(null, "", new_url);
        } else {
          window.loaction.href = new_url;
        }
      }
    },


    add_type: function(trigger, type_id) {
      trigger = $(trigger); // suggest input

      // incompatible type check
      function compatible_callback(id, type, incompatible_types) {
        fb.get_script(fb.h.static_url("manage-type.mf.js"), function() {
          topic.manage_type.add_type_begin(trigger, type_id, incompatible_types);
        });
      };
      function cancel_callback() {
        // try again
        trigger.focus();
      }
      function onload_callback() {
        // update .incompatible-topic with the current page topic name
        $(".incompatible-overlay-dialog .incompatible-topic").text($($(".page-title > h1 > span").get(0).firstChild).text());
      }
      fb.incompatible_types.check(fb.c.id, type_id, {
        compatible: compatible_callback,
        incompatible: fb.incompatible_types.overlay_suggest_incompatible_callback(trigger, {
            onLoad: onload_callback,
            onCancel: cancel_callback,
            onConfirm: compatible_callback
        })
      });

      return false;
    },

    remove_type: function(trigger, type_id) {
      trigger = $(trigger);
      fb.get_script(fb.h.static_url("manage-type.mf.js"), function() {
        topic.manage_type.remove_type_begin(trigger, type_id);
      });
      return false;
    },

    PILL_HTML: (function() {
      return $('#pill-template').html();
    })(),

    pill: function(id) {
      var pill = $(topic.PILL_HTML);
      $('.pill-text', pill).text(id)[0].href = "#" + id;
      $('.pill-value', pill).val(id);
      return pill;
    }
  };

  $(topic.init);


  function escape_attr_(val) {
    return val.replace(/\//g, '\\\/');
  };

  function domain_section_(id) {
    return $('.domain-section[data-id=' + escape_attr_(id) + ']');
  };

  function type_section_(id) {
    return $('.type-section[data-id=' + escape_attr_(id) + ']');
  };

  function property_section_(id) {
    return $('.property-section[data-id=' + escape_attr_(id) + ']');
  };

  function TopicFacet() {
    var domains = this.domains = {
      // Commons domains key'ed by domain id
      commons: [],
      // User/base domains key'ed by domain id
      not_commons: []
    };

    // All domain|type|property toc and sections key'ed by their id
    var schemas = this.schemas = {};

    var toc = $('#toc');
    var topicbox = $('#topic-data');
    var type_map = toc.metadata();

    $('.toc-domain', toc).each(function() {
      var toc_domain = $(this);
      var domain_id = toc_domain.attr('data-id');
      var domain_section = domain_section_(domain_id);
      var toc_types = toc_domain.next('.toc-types');
      var domain = {
        id: domain_id,
        toc: toc_domain,
        toc_types: toc_types,
        section: domain_section,
        types: [],
        bare_types: [],
        is: 'domain'
      };
      if (toc_domain.is('.commons')) {
        domains.commons.push(domain);
      }
      else {
        domains.not_commons.push(domain);
      }
      schemas[domain_id] = domain;
      $('.toc-type', toc_types).each(function() {
        var toc_type = $(this);
        var type_id = toc_type.attr('data-id');
        var type_section = type_section_(type_id);
        var type = {
          id: type_id,
          toc: toc_type,
          section: type_section,
          is: 'type',
          // So we can walk up the tree
          domain: domain,
          properties: []
        };
        if (type_map[type_id]) {
          domain.types.push(type);
        }
        else {
          domain.bare_types.push(type);
        }
        schemas[type_id] = type;

        $('.property-section', type_section).each(function() {
          var property_section = $(this);
          var property_id = property_section.attr('data-id');
          var property = {
            id: property_id,
            section: property_section,
            is: 'property',
            schema: type
          };
          type.properties.push(property);
          schemas[property_id] = property;
        });
      });
    });
  };

  /**
   * Filter the domain|type|property boxes given the list of filters.
   * @param {Array:<string>} filters The list of domain, type, or property ids
   *   to filter.
   * @throws {Error} If filters is null or empty.
   */
  TopicFacet.prototype.filter = function(filters) {
    if (!filters || filters.length === 0) {
      throw new Error("Empty filter is not allowed.");
    }

    filters = TopicFacet.reduce_filters(filters);

    var schemas = this.schemas;

    var domains = {};
    var types = {};
    var props = {};
    $.each(filters, function(i, f) {
      var schema = schemas[f];
      if (schema) {
        if (schema.is === 'domain') {
          domains[f] = true;
        }
        else if (schema.is === 'type') {
          types[f] = true;
        }
        else if (schema.is === 'property') {
          props[f] = true;
        }
      }
    });

    var all_domains = this.domains.commons.concat(this.domains.not_commons);
    $.each(all_domains, function(i, domain) {
      var show_domain = false;
      var all_types = domain.types.concat(domain.bare_types);
      $.each(all_types, function(j, type) {
        var show_type = false;
        $.each(type.properties, function(k, prop) {
          var show_prop = props[prop.id] ||
                          types[prop.schema.id] ||
                          domains[prop.schema.domain.id];
          if (show_prop) {
            show_type = true;
            prop.section.show();
          }
          else {
            prop.section.hide();
          }
        });
        show_type = show_type || types[type.id];
        if (show_type) {
          show_domain = true;
          type.section.show();
          type.toc.show();
        }
        else {
          type.section.hide();
          type.toc.hide();
        }
      });
      show_domain = show_domain || domains[domain.id];
      if (show_domain) {
        domain.section.show();
        domain.toc.show();
        domain.toc_types.show();
      }
      else {
        domain.section.hide();
        domain.toc.hide();
        domain.toc_types.hide();
      }
    });

  };

  /**
   * Filters are AND operators.
   * If we have /film, /film/film, /film/film/starring,
   * we only have to apply /film.
   */
  TopicFacet.reduce_filters = function(filters) {
    var reduced = [];
    filters.sort();
    for (var i=0,l=filters.length; i<l; i++) {
      var filter = filters[i];
      if (i === 0) {
        reduced.push(filter);
      }
      else {
        var previous_filter = reduced[reduced.length - 1];
        if (filter.indexOf(previous_filter) !== 0) {
          reduced.push(filter);
        }
      }
    }
    return reduced;
  };

  /**
   * Toggle to show or hide user/base domains and bare properties.
   * @param {boolean} all If TRUE, show user/base domains and bare properties.
   *   Otherwise, show only commons domains and asserted types
   *   and their properties.
   */
  TopicFacet.prototype.show_all = function(all) {
    if (all) {
      var all_domains = this.domains.commons.concat(this.domains.not_commons);
      $.each(all_domains, function(i, domain) {
        var all_types = domain.types.concat(domain.bare_types);
        $.each(all_types, function(j, type) {
          $.each(type.properties, function(k, prop) {
            if (prop.id === '/type/object/type' ||
                prop.id === '/type/object/key') {
              // Don't show name and key
              prop.section.hide();
            }
            else {
              prop.section.show();
            }
          });
          type.section.show();
          type.toc.show();
        });
        domain.section.show();
        domain.toc_types.show();
        domain.toc.show();
      });
    }
    else {
      // First hide all not_commons domains
      $.each(this.domains.not_commons, function(i, domain) {
        domain.section.hide();
        domain.toc_types.hide();
        domain.toc.hide();
      });
      // Now go through commons domains and hide "bare" types
      $.each(this.domains.commons, function(i, domain) {
        $.each(domain.types, function(j, type) {
          $.each(type.properties, function(k, prop) {
            prop.section.show();
          });
          type.section.show();
          type.toc.show();
        });
        $.each(domain.bare_types, function(i, type) {
          type.section.hide();
          type.toc.hide();
        });
        if (domain.types.length) {
          domain.section.show();
          domain.toc_types.show();
          domain.toc.show();
        }
        else {
          domain.section.hide();
          domain.toc_types.hide();
          domain.toc.hide();
        }
      });
    }
  };



})(jQuery, window.freebase, window.propbox);



