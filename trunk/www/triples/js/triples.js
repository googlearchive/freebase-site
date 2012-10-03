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
(function($, fb) {

  var triples = fb.triples = {

    row_hoverover: function(e) {
      var row = $(this);
      triples.row_hoverover.timeout = setTimeout(function() {
        row.addClass("row-hover");
      }, 300);
    },

    row_hoverout: function(e) {
      clearTimeout(triples.row_hoverover.timeout);
      var row = $(this);
      row.removeClass("row-hover");
    },

    init_menus: function(context, nicemenu) {
      if (nicemenu) {
        $(".nicemenu", context).nicemenu();
      }
      $(">tr", context).hover(triples.row_hoverover, triples.row_hoverout);
    },

    init_linkcount: function(tbody, next) {
      var len = $(">tr", tbody).length;
      var context = $("[name=infinitescroll-count]");
      $(".number", context).attr("data-value", len).text(len);
      $(".more", context).toggle(!!next);
    },

    init_infinitescroll: function() {
      var tbody = $("#infinitescroll > tbody");
      var next = tbody.attr("data-next");
      triples.init_menus(tbody);
      triples.init_linkcount(tbody, next);
      if (!next) {
        // nothing to scroll
        return;
      }
      var a_next = $("#infinitescroll-next");
      tbody.infinitescroll({
        //debug: true,
        loading: {
          msgText: "Fetching more links",
          img: fb.h.static_url("lib/template/img/horizontal-loader.gif")
        },
        nextSelector: "#infinitescroll-next",
        navSelector: "#infinitescroll-next",
        dataType: "json",
        pathParse: function() {
          return [
            a_next[0].href + "&" + $.param({next:tbody.attr("data-next")}) + "&page=",
            ""
          ];
        },
        appendCallback: false
      }, function(data) {
        data = JSON.parse(data);
        var html = $(data.result.html);
        triples.init_menus(html, true);
        var next = html.attr("data-next");
        tbody.append($(">tr", html));
        tbody.attr("data-next", next);
        triples.init_linkcount(tbody, next);
        // re-init tablesorter
        tbody.parent("table").trigger("update");
        if (!next) {
          $(window).unbind('.infscr');
        }
      });
      $(window).trigger("scroll");
    },

    init: function() {
      triples.init_menus();

      // Initialize filter menu collapse/expand
      $(".column.nav").collapse_module({modules: ".module", column: ".section"});

      // Initialize prop counts filter suggest input
      fb.filters.init_domain_type_property_filter(".column.nav");

      // Initialize user/creator suggest input
      $(":text[name=creator]")
        .suggest(fb.suggest_options.any("type:/type/user"))
        .bind("fb-select", function(e, data) {
          $(this).val(data.id)
            .parents("form:first").submit();
        });

      // Initialize infinite scroll
      triples.init_infinitescroll();

      // To avoid flickering for truncate css
      $("#infinitescroll").fixedcolumn();
    }
  };

  $(triples.init);

})(jQuery, window.freebase);
