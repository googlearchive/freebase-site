(function($, fb) {


  var de = fb.schema.domain.edit = {

    /**
     * retrieve add_new_type form (ajax).
     */
    add_new_type_begin: function(trigger, domain_id, mediator) {
      $.ajax({
        url: acre.request.app_url + "/schema/service/add_new_type_begin",
        data: {id: domain_id, mediator: mediator ? 1 : 0},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return de.ajax_error_handler(xhr, row);
          }
          // add edit-form after the edit button
          var html = $(data.result.html);
          var form = {
            mode: "add",
            ajax: {
              url: acre.request.app_url + "/schema/service/add_new_type_submit"
            },
            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger.parents("tr:first"),
            row: $(".edit-row", html).hide(),
            submit: $(".edit-row-submit", html).hide()
          };
          de.init_edit_type(form);

          /**
           * after submit success, re-init form for additional adds
           */
          form.row.bind("fb.schema.domain.edit.type.success", function() {
            // show headers if showing the empty message
            var empty_msg = $("thead:first .table-empty-column", form.table);
            if (empty_msg.length) {
              empty_msg.parents("tr:first").hide().prev("tr").show();
            }
            $(".button-cancel", form.submit).text("Done");
            de.init_edit_type_form_row(form);
          });
        },
        error: function(xhr) {
          de.ajax_error_handler(xhr, row);
        }
      });
    },

    /**
     * edit type
     */
    edit_type_begin: function(trigger, type_id) {
      $.ajax({
        url: acre.request.app_url + "/schema/service/edit_type_begin",
        data: {id: type_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return de.ajax_error_handler(xhr, row);
          }
          // add edit-form after the edit button
          var html = $(data.result.html);
          var form = {
            mode: "edit",
            ajax: {
              url: acre.request.app_url + "/schema/service/edit_type_submit",
              data: {id: type_id}
            },
            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger.parents("tr:first"),
            row: $(".edit-row", html).hide(),
            submit: $(".edit-row-submit", html).hide()
          };
          de.init_edit_type(form);
          /**
           * after submit success, we're done editing, remove form and old row
           */
          form.row.bind("fb.schema.domain.edit.type.success", function() {
            form.trigger_row.remove(); // old row
            form.row.remove();
            form.submit.remove();
          });
        },
        error: function(xhr) {
          de.ajax_error_handler(xhr, row);
        }
      });
    },

    init_edit_type: function(form) {
      if (form.mode === "add") {
        $("tbody", form.table).append(form.row);
      }
      else if (form.mode === "edit") {
        form.trigger_row.before(form.row);
      }
      else {
        throw "Unknown edit type mode: " + form.mode;
      }
      form.trigger_row.before(form.submit);

      form.row
        .bind("fb.schema.domain.edit.type.submit", function() {
          console.log("fb.schema.domain.edit.type.submit");
          de.edit_type_submit(form);
        })
        .bind("fb.schema.domain.edit.type.cancel", function() {
          console.log("fb.schema.domain.edit.type.cancel");
          de.edit_type_cancel(form);
        })
        .bind("fb.schema.domain.edit.type.error", function(e, row, error) {
          console.log("fb.schema.domain.edit.type.error", row, error);
          de.edit_type_error(row, error);
        });

      de.init_edit_type_form(form);
      form.row.showRow(function() {
        $(":text:first", form.row).focus();
      });
      form.trigger_row.hide();
      form.submit.show();
    },

    /**
     * init add_new_type form
     */
    init_edit_type_form: function(form) {
      // submit handler
      var save = $(".button-submit", form.submit).click(function() {
        form.row.trigger("fb.schema.domain.edit.type.submit");
      });
      // cancel handler
      $(".button-cancel", form.submit).click(function() {
        form.row.trigger("fb.schema.domain.edit.type.cancel");
      });
      // init edit-row
      de.init_edit_type_form_row(form);
    },

    /**
     * init add_new_type row
     */
    init_edit_type_form_row: function(form) {
      var name = $(":input[name=name]", form.row);
      var key =  $(":input[name=key]", form.row).data("changed", false);
      var typehint = $(":input[name=typehint]", form.row);
      var description = $(":input[name=description]", form.row);

      if (form.mode === "add") {
        name.val("");
        key.val("").data("changed", false);
        if (!typehint.is(":disabled")) {
          typehint.removeAttr("checked");
        }
        description.val("");
      }

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
            form.row.trigger("fb.schema.domain.edit.type.submit");
          }
          else if (e.keyCode === 27) { // escape
            form.row.trigger("fb.schema.domain.edit.type.cancel");
          }
        });
        form.row.data("initialized", true);
      }
      name.focus();
    },

    edit_type_cancel: function(form) {
      form.row.hideRow(function() {
        $(this).remove();
      });
      form.submit.remove();
      // XXX Dae: I added this to remove any error messages when a user clicks cancle/done
      // Feel free to refactor as you see fit
      $('.row-msg').remove();
      form.trigger_row.show();
      form.trigger.removeClass("editing");
    },

    /**
     * validate rows, if no errors submit
     */
    edit_type_submit: function(form) {
      if (form.row.is(".loading")) {
        return;
      }
      // remove focus from activeelement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }
      // remove existing row-msg's
      form.row.prev(".row-msg").remove();

      de.edit_type_form_row_validate(form.row);

      // any pre-submit errors?
      if (form.row.prev(".row-msg-error").length) {
        return;
      }

      form.row.addClass("loading");

      // TODO We need to show a loading div here, but we have a problem with position:relative on <td> elements

      //var loading_height = form.row.find("td:first").height();
      //form.row.find(".edit-row-loader").css({height: loading_height}).show();

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
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: $.extend(data, form.ajax.data),
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return de.ajax_error_handler(xhr, form.row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          form.row.before(new_row);
          new_row.hide();
          new_row.showRow(function() {
            // init row menu
            fb.schema.init_row_menu(new_row);
            // show edit controls in tooltip
            $(".edit", new_row).show();
          }, null, "slow");
          form.row.trigger("fb.schema.domain.edit.type.success");
        },
        error: function(xhr) {
          de.ajax_error_handler(xhr, form.row);
        },
        complete: function() {
          form.row.removeClass("loading");
        }
      });
    },

    /**
     * validate row
     */
    edit_type_form_row_validate: function(row) {
      var name = $.trim($(":input[name=name]", row).val());
      var key =  $.trim($(":input[name=key]", row).val());
      if (name === "" || key === "") {
        row.trigger("fb.schema.domain.edit.type.error", [row, "Name and Key is required"]);
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
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return de.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html).addClass("new-row");
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
        success: function(data, status, xhr) {
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
      de.edit_type_error(row, msg);
    },

    /**
     * row messages
     */

    edit_type_error: function(row, msg) {
      de.edit_type_row_message(row, de.row_message(msg, "error"));
    },

    edit_type_row_message: function(row, row_msg) {
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
