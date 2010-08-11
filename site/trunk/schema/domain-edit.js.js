(function($, fb) {


  var de = fb.schema.domain.edit = {

    /**
     * retrieve add_new_type form (ajax).
     */
    add_new_type_begin: function(trigger, mediator) {
      var table = trigger.parents("table:first");
      $.ajax({
        url: acre.request.app_url + "/schema/service/add_new_type_begin",
        data: {id: acre.c.id, mediator: mediator ? 1 : 0},
        dataType: "json",
        success: function(data) {
          // add edit-form after the edit button
          var html = $(data.result.html);
          var form = {
            table: table,
            trigger: trigger,
            row: $(".edit-row", html).hide(),
            submit: $(".edit-row-submit", html).hide()
          };

          $("tbody", table).append(form.row);
          $("tfoot", table).append(form.submit);

          form.row.showRow(function() {
            de.add_new_type_init(form);
          });
          trigger.parents("tr:first").hideRow(function() {
            form.submit.showRow(null, "fadeIn");
          }, "fadeOut");

          form.row
            .bind("fb.schema.domain.edit.add_new_type.submit", function() {
              console.log("fb.schema.domain.edit.add_new_type.submit");
              de.add_new_type_submit(form);
            })
            .bind("fb.schema.domain.edit.add_new_type.cancel", function() {
              console.log("fb.schema.domain.edit.add_new_type.cancel");
              de.add_new_type_cancel(form);
            })
            .bind("fb.schema.domain.edit.add_new_type.finish", function() {
              console.log("fb.schema.domain.edit.add_new_type.finish");
              de.add_new_type_finish(form);
            })
            .bind("fb.schema.domain.edit.add_new_type.error", function(e, row, error) {
              console.log("fb.schema.domain.edit.add_new_type.error", row, error);
              de.add_new_type_row_error(row, error);
            });
        }
      });
    },

    /**
     * init add_new_type form
     */
    add_new_type_init: function(form) {
      // submit handler
      var save = $(".button-submit", form.submit).click(function() {
        form.row.trigger("fb.schema.domain.edit.add_new_type.submit");
      });
      form.row.bind("change", function() {
        fb.enable(save);
      });

      // cancel handler
      $(".button-cancel", form.submit).click(function() {
        form.row.trigger("fb.schema.domain.edit.add_new_type.cancel");
      });

      // init edit-row
      de.add_new_type_init_row(form);
    },

    /**
     * init add_new_type row
     */
    add_new_type_init_row: function(form) {
      var name = $(":input[name=name]", form.row).val("");
      var key =  $(":input[name=key]", form.row).val("").data("changed", false);
      var description = $(":input[name=description]", form.row).val("");
      if (!form.row.data("initialized")) {
        key.change(function() {
          $(this).data("changed", true);
        });
        // autofill key
        name.change(function() {
          if (!key.data("changed")) {
            var val = $.trim(name.val()).toLowerCase().replace(/\s+/g, '-');
            key.val(val);
          }
        });
        // enter/escape key handler
        $(":input", form.row).keyup(function(e) {
          if (e.keyCode === 13) { // enter
            form.row.trigger("fb.schema.domain.edit.add_new_type.submit");
          }
          else if (e.keyCode === 27) { // escape
            form.row.trigger("fb.schema.domain.edit.add_new_type.cancel");
          }
        });
        form.row.data("initialized", true);
      }
      name.focus();
    },

    add_new_type_cancel: function(form) {
      form.row.hideRow(function() {
        $(this).remove();
      });
      form.submit.hideRow(function() {
        form.trigger.parents("tr:first").showRow(function() {
          form.submit.remove();
          form.trigger.removeClass("editing");
        }, "fadeIn");
      }, "fadeOut");
    },

    /**
     * validate rows, if no errors submit
     */
    add_new_type_submit: function(form) {
      if (form.row.is(".loading")) {
        return;
      }
      if ($(".button-submit", form.submit).is(":disabled")) {
        return;
      }
      // remove focus from activeelement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }
      // remove existing row-msg's
      form.row.prev(".row-msg").remove();

      de.add_new_type_row_validate(form.row);

      // any pre-submit errors?
      if (form.row.prev(".row-msg-error").length) {
        return;
      }

      form.row.addClass("loading");

      var name = $.trim($(":input[name=name]", form.row).val());
      var key = $.trim($(":input[name=key]", form.row).val());
      var typehint = $(":input[name=typehint]", form.row);
      typehint = typehint.is(":checked") ? typehint.val() : "";

      var data = {
        domain:  $(":input[name=domain]", form.row).val(),
        name: name,
        key: key,
        typehint: typehint,
        description: $(":input[name=description]", form.row).val()
      };

      $.ajax({
        url: acre.request.app_url + "/schema/service/add_new_type_submit",
        type: "POST",
        dataType: "json",
        data: data,
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return de.ajax_error_handler(xhr, form.row);
          }
          var new_row = $(data.result.html);
          form.row.before(new_row);
          new_row.hide();
          new_row.showRow(function() {
            fb.schema.init_row_menu(new_row);
            // show edit controls in tooltip
            $(".edit", new_row).show();
          }, null, "slow");
          $(".button-cancel", form.submit).text("Done");
          de.add_new_type_init_row(form);
        },
        error: function(xhr) {
          de.ajax_error_handler(xhr, form.row);
        },
        complete: function() {
          form.row.removeClass("loading");
          // submit next row
          //de.add_new_type_submit_rows(form, rows);
        }
      });
    },

    add_new_type_finish: function(form) {
      var tbody = form.data("table").find("tbody:first");
      // do we have any new rows?
      var submitted = form.data("submitted");
      $.each(submitted, function(i,n) {
        var row = n[0];
        var data = n[1];
        var new_row = $(data.result.html).addClass("new-row");
        tbody.append(new_row);
        fb.schema.init_row_menu(new_row);
        $(".edit", new_row).show(null, null, "slow");
        row.remove();
      });
      // clear submitted array
      form.data("submitted",[]);

      // do we have any errors?
      if ($(".row-msg-error", form).length) {
        form.removeClass("loading");
      }
      else {
        form.trigger("fb.schema.domain.edit.add_new_type.cancel");
      }
    },

    /**
     * validate row
     */
    add_new_type_row_validate: function(row) {
      var name = $.trim($(":input[name=name]", row).val());
      var key =  $.trim($(":input[name=key]", row).val());
      if (name === "" || key === "") {
        row.trigger("fb.schema.domain.edit.add_new_type.error", [row, "Name and Key is required"]);
      }
      // TODO: simple duplicate key check
    },


    /**
     * delete type
     */
    delete_type_begin: function(trigger, type_id) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: acre.request.app_url + "/schema/service/delete_type_submit",
        data: {id: type_id, user: fb.user.id},
        type: "POST",
        dataType: "json",
        success: function(data) {
          if (data.code === "/api/status/error") {
            return de.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html);
          row.before(new_row);
          new_row.hide();
          row.remove();
          new_row.showRow();
        },
        error: function(xhr) {
          de.ajax_error_handler(xhr, row);
        }
      });
    },

    /**
     * undo delete type
     */
    undo_delete_type_begin: function(trigger, type_info) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: acre.request.app_url + "/schema/service/undo_delete_type_submit",
        data: {type_info: JSON.stringify(type_info)},
        type: "POST",
        dataType: "json",
        success: function(data) {
          if (data.code === "/api/status/error") {
            return de.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          row.before(new_row);
          new_row.hide();
          row.remove();
          new_row.showRow(function() {
            fb.schema.init_row_menu(new_row);
            // show edit controls in tooltip
            $(".edit", new_row).show();
          }, null, "slow");
        },
        error: function(xhr) {
          de.ajax_error_handler(xhr, row);
        }
      });
    },

    ajax_error_handler: function(xhr, row) {
      var msg;
      try {
        msg = JSON.parse(xhr.responseText);
        msg = msg.messages[0].message; // display the first message
      }
      catch(e) {
        msg = xhr.responseText;
      }
      // TODO: make error expandable to see whole error message
      de.add_new_type_row_error(row, msg);
    },

    /**
     * row messages
     */

    add_new_type_row_error: function(row, msg) {
      de.add_new_type_row_message(row, de.row_message(msg, "error"));
    },

    add_new_type_row_message: function(row, row_msg) {
      // prepend row_msg to row
      row.before(row_msg);
      row_msg.hide().showRow();
    },

    row_message: function(msg, type) {
      var span = $("<span>").text(msg);
      var td = $('<td colspan="5">').append(span);
      var row = $('<tr class="row-msg">').append(td);
      if (type) {
        row.addClass("row-msg-" + type);
      }
      return row;
    }

  };

})(jQuery, window.freebase);
