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
        else {
          table.hide();
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

    _add_new_type: function(thisArg, mediator) {
      var context = $(thisArg).parent(".table-edit");
      if (context.next(".edit-form").length) {
        return false;
      }
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.add_new_type_begin(context, mediator);
      });
      return false;
    },

    delete_type: function(e, type_id) {
      var context = $(this).parents("tr:first");
      if (context.next(".edit-form").length) {
        return false;
      }
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.delete_type_begin(context, type_id);
      });
      return false;
    },

    edit_type: function(e, type_id) {
      var target = e.target;
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.edit_type_begin(target);
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
