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

    init: function() {

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

      // Initialize filter menu collapse/expand
      $(".column.nav").collapse_module({modules: ".module", column: ".section"});

      // Initialize prop counts filter suggest input
      fb.filters.init_domain_type_property_filter(".column.nav");

      // Initialize fixed column for truncating columns
      $(".data-table").fixedcolumn({all:true});

      // Toggle for Add Types dialog
      $(".toolbar-trigger").click(function(){

        // the toolbar in which the trigger originated
        var $trigger = $(this);
        var $toolbar = $(this).closest(".toolbar");

        // outermost container of Type list
        var $add_type_pane = $(".manage-types").first().css('overflow', 'hidden');
        var PANEL_HEIGHT = $add_type_pane.outerHeight();

        // inner container of type list
        var $type_list_container = $(".topic-types", $add_type_pane).first();
        var $type_list = $(".topic-type-list", $add_type_pane).first();
        var list_length = $('ul', $type_list).children('li').length;


        // basic show/hide of Manage Type pane
        if($add_type_pane.is(":visible")) {
          $toolbar.removeClass("active");
          $trigger.removeClass("active");
          $add_type_pane.slideUp();
        }
        else {
          $trigger.addClass("active");
          $toolbar.addClass("active");
          $add_type_pane.slideDown(function() {
            if (!$trigger.data("initialized")) {
              topic.init_manage_types();
              $trigger.data("initialized", 1);
            }
          });

          // if the browser supports csscolumns, we do some extra
          // ui kung-fu, namely:
          //
          //  1. Determine whether there are enough current types
          //     to justify a multi-column layout
          //  2. If so, set accordingly

          if(Modernizr.csscolumns && list_length > 7) {

            $type_list.addClass('multicolumn');


          }
          // set the type list to setup scrolling behavior
          var offset = $type_list.position().top;
          var list_height = PANEL_HEIGHT - offset + 'px';
          $type_list.height(list_height);

          // the CSS sets type_list_container to opacity:0 by default
          // when javascript is enabled so we have to re-show it
          $type_list_container.animate({opacity: 1});

        }
        return false;
      });

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


      // show all domains link
      $("#show-all-domains-link").click(function() {
          $(":checkbox", ".filter-form.all-data-toggle").click();
          return false;
      });
    },

    init_manage_types: function() {
      $("#add-type-input")
        .suggest(fb.suggest_options.cotype())
        .bind("fb-select", function(e, data) {
          topic.add_type(this, data.id);
        })
        .focus();
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
    }
  };

  $(topic.init);

})(jQuery, window.freebase, window.propbox);
