(function($, fb) {

  var de = fb.schema.domain.edit = {

    add_new_type_begin: function(target, cvt) {
      var editbutton = $(target).parents(".edit:first").hide();      
      var table = editbutton.prev("table");
      $.ajax({
        url: acre.request.app_url + "/schema/service/add_new_type_begin",
        data: {id: acre.c.id, cvt: cvt ? 1 : 0},
        dataType: "jsonp",
        success: function(data) {
          var html = data.result.html;
          // clear tfoot
          $("tfoot", table).remove();
          var tfoot = $(html);
          $(table).append(tfoot).find(".text-input:first").focus();
          de.add_new_type_init(tfoot);
          tfoot
            .bind("fb.schema.domain.edit.add_new_type.submit", function() {
              console.log("fb.schema.domain.edit.add_new_type.submit");
            })
            .bind("fb.schema.domain.edit.add_new_type.cancel", function() {
              tfoot.fadeOut();
              editbutton.fadeIn();
            });
        }
      });
    },

    add_new_type_init: function(tfoot) {
      // submit handler
      $(".button-submit", tfoot).click(function() {
        tfoot.trigger("fb.schema.domain.edit.add_new_type.submit");
      });

      // cancel handler
      $(".button-cancel", tfoot).click(function() {
        tfoot.trigger("fb.schema.domain.edit.add_new_type.cancel");
      });

      // disable edit-row-template
      $(".edit-row-template :input", tfoot).attr("disabled", "disabled");

      // init edit-row
      $(".edit-row:not(.edit-row-template, .edit-row-submit)", tfoot).each(function() {
        de.add_new_type_init_row($(this));
      });
    },

    add_new_type_init_row: function(row) {      
      var name = $(":input[name=name]", row);
      var key =  $(":input[name=key]", row);
      var type_hint = $(":input[name=type_hint]", row);
      var desc = $(":input[name=desc]", row);

      // autofill key
      name
        .change(function() {
          key.data("changed", true);
        })
        .keyup(function() {
          if (!key.data("changed")) {
            var val = $.trim(name.val()).toLowerCase();
            key.val(val);
          }
        });

      // enter/escape key handler
      $(":input").keyup(function(e) {
        if (e.keyCode === 13) { // enter
          row.trigger("fb.schema.domain.edit.add_new_type.submit");
        }
        else if (e.keyCode === 27) { // escape
          row.trigger("fb.schema.domain.edit.add_new_type.cancel");
        }
      });

      // show another row on description focus if row valid
      desc.focus(function() {
        if (name.val() && key.val()) {
          // are we the enabled row?
          var template = row.siblings(".edit-row-template");
          if (template.prev(".edit-row")[0] === row[0]) {
            var new_row = template.clone();
            new_row.removeClass("edit-row-template");
            $(":input", new_row).removeAttr("disabled");
            template.before(new_row);
            de.add_new_type_init_row(new_row);
          }
        }
      });
    }
  };

})(jQuery, window.freebase);
