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

    add_property: function(e, prop_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.add_property_begin(trigger, prop_id);
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
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
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
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
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
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
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
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/type-edit.mf.js", function() {
        t.edit.add_included_type_begin(trigger, type_id);
      });
      return false;
    }
  };

  $(window).bind("fb.permission.has_permission", function(e, has_permission) {
    console.log(acre.c.id, "permits", fb.user.id, has_permission);
    if (has_permission) {
      t.init_edit();
    }
  });

  $(t.init);

})(jQuery, window.freebase);
