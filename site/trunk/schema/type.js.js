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

      t.init_tooltips();
    },

    init_tooltips: function(context) {
      // Return Link Tooltips
      $(".return-link-trigger", context).tooltip({
          events: {def: "click,mouseout"},
          position: "top center",
          effect: "fade",
          delay: 300,
          offset: [-8, 0]
      });
    },

    toggle: function(e) {
      var row = $(this);
      // see if we need to fetch content/tbody from server
      if (row.data("ajax")) {
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
            fb.schema.init_row_menu(tbody);  // init row menus
            t.init_tooltips(tbody); // init tooltips
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

    init_edit: function() {
      // show all edit controls
      $(".edit").show();
    },

    type_settings: function(e, type_id) {
      var trigger = $(this);
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.type_settings_begin(trigger, type_id);
      });
      return false;
    },

    reorder_property: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.reorder_property_begin(trigger, type_id);
      });
      return false;
    },

    add_property: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.add_property_begin(trigger, type_id);
      });
      return false;
    },

    delete_property: function(e, prop_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      // hide tooltip
      trigger.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.delete_property_begin(trigger, prop_id);
      });
      return false;
    },

    undo_delete_property: function(e) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      var prop_info = trigger.metadata();
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.undo_delete_property_begin(trigger, prop_info);
      });
      return false;
    },

    edit_property: function(e, prop_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      // hide tooltip
      trigger.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.edit_property_begin(trigger, prop_id);
      });
      return false;
    },

    add_included_type: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.add_included_type_begin(trigger, type_id);
      });
      return false;
    },

    delete_included_type: function(e, type_id, included_type_id) {
      e.stopPropagation();
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.delete_included_type_begin(trigger, type_id, included_type_id);
      });
      return false;
    },

    undo_delete_included_type: function(e, type_id, included_type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.undo_delete_included_type_begin(trigger, type_id, included_type_id);
      });
      return false;
    },

    reverse_property: function(e, type_id, master_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      // hide tooltip
      trigger.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.reverse_property_begin(trigger, type_id, master_id);
      });
      return false;
    },

    add_instance: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.add_instance_begin(trigger, type_id);
      });
      return false;
    },

    delete_instance: function(e, topic_id, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      // hide tooltip
      trigger.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.delete_instance_begin(trigger, topic_id, type_id);
      });
      return false;
    },

    undo_delete_instance: function(e, topic_id, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(fb.acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.undo_delete_instance_begin(trigger, topic_id, type_id);
      });
      return false;
    }
  };

  $(window).bind("fb.permission.has_permission", function(e, has_permission) {
    if (has_permission) {
      t.init_edit();
    }
  });

  $(t.init);

})(jQuery, window.freebase);
