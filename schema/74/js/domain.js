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

  var d = fb.schema.domain = {
    init: function() {
      d.init_tablesorter();
      d.init_toggle_help_messages();
    },

    init_tablesorter: function() {
      $(".table-sortable").each(function() {
        var table = $(this);
        if ($("> tbody > tr", table).length) {
          //table.tablesorter();
          $("thead th:nth-child(2)", table)[0].count = 1;
          $("thead th:nth-child(3)", table)[0].count = 1;
          $("thead th:nth-child(4)", table)[0].count = 1;
        }
      });
    },

    init_toggle_help_messages: function() {

      $(".table-empty-trigger").click(function() {
        var $trigger = $(this);
        var $container = $trigger.parents(".table-empty-msg");
        var $help_text = $container.find(".table-empty-text");

        if ($help_text.is(":hidden")) {
          $container.addClass("active");
          $help_text.slideDown();
        }

        else {
          $container.removeClass("active");
          $help_text.slideUp();
        }
      });
    },

    init_edit: function() {
      // Show the help text for Entity Types if user has admin rights
      var $type_tables = $("table.table");
      $type_tables.first().find(".table-empty-msg").addClass("active").find(".table-empty-text").slideDown();

      // If none of the type tables have rows, hide help links
      // outside of tables to accomodate for help links inside table
      if ($type_tables.find("tbody > tr").length === 0) {
        $(".table-title > .help-link").hide();
      }
      else {
        $(".table-empty-msg").hide();
      }
    },

    add_type: function(e, domain_id, mediator) {
      var table = $(this).parents("table:first");
      fb.get_script(fb.h.static_url("domain-edit.mf.js"), function() {
        d.edit.add_type_begin(table, domain_id, mediator);
      });
      return false;
    },

    edit_type: function(e, type_id) {
      var row = $(this)
          .parents(".submenu").data("headmenu").parents(".data-row:first");
      fb.get_script(fb.h.static_url("domain-edit.mf.js"), function() {
        d.edit.edit_type_begin(row, type_id);
      });
      return false;
    }
  };


  $(d.init);

})(jQuery, window.freebase);
