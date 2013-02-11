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
(function($, fb, lh) {

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
      lh.init_page(links);

      // Recent filters
      $('#recent-filters-container').lrulist({
        key: 'links.filters',
        max: 10,
        separator: '<span class="sep">|</span>',
        template: links.recent_filter
      });
    },

    add_filter_callback: function(id) {
      $('#recent-filters-container').lrulist('update', id);
    },

    get_ajax_url: function() {
      return fb.h.ajax_url('links.ajax');
    },


    /**
     * Callback for $.lrulist to create a recent filter item.
     */
    recent_filter: function(id) {
      return $('<a href="javascript:void(0);">')
          .text(id).click(links.click_filter);
    },

    /**
     * Click on a filter link whose text is the filter.
     */
    click_filter: function(e) {
      lh.add_filter($(this).text());
      return false;
    },

    get_ajax_params_callback: function(params) {
      if (links.current_tab == 'instances' &&
          links.object_type == '/type/property') {
        // /type/property?instances
        return links.get_ajax_params_for_property_instances_(params);
      }
      else if (links.current_tab == 'writes') {
        if (links.object_type == '/type/user') {
          // /type/user?writes
          return links.get_ajax_params_for_user_writes_(params);
        }
        else if (links.object_type == '/type/attribution') {
          // /type/attribution?writes
          return links.get_ajax_params_for_attribution_writes_(params);
        }
        else {
          // I.e. /dataword/information_source?writes
          return links.get_ajax_params_for_provenance_writes_(params);
        }
      }
      else {
        // ?links
        return links.get_default_ajax_params_(params);
      }
    },

    get_ajax_params_for_property_instances_: function(params) {
      params = links.get_default_ajax_params_(params);
      params.filter = lh.get_filters();
      return params;
    },

    get_ajax_params_for_user_writes_ : function(params) {
      return links.get_ajax_params_for_writes_(params);
    },

    get_ajax_params_for_attribution_writes_ : function(params) {
      return links.get_ajax_params_for_writes_(params);
    },

    get_ajax_params_for_provenance_writes_ : function(params) {
      params = links.get_ajax_params_for_writes_(params);
      params.provenance = params.creator;
      params.object_type = params.provenance_type;
      return params;
    },

    get_ajax_params_for_writes_: function(params) {
      params = links.get_default_ajax_params_(params);
      params.creator = lh.get_creator();
      return params;
    },

    get_default_ajax_params_: function(params) {
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
    get_page_params_callback: function(params) {
      if (links.current_tab == 'instances' &&
          links.object_type == '/type/property') {
        // /type/property?instances
        return links.get_page_params_for_property_instances_(params);
      }
      else if (links.current_tab == 'writes') {
        if (links.object_type == '/type/user') {
          // /type/user?writes
          return links.get_page_params_for_user_writes_(params);
        }
        else if (links.object_type == '/type/attribution') {
          // /type/attribution?writes
          return links.get_page_params_for_attribution_writes_(params);
        }
        else {
          // I.e. /dataword/information_source?writes
          return links.get_page_params_for_provenance_writes_(params);
        }
      }
      else {
        // ?links
        return params;
      }
    },

    get_page_params_for_property_instances_: function(params) {
      // For property instances, we overload and disable the property filter
      // box with the current property being viewed.
      delete params.filter;
      return params;
    },

    get_page_params_for_user_writes_: function(params) {
      return links.get_page_params_for_writes_(params);
    },

    get_page_params_for_attribution_writes_: function(params) {
      return links.get_page_params_for_writes_(params);
    },

    get_page_params_for_provenance_writes_: function(params) {
      return links.get_page_params_for_writes_(params);
    },

    get_page_params_for_writes_: function(params) {
      // For all ?writes, we overload and disable the creator filter
      // box with the current object being viewed (user|attribution|provenance).
      delete params.creator;
      return params;
    }

  };


  $(links.init);

})(jQuery, window.freebase, window.freebase.links_helpers);
