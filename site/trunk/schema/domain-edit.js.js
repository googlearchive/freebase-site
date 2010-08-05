(function($, fb) {

  var de = fb.schema.domain.edit = {

    /**
     * retrieve add_new_type form (ajax).
     */
    add_new_type_begin: function(target, cvt) {
      var editbutton = $(target).parents(".edit:first").hide();      
      var table = editbutton.prev("table");
      $.ajax({
        url: acre.request.app_url + "/schema/service/add_new_type_begin",
        data: {id: acre.c.id, cvt: cvt ? 1 : 0},
        dataType: "json",
        success: function(data) {
          var html = data.result.html;
          // clear tfoot
          $("tfoot", table).remove();
          var tfoot = $(html);
          $(table).append(tfoot).find(".text-input:first").focus();
          de.add_new_type_init(table);
          tfoot
            .bind("fb.schema.domain.edit.add_new_type.submit", function() {
              console.log("fb.schema.domain.edit.add_new_type.submit");
              de.add_new_type_submit(table);
            })
            .bind("fb.schema.domain.edit.add_new_type.cancel", function() {
              console.log("fb.schema.domain.edit.add_new_type.submit");
              tfoot.fadeOut();
              editbutton.fadeIn();
            })
            .bind("fb.schema.domain.edit.add_new_type.warning", function(e, row, warning) {
              console.log("fb.schema.domain.edit.add_new_type.warning", row, warning);
              de.add_new_type_row_warning(table, row, warning);
            })
            .bind("fb.schema.domain.edit.add_new_type.error", function(e, row, error) {
              console.log("fb.schema.domain.edit.add_new_type.error", row, error);
              de.add_new_type_row_error(table, row, error);
            });
        }
      });
    },

    /**
     * init add_new_type form
     */
    add_new_type_init: function(table) {
      var tfoot = $("tfoot", table);

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

      $(":text:first", tfoot).focus();
    },

    /**
     * init add_new_type row
     */
    add_new_type_init_row: function(row) {      
      var name = $(":input[name=name]", row);
      var key =  $(":input[name=key]", row);
      var desc = $(":input[name=desc]", row);

      // autofill key
      name
        .change(function() {
          key.data("changed", true);
        })
        .keyup(function() {
          if (!key.data("changed")) {
            var val = name.val().toLowerCase();
            key.val(val);
          }
        });

      // enter/escape key handler
      $(":text").keyup(function(e) {
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
    },

    /**
     * validate rows, if no errors submit
     */
    add_new_type_submit: function(table) {
      // are we already submitting?
      if ($(".button-submit", tfoot).is(":disabled")) {
        return;
      }
      // disabled submit
      $(".button-submit", tfoot).attr("disabled", "disabled");

      var tfoot = $("tfoot", table);
      // remove existing row-msg's
      $(".row-msg", tfoot).remove();
      var rows = $(".edit-row:not(.edit-row-template, .edit-row-submit)", tfoot).each(function() {
        de.add_new_type_row_validate($(this));
      });

      // are there any errors? if so, don't submit
      if ($(".row-msg-error", tfoot).length) {
        // re-enable submit
        $(".button-submit", tfoot).removeAttr("disabled");
        return;
      }

      var submit_data = [];
      rows.each(function() {
        var row = $(this);
        submit_data.push({
          domain: $(":input[name=domain]").val(),
          name:  $(":input[name=name]", row).val(),
          key: $(":input[name=key]", row).val(),
          typehint: $(":input[name=typehint]", row).val(),
          desc: $(":input[name=desc]", row).val()
        });
      });

      $.ajax({
        url: acre.request.app_url + "/schema/service/add_new_type_submit",
        type: "POST",
        dataType: "json",
        data: {data:JSON.stringify(submit_data)},
        success: function(data) {
          console.log(data);
        },
        error: function() {
          console.log(Array.prototype.slice.call(arguments));
        }
      });
    },

    /**
     * validate row
     */
    add_new_type_row_validate: function(row) {
      var name = $(":input[name=name]", row).val();
      var key =  $(":input[name=key]", row).val();
      var desc = $(":input[name=desc]", row).val();

      if (name === "" && key === "" && desc === "") {
        row.trigger("fb.schema.domain.edit.add_new_type.warning", [row, "Empty rows will not be submitted"]);
      }
      else if (name === "" || key === "") {
        row.trigger("fb.schema.domain.edit.add_new_type.error", [row, "Name and Key is required"]);
      }
      // TODO: simple duplicate key check
    },


    /**
     * row messages
     */

    add_new_type_row_error: function(table, row, msg) {
      de.add_new_type_row_message(table, row, de.row_message(msg, "error"));
    },

    add_new_type_row_warning: function(table, row, msg) {
      de.add_new_type_row_message(table, row, de.row_message(msg, "warning"));
    },

    add_new_type_row_message: function(table, row, row_msg) {
      // prepend row_msg to row
      row.before(row_msg);
    },

    row_message: function(msg, type) {
      var span = $("<span>").text(msg);
      var td = $('<td colspan="5">').append(span);
      var tr = $('<tr class="row-msg">').append(td);
      if (type) {
        tr.addClass("row-msg-" + type);
      }
      return tr;
    }

  };

})(jQuery, window.freebase);
