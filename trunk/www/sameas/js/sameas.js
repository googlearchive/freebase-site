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

(function($, fb, propbox) {

  var sameas = fb.sameas = {

    init: function() {

      // Initialize filter menu collapse/expand
      $(".column.nav").collapse_module({modules: ".module", column: ".section"});

      // Initialize user/creator suggest input
      $(":text[name=creator]")
        .suggest(fb.suggest_options.any("type:/type/user"))
        .bind("fb-select", function(e, data) {
          $(this).val(data.id)
            .parents("form:first").submit();
        });

      // Initialize filters
      propbox.init_menus();

      sameas.init_infinitescroll();
    },

    init_infinitescroll: function() {
      var tbody = $("#infinitescroll > tbody");
      var next = tbody.attr("data-next");
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
        var next = html.attr("data-next");
        if (next) {
          var new_rows = $(">tr", html);
          tbody.append(new_rows);
          new_rows.each(function() {
              propbox.init_menus(this, true);              
          });
          tbody.attr("data-next", next);
          // update links count
          var len = $(">tr", tbody).length;
          var context = $("[name=infinitescroll-count]");
          $(".number", context).attr("data-value", len).text(len);
          // re-init tablesorter
          tbody.parent("table").trigger("update");
        }
        else {
          //console.log("STOP INFINITE SCROLL!!!");
          $(window).unbind('.infscr');
        }
      });
      $(window).trigger("scroll");
    },

    add_key: function(e) {
      var trigger = $(this);
      fb.get_script(fb.h.static_url("sameas-edit.mf.js"), function() {
        sameas.edit.add_key_begin(trigger, $("#infinitescroll > tbody:first"));
      });
      return false;
    },

    edit_key: function(context) {
      var key_row = $(context).parents(".submenu").data("headmenu").parents(".data-row:first");
      fb.get_script(fb.h.static_url("sameas-edit.mf.js"), function() {
        sameas.edit.edit_key_begin(key_row);
      });
      return false;
    },

    delete_key: function(context) {
      var key_row = $(context).parents(".submenu").data("headmenu").parents(".data-row:first");
      fb.get_script(fb.h.static_url("sameas-edit.mf.js"), function() {
        sameas.edit.delete_key_begin(key_row);
      });
      return false;
    }

  };

  $(sameas.init);

})(jQuery, window.freebase, window.propbox);
