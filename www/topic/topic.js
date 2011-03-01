/*
 * Copyright 2010, Google Inc.
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
;(function($, fb) {

  var topic = fb.topic = {
    init_row_menu: function(context) {
      $(".menu-trigger", context).each(function() {
        // figure out the width of the menu, so we can offset it accordingly
        var offset_width = $(".row-menu:first").outerWidth();
        $(this).tooltip({
          events: {def: "click,mouseout"},
          relative: true,
          position: ["bottom", "right"],
          effect: "fade",
          delay: 300
        });
      });
    },

    // show row menu button on hover
    row_menu_hoverover: function(e) {
      var row = $(this);
      topic.row_menu_hoverover.timeout = setTimeout(function() {
        row.addClass("row-hover");
      }, 300);
    },

    // hide row menu button on mouseout
    row_menu_hoverout: function(e) {
      clearTimeout(topic.row_menu_hoverover.timeout);
      var row = $(this);
      row.removeClass("row-hover");
    },

    init: function() {
      // Init keyboard shortcuts @see kbs.js
      var kbs = fb.kbs.init("#topic-data");
      kbs.next_domain(true);
      $("#topic-data .kbs")
        .live("click", function() {
           // set current on click
           var current = kbs.get_current();
           kbs.set_next(current, $(this), true);
        })
        .live("edit", function() {
          var menu_item = $(this).find(".row-menu-item:first a").click();
        })
        .hover(topic.row_menu_hoverover, topic.row_menu_hoverout);

      // init row context menu
      topic.init_row_menu("#topic-data");

      // init combo-menu default actions
      $(".combo-menu .default-action")
        .live("click", function() {
          $(this).parents(".kbs:first").trigger("edit");
        });

      // Initialize filter menu collapse/expand
      $(".column.nav > .module").collapse_module(".section");

      // Initialize prop counts filter suggest input
      fb.filters.init_domain_type_property_filter(".column.nav");

      // Initialize the property limit slider
      fb.filters.init_limit_slider_filter("#limit-slider", 10, 1, 100, 1);

      $(".toolbar-trigger").click(function(){
        var $add_type_pane = $(".add-type").first();
        var $toolbar = $(this).closest(".toolbar");
        var $trigger = $(this);

        if($add_type_pane.is(":visible")) {
          $toolbar.removeClass("active");
          $trigger.removeClass("active");
          $add_type_pane.slideUp();
        }
        else {
          $trigger.addClass("active");
          $toolbar.addClass("active");
          $add_type_pane.slideDown();
        }
      });

      // DAE: this basic handling for data input styling
      // Feel free to refactor, but I need a focus class
      // on .data-input
      $(".fb-input").focusin(function(){
        $(this).parents(".data-input").addClass("focus");
      })

      $(".fb-input").focusout(function(){
        $(this).parents(".data-input").removeClass("focus");
      })
    },

    prop_edit: function(e) {
      var trigger = $(this).parents(".row-menu:first").prev(".menu-trigger");
      trigger.data("tooltip").hide();
      var prop = trigger.parents(".property-section").attr("data-id");
      console.log("prop_edit", prop);
      return false;
    },

    prop_add: function(e) {
      var trigger = $(this).parents(".row-menu:first").prev(".menu-trigger");
      trigger.data("tooltip").hide();
      var prop = trigger.parents(".property-section").attr("data-id");
      console.log("prop_add", prop);
      return false;
    },

    value_edit: function(e) {
      var trigger = $(this).parents(".row-menu:first").prev(".menu-trigger");
      trigger.data("tooltip").hide();
      var prop_value = trigger.parents(".combo-menu:first").prev(".property-value");
      var kbs = prop_value.parents(".kbs:first");
      if (kbs.is("tr")) {
        console.log("value_edit CVT", kbs.attr("data-id"));
      }
      else {
        console.log("value_edit", prop_value.attr("data-id") || prop_value.attr("data-value"));
      }
      return false;
    },

    value_delete: function(e) {
      var trigger = $(this).parents(".row-menu:first").prev(".menu-trigger");
      trigger.data("tooltip").hide();
      var prop_value = trigger.parents(".combo-menu:first").prev(".property-value");
      var kbs = prop_value.parents(".kbs:first");
      if (kbs.is("tr")) {
        console.log("value_delete CVT", kbs.attr("data-id"));
      }
      else {
        console.log("value_delete", prop_value.attr("data-id") || prop_value.attr("data-value"));
      }
      return false;
    }

  };


  $(topic.init);
})(jQuery, window.freebase);
