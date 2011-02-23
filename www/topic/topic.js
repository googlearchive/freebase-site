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
      var row_menu = $("#row-menu");
      $(".menu-trigger", context).each(function() {
        $(this).tooltip({
          events: {def: "click,mouseout"},
          position: "bottom right",
          offset: [-10, -10],
          effect: "fade",
          delay: 300,
          tip: "#row-menu",
          onBeforeShow: function() {
            var trigger = this.getTrigger();
            var md = trigger.parents(".kbs:first").metadata();
            row_menu.empty();
            $.each(md.m, function(i, menu) {
              var li = $('<li class="row-menu-item">');
              var a = $('<a>').text(menu.text);
              $.each(menu.attrs, function(k,v) {
                a.attr(k, v);
              });
              li.append(a);
              row_menu.append(li);
            });
            row_menu.data("trigger", trigger);
          }
        });
      });
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
        });

      // init row context menu
      topic.init_row_menu("#topic-data");

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
    },

    prop_edit: function(e) {
      var trigger = $("#row-menu").data("trigger");
      topic.prop_edit_trigger(trigger);
      return false;
    },

    prop_add: function(e) {
      var trigger = $("#row-menu").data("trigger");
      topic.prop_add_trigger(trigger);
      return false;
    },

    value_edit: function(e) {
      var trigger =  $("#row-menu").data("trigger");
      topic.value_edit_trigger(trigger);
    },

    prop_edit_trigger: function(trigger) {
      console.log("prop_edit_trigger", trigger.parents(".kbs:first").metadata());
    },

    prop_add_trigger: function(trigger) {
      console.log("prop_add_trigger", trigger.parents(".kbs:first").metadata());
    },

    value_edit_trigger: function(trigger) {
      console.log("value_edit_trigger", trigger.parents(".kbs:first").metadata());
    }
  };


  $(topic.init);
})(jQuery, window.freebase);
