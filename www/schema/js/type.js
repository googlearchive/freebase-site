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

  var t = fb.schema.type = {

    init: function() {

      // Show/Hide Included Types & Incoming Properties

      // mark expanded included_types and incoming properties
      $("#included-types-table .tbody-header, #incoming-properties-table .tbody-header")
        .each(function() {
          var row = $(this);
          if (!row.hasClass("expanded")) {
            row.data("ajax", true);  // need to ajax get data if not already expanded
          }
          row.click(t.toggle);
        });
    },

    toggle: function(e) {
      var row = $(this);
      // see if we need to fetch content/tbody from server
      if (row.data("ajax") && row.attr("data-url")) {
        if (row.is(".loading")) {  // already loading
          return;
        }
        row.addClass("loading");
        $.ajax({
          url: row.attr("data-url"),
          dataType: "json",
          success: function(data) {
            var tbody = $(data.result.html).hide();
            row.parents("thead:first").after(tbody);
            propbox.init_menus(tbody, true);
            t._toggle(row);
          },
          complete: function() {
            row.removeClass("loading");
            row.removeData("ajax");
          }
        });
      }
      else {
        t._toggle(row);
      }
    },

    _toggle: function(row) {
      var tbody = row.parents("thead:first").next("tbody:first");
      if (row.is(".expanded")) {
        tbody.hide();
        row.removeClass("expanded");
        $(".tbody-header-title", row).removeClass("expanded");
      }
      else {
        //tbody.show();
        tbody.css("display", "table-row-group"); // default display:block seems to group multiple tbody's togehter
        row.addClass("expanded");
        $(".tbody-header-title", row).addClass("expanded");
      }
    },

    reorder_property: function(e, type_id) {
      var trigger = $(this);
      fb.get_script(fb.h.static_url("type-edit.mf.js"), function() {
        t.edit.reorder_property_begin(trigger, type_id);
      });
      return false;
    },

    add_property: function(e, type_id) {
      var table = $(this).parents("table:first");
      fb.get_script(fb.h.static_url("type-edit.mf.js"), function() {
        t.edit.add_property_begin(table, type_id);
      });
      return false;
    },

    edit_property: function(e, prop_id) {
      var row = $(this)
          .parents(".submenu").data("headmenu").parents(".data-row:first");
      fb.get_script(fb.h.static_url("type-edit.mf.js"), function() {
        t.edit.edit_property_begin(row, prop_id);
      });
      return false;
    },

    add_included_type: function(e, type_id) {
      var table = $(this).parents("table:first");
      fb.get_script(fb.h.static_url("type-edit.mf.js"), function() {
        t.edit.add_included_type_begin(table, type_id);
      });
      return false;
    },

    delete_included_type: function(e, type_id, included_type_id) {
     e.stopPropagation();
     var row = $(this).parents("tr:first");
     fb.get_script(fb.h.static_url("type-edit.mf.js"), function() {
        t.edit.delete_included_type_begin(row, type_id, included_type_id);
      });
      return false;
    },

    reverse_property: function(e, type_id, master_id) {
      var trigger = $(this);
      fb.get_script(fb.h.static_url("type-edit.mf.js"), function() {
        t.edit.reverse_property_begin(trigger, type_id, master_id);
      });
      return false;
    },

    add_instance: function(e, type_id) {
      var table = $(this).parents("table:first");
      fb.get_script(fb.h.static_url("type-edit.mf.js"), function() {
        t.edit.add_instance_begin(table, type_id);
      });
      return false;
    },

    delete_instance: function(e, topic_id, type_id) {
      var row = $(this)
          .parents(".submenu").data("headmenu").parents(".data-row:first");
      fb.get_script(fb.h.static_url("type-edit.mf.js"), function() {
        t.edit.delete_instance_begin(row, topic_id, type_id);
      });
      return false;
    }
  };

  $(t.init);

})(jQuery, window.freebase);
