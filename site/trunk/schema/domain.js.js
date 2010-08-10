(function($, fb) {

  var d = fb.schema.domain = {
    init: function() {
      d.init_tablesorter();
    },

    init_tablesorter: function() {
      $(".table-sortable").each(function() {
        var table = $(this);
        console.log(table, $("> tbody > tr", table).length);
        if ($("> tbody > tr", table).length) {
          table.tablesorter();
          $("thead th:nth-child(3)", table)[0].count = 1;
          $("thead th:nth-child(4)", table)[0].count = 1;
        }
      });
    },

    init_edit: function() {
      // show all edit controls
      $(".edit").show();
    },

    add_new_type: function(e) {
      return d._add_new_type(this);
    },

    add_new_mediator: function(e) {
      return d._add_new_type(this, true);
    },

    _add_new_type: function(trigger, mediator) {
      trigger = $(trigger);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.add_new_type_begin(trigger, mediator);
      });
      return false;
    },

    delete_type: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.delete_type_begin(trigger, type_id);
      });
      return false;
    },

    edit_type: function(e, type_id) {
      var trigger = $(this);
      if (trigger.is(".editing")) { // are we already editing?
        return false;
      }
      trigger.addClass("editing");
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
