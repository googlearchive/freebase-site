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
          table.tablesorter();
          $("thead th:nth-child(2)", table)[0].count = 1;
          $("thead th:nth-child(3)", table)[0].count = 1;
          $("thead th:nth-child(4)", table)[0].count = 1;
        }
      });
    },

    init_toggle_help_messages: function() {

      $(".table-empty-trigger").click(function() {
        $trigger = $(this);
        $container = $trigger.parents(".table-empty-msg");
        $help_text = $container.find(".table-empty-text");

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
      // show all edit controls
      $(".edit").show();

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

    domain_settings: function(e, domain_id) {
      var trigger = $(this);
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.domain_settings_begin(trigger, domain_id);
      });
      return false;
    },

    add_type: function(e, domain_id, role) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.add_type_begin(trigger, domain_id, role);
      });
      return false;
    },

    delete_type: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      // hide tooltip
      trigger.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.delete_type_begin(trigger, type_id);
      });
      return false;
    },

    undo_delete_type: function(e) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      var type_info = trigger.metadata();
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.undo_delete_type_begin(trigger, type_info);
      });
      return false;
    },

    edit_type: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      // hide tooltip
      trigger.parents(".tooltip:first").siblings(".row-menu-trigger:first").data("tooltip").hide();
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.edit_type_begin(trigger, type_id);
      });
      return false;
    }
  };

  $(window).bind("fb.permission.has_permission", function(e, has_permission) {
    console.log(acre.c.id, "permits", fb.user.id, has_permission);
    if (has_permission) {
      d.init_edit();
    }
  });

  $(d.init);

})(jQuery, window.freebase);
