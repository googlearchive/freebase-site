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

(function($, fb) {

  var triples = fb.triples = {
    tip: null,
    build_query: null,
    build_query_url: null,

    // trigger for row menus
    init_row_menu: function(context) {
      triples.tip = $("#triple-tip");
      triples.build_query = $("#build-query");
      triples.build_query_url = triples.build_query.attr("href");

      $(".row-menu-trigger", context).each(function(){
        var trigger = $(this);
        trigger.tooltip({
          events: {def: "click,mouseout"},
          position: "bottom right",
          offset: [-10, -10],
          effect: "fade",
          delay: 300,
          tip: "#triple-tip",
          onBeforeShow: function() {
            var triple = this.getTrigger().parents("tr:first").metadata();
            triples.build_query.attr("href", triples.build_query_url + "?q=" + triple.mql);
          }
        });
        trigger.parents("tr:first").hover(triples.row_menu_hoverover, triples.row_menu_hoverout);
      });
    },

    // show row menu button on hover
    row_menu_hoverover: function(e) {
      var row = $(this);
      row.addClass("row-hover");
      $(".row-menu-trigger", row).css('visibility','visible');
    },

    // hide row menu button on mouseout
    row_menu_hoverout: function(e) {
      var row = $(this);
      $(".row-menu-trigger", row).css('visibility','hidden');
      row.removeClass("row-hover");
    },

    init: function() {

      // Initialize filter menu collapse/expand
      $(".column.nav").collapse_module({modules: ".module", column: ".section"});

      // Initialize prop counts filter suggest input
      fb.filters.init_domain_type_property_filter(".column.nav");

      // Initialize the property limit slider
      fb.filters.init_limit_slider_filter("#limit-slider", 100, 1, 1000, 10);

      // Initialize user/creator suggest input
      $(":text[name=creator]").suggest({
        service_url: fb.h.legacy_fb_url(),
        type: "/type/user"
      })
      .bind("fb-select", function(e, data) {
        $(this).val(data.id)
          .parents("form:first").submit();
      });

      // Initialize row menu hovers & menus
      triples.init_row_menu();

    }
  };

  $(triples.init);

})(jQuery, window.freebase);
