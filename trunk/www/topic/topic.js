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
          var md = $(this).metadata();
          if (md && md.m && md.m.length) {
            var action = md.m[0].action;
            var method = topic[action + "_trigger"];
            if (typeof method === "function") {
              var trigger = $(this).find(".menu-trigger:first");
              method(trigger, md);
            }
          }
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
      return false;
    },

    value_delete: function(e) {
      var trigger =  $("#row-menu").data("trigger");
      topic.value_delete_trigger(trigger);
      return false;
    },

    prop_edit_trigger: function(trigger, md) {
      md = md || trigger.parents(".kbs:first").metadata();
      trigger.data("tooltip").hide();
      console.log("prop_edit_trigger", trigger, md);
    },

    prop_add_trigger: function(trigger, md) {
      md = md || trigger.parents(".kbs:first").metadata();
      trigger.data("tooltip").hide();
      console.log("prop_add_trigger", trigger, md);
    },

    value_edit_trigger: function(trigger, md) {
      md = md || trigger.parents(".kbs:first").metadata();
      trigger.data("tooltip").hide();
      console.log("value_edit_trigger", trigger, md);
    },

    value_delete_trigger: function(trigger, md) {
      md = md || trigger.parents(".kbs:first").metadata();
      trigger.data("tooltip").hide();
      console.log("value_delete_trigger", trigger, md);
    }
  };


  $(topic.init);
})(jQuery, window.freebase);
