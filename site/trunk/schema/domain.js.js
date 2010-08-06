(function($, fb) {

  var d = fb.schema.domain = {
    init: function() {
      var table = $(".table-sortable").tablesorter();
      $("thead th:nth-child(3)", table)[0].count = 1;
      $("thead th:nth-child(4)", table)[0].count = 1;
    },

    init_edit: function() {
      // show all edit controls
      $(".edit").show();
    },

    add_new_type: function(e) {
      return d._add_new_type(e);
    },

    add_new_cvt: function(e) {
      return d._add_new_type(e, true);
    },

    _add_new_type: function(e, cvt) {
      var target = e.target;
      fb.get_script(acre.request.app_url + "/schema/MANIFEST/domain-edit.mf.js", function() {
        d.edit.add_new_type_begin(target, cvt);
      });
      return false;
    }
  };

  $(window).bind("fb.permission.has_permission", function(e, has_permission) {
    console.log(acre.c.id, "permits", fb.user.id, has_permission);
    if (has_permission) {
      //d.init_edit();
    }
  });

  $(d.init);

})(jQuery, window.freebase); 
