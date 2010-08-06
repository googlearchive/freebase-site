(function($, fb) {

  var de = fb.schema.domain.edit = {

    /**
     * retrieve add_new_type form (ajax).
     */
    add_new_type_begin: function(target, cvt) {
      var editbutton = $(target).parents(".edit:first");
      var table = editbutton.prev("table");
      $.ajax({
        url: acre.request.app_url + "/schema/service/add_new_type_begin",
        data: {id: acre.c.id, cvt: cvt ? 1 : 0},
        dataType: "json",
        success: function(data) {
          // remove previous edit-form
          editbutton.next(".edit-form").remove();

          // add edit-form after the edit button
          var form = $(data.result.html).hide()
            .data("table", table)
            .data("edit", editbutton);
          editbutton.after(form);

          // show edit-form
          editbutton.slideUp(function() {
            form.slideDown(function() {
              de.add_new_type_init(form);
            });
          });

          form
            .bind("fb.schema.domain.edit.add_new_type.submit", function() {
              console.log("fb.schema.domain.edit.add_new_type.submit");
              de.add_new_type_submit(form);
            })
            .bind("fb.schema.domain.edit.add_new_type.cancel", function() {
              console.log("fb.schema.domain.edit.add_new_type.submit");
              de.add_new_type_cancel(form);
            })
            .bind("fb.schema.domain.edit.add_new_type.warning", function(e, row, warning) {
              console.log("fb.schema.domain.edit.add_new_type.warning", row, warning);
              de.add_new_type_row_warning(form, row, warning);
            })
            .bind("fb.schema.domain.edit.add_new_type.error", function(e, row, error) {
              console.log("fb.schema.domain.edit.add_new_type.error", row, error);
              de.add_new_type_row_error(form, row, error);
            });
        }
      });
    },

    /**
     * init add_new_type form
     */
    add_new_type_init: function(form) {

      // submit handler
      form.data("button-submit", $(".button-submit", form).click(function() {
        form.trigger("fb.schema.domain.edit.add_new_type.submit");
      }));

      // cancel handler
      form.data("button-cancel", $(".button-cancel", form).click(function() {
        form.trigger("fb.schema.domain.edit.add_new_type.cancel");
      }));

      // disable edit-row-template
      fb.disable($(".edit-row-template :input", form));

      // init edit-row
      $(".edit-row:not(.edit-row-template, .edit-row-submit)", form).each(function() {
        de.add_new_type_init_row($(this));
      });

      $(":text:first", form).focus();
    },

    /**
     * init add_new_type row
     */
    add_new_type_init_row: function(row) {
      var name = $(":input[name=name]", row);
      var key =  $(":input[name=key]", row);
      var description = $(":input[name=description]", row);

      // autofill key
      name
        .change(function() {
          key.data("changed", true);
        })
        .keyup(function() {
          if (!key.data("changed")) {
            var val = $.trim(name.val()).toLowerCase().replace(/\s+/g, '-');
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
      description.focus(function() {
        if (! (name.val() === "" || key.val() === "")) {
          // are we the enabled row?
          var template = row.siblings(".edit-row-template");
          if (template.prev(".edit-row")[0] === row[0]) {
            var new_row = template.clone();
            new_row.removeClass("edit-row-template");
            fb.enable($(":input", new_row));
            template.before(new_row);
            de.add_new_type_init_row(new_row);
          }
        }
      });
    },

    add_new_type_cancel: function(form) {
      if (form.data("button-cancel").is(":disabled")) {
        return;
      }
      form.slideUp(function() {
        form.data("edit").slideDown();
      });
    },

    /**
     * validate rows, if no errors submit
     */
    add_new_type_submit: function(form) {
      // if already submitting, don't submit
      if (form.data("button-submit").is(":disabled")) {
        return;
      }

      // disable submit
      fb.disable(form.data("button-submit"));
      fb.disable(form.data("button-cancel"));

      // remove existing row-msg's
      $(".row-msg", form).remove();
      var rows = $(".edit-row:not(.edit-row-template, .edit-row-submit)", form).each(function() {
        de.add_new_type_row_validate($(this));
      });

      // are there any errors? if so, don't submit
      if ($(".row-msg-error", form).length) {
        // re-enable submit
        fb.enable(form.data("button-submit"));
        return;
      }

      rows.each(function() {
        var row = $(this);
        var data = {
          domain: $(":input[name=domain]", row).val(),
          name:  $(":input[name=name]", row).val(),
          key: $(":input[name=key]", row).val(),
          typehint: $(":input[name=typehint]", row).val(),
          description: $(":input[name=description]", row).val()
        };

        // skip empty rows
        if (data.name === "" || data.key === "") {
          return;
        }

        return;

        function check_submit(success) {
          if ($(".loading", form).length) {
            console.log("check_submit still loading");
            // still submitting
            return;
          }
          fb.enable(form.data("button-submit"));
          fb.enable(form.data("button-cancel"));

          if (success) {
            form.trigger("fb.schema.domain.edit.add_new_type.cancel");
          }
        };

        var tbody = table.find("tbody:first");
        $.ajax({
          url: acre.request.app_url + "/schema/service/add_new_type_submit",
          type: "POST",
          dataType: "json",
          data: data,
          beforeSend: function() {
            row.addClass("loading");
          },
          success: function(data) {
            var new_row = $(data.result.html).addClass("new-row");
            row.fadeOut(function() {
              tbody.append(new_row);
              $(this).remove();
              check_submit(true);
            });
          },
          error: function(xhr) {
            console.log("error", xhr.responseText);

            var msg;
            try {
              msg = JSON.parse(xhr.responseText);
              msg = msg.messages[0].message;
            }
            catch (e) {
              msg = xhr.responseText;
            }

            de.add_new_type_row_error(form, row, msg);
            row.removeClass("loading");

            check_submit(false);
          }
        });
      });
/**

      var submit_data = [];
      rows.each(function() {
        var row = $(this);
        submit_data.push({
          domain: $(":input[name=domain]").val(),
          name:  $(":input[name=name]", row).val(),
          key: $(":input[name=key]", row).val(),
          typehint: $(":input[name=typehint]", row).val(),
          description: $(":input[name=description]", row).val()
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
      });**/
    },

    /**
     * validate row
     */
    add_new_type_row_validate: function(row) {
      var name = $(":input[name=name]", row).val();
      var key =  $(":input[name=key]", row).val();
      var description = $(":input[name=description]", row).val();

      if (name === "" && key === "" && description === "") {
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

    add_new_type_row_error: function(form, row, msg) {
      de.add_new_type_row_message(form, row, de.row_message(msg, "error"));
    },

    add_new_type_row_warning: function(form, row, msg) {
      de.add_new_type_row_message(form, row, de.row_message(msg, "warning"));
    },

    add_new_type_row_message: function(form, row, row_msg) {
      // prepend row_msg to row
      row.before(row_msg);
    },

    row_message: function(msg, type) {
      var span = $("<span>").text(msg);
      var row = $('<div class="row-msg">').append(span);
      if (type) {
        row.addClass("row-msg-" + type);
      }
      return row;
    }

  };

})(jQuery, window.freebase);
