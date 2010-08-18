(function($, fb) {

  var se = fb.schema.edit;   // required;

  var te = fb.schema.type.edit = {

    /**
     * retrieve add_property form (ajax).
     */
    add_property_begin: function(trigger, type_id) {
      $.ajax({
        url: acre.request.app_url + "/schema/type/add_property_begin",
        data: {id: type_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          // add edit-form after the edit button
          var html = $(data.result.html);
          var form = {
            mode: "add",
            event_prefix: "fb.schema.type.add.property.",
            ajax: {
              url: acre.request.app_url + "/schema/type/add_property_submit"
            },

            init_form: te.init_property_form,
            validate_form: te.validate_property_form,
            submit_form: te.submit_property_form,

            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger.parents("tr:first"),
            row: $(".edit-row", html).hide(),
            submit_row: $(".edit-row-submit", html).hide()
          };

          se.init_edit_form(form);

          /**
           * after submit success, re-init form for additional adds
           */
          form.row.bind("fb.schema.type.add.property.success", function() {
            // show headers if showing the empty message
            var empty_msg = $("tbody:first .table-empty-column", form.table);
            if (empty_msg.length) {
              empty_msg.parents("tr:first").hide().prev("tr").show();
            }
            $(".button-cancel", form.submit).text("Done");
            te.init_property_form(form);
          });
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },


    edit_property_begin: function(trigger, prop_id) {
      $.ajax({
        url: acre.request.app_url + "/schema/type/edit_property_begin",
        data: {id: prop_id},
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          // add edit-form after the edit button
          var html = $(data.result.html);
          var form = {
            mode: "edit",
            event_prefix: "fb.schema.type.edit.property.",
            ajax: {
              url: acre.request.app_url + "/schema/type/add_property_submit",
              data: {id: prop_id}
            },

            init_form: te.init_property_form,
            validate_form: te.validate_property_form,
            submit_form: te.submit_property_form,

            table: trigger.parents("table:first"),
            trigger: trigger,
            trigger_row: trigger.parents("tr:first"),
            row: $(".edit-row", html).hide(),
            submit_row: $(".edit-row-submit", html).hide()
          };

          se.init_edit_form(form);

         /**
           * after submit success, we're done editing, remove form and old row
           */
          form.row.bind("fb.schema.domain.edit.property.success", function() {
            form.trigger_row.remove(); // old row
            form.row.remove();
            form.submit_row.remove();
          });
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },

    /**
     * init property form
     */
    init_property_form: function(form) {
      var name = $("input[name=name]", form.row);
      var key =  $("input[name=key]", form.row);
      var expected_type_input = $("input[name=expected_type_input]", form.row);
      var expected_type = $("input[name=expected_type]", form.row);
      var unit = $("input[name=unit]", form.row);
      var description = $("textarea[name=description]", form.row);
      var disambiguator = $("input[name=disambiguator]", form.row);
      var unique = $("input[name=unique]", form.row);
      var hidden = $("input[name=hidden]", form.row);

      if (form.mode === "add") {
        name.val("");
        key.val("").data("changed", false);
        expected_type_input.val("");
        expected_type.val("");
        unit.val("");
        description.val("");
        $.each([disambiguator, unique, hidden], function(i, checkbox) {
          if (!checkbox.is(":disabled")) {
            checkbox.removeAttr("checked");
          }
        });
      }
      else {
        key.data("changed", true);
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

        // expected_type
        expected_type_input.suggest_expected_type({
          category:"expected_type",
          required: "always",
          suggest_new: "Create new type"
        })
        .bind("fb-select", function(e, data) {
          if (data.unit) {
            expected_type_input.val(data.id + " (" + data.unit.name + ")");
            expected_type.val(data.id);
            unit.val(data.unit.id);
          }
          else {
            expected_type_input.val(data.id);
            expected_type.val(data.id);
            unit.val("");
          }
        })
        .bind("fb-textchange", function() {
          expected_type.val("");
          unit.val("");
        });


        // enter/escape key handler
        $(":input:not(textarea)", form.row)
          .keypress(function(e) {
            if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
              form.row.trigger(form.event_prefix + "submit");
            }
          })
          .keyup(function(e) {
            if (e.keyCode === 27) { // escape
              form.row.trigger(form.event_prefix + "cancel");
            }
          });

        form.row.data("initialized", true);
      }
      name.focus();
    },


    /**
     * validate rows, if no errors submit
     */
    submit_property_form: function(form) {
      // TODO We need to show a loading div here, but we have a problem with position:relative on <td> elements

      //var loading_height = form.row.find("td:first").height();
      //form.row.find(".edit-row-loader").css({height: loading_height}).show();

      var name = $.trim($("input[name=name]", form.row).val());
      var key =  $.trim($("input[name=key]", form.row).val());
      var expected_type = $("input[name=expected_type]", form.row).val();
      var unit = $("input[name=unit]", form.row).val();
      var description = $("input[name=description]", form.row).val();
      var disambiguator = $("input[name=disambiguator]", form.row).is(":checked") ? 1 : 0;
      var unique = $("input[name=unique]", form.row).is(":checked") ? 1 : 0;
      var hidden = $("input[name=hidden]", form.row).is(":checked") ? 1 : 0;

      var data = {
        type:  $(":input[name=type]", form.row).val(),
        name: name,
        key: key,
        expected_type: expected_type,
        unit: unit,
        description: description,
        disambiguator: disambiguator,
        unique: unique,
        hidden: hidden
      };

      $.ajax({
        url: form.ajax.url,
        type: "POST",
        dataType: "json",
        data: $.extend(data, form.ajax.data),
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, form.row);
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
          form.row.trigger(form.event_prefix + "success");
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, form.row);
        }
      });
    },

    /**
     * validate row
     */
    validate_property_form: function(form) {
      var name = $.trim($(":input[name=name]", form.row).val());
      var key =  $.trim($(":input[name=key]", form.row).val());
      var ect = $.trim($(":input[name=expected_type]", form.row).val());
      if (name === "" || key === "" || ect === "") {
        form.row.trigger(form.event_prefix + "error", [form.row, "Name, Key and Expected Type are required"]);
      }
      // TODO: simple duplicate key check
    },


    /**
     * delete property
     */
    delete_property_begin: function(trigger, prop_id) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: acre.request.app_url + "/schema/type/delete_property_submit",
        data: {id: prop_id, user: fb.user.id},
        type: "POST",
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
          }
          var new_row = $(data.result.html).addClass("new-row");
          row.before(new_row);
          new_row.hide();
          row.remove();
          new_row.showRow();
        },
        error: function(xhr) {
          se.ajax_error_handler(xhr, row);
        }
      });
    },

    /**
     * undo delete type
     */
    undo_delete_property_begin: function(trigger, prop_info) {
      var row = trigger.parents("tr:first");
      var table = row.parents("table:first");
      $.ajax({
        url: acre.request.app_url + "/schema/type/undo_delete_property_submit",
        data: {prop_info: JSON.stringify(prop_info)},
        type: "POST",
        dataType: "json",
        success: function(data, status, xhr) {
          if (data.code === "/api/status/error") {
            return se.ajax_error_handler(xhr, row);
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
          se.ajax_error_handler(xhr, row);
        }
      });
    }

  };


})(jQuery, window.freebase);
