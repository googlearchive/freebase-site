
(function($, fb) {

  var se = fb.schema.edit = {

    /**
     * This is an attempt at separating out the common logic
     * when adding/editing a row in a schema table.
     * This logic is currently shared by the domain and type schema page:
     * 1. Adding a type on the domain page.
     * 2. Editing a type on the domain page.
     * 3. Adding a property on the type page.
     * 4. Editing a property on the type page
     *
     * @param form:Object (required) - A set of key/value pairs specifying form options:
     * - mode:String (required) - Mode to specify the actual edit mode (add|edit)
     * - event_prefix:String (required) - This is the prefix of all events that will be
     *                                    triggered in the course of the form editing.
     *                                    (event_prefix[submit|cancel|error|success])
     * - init_form:Function (required) - A hook to initialize the form row.
     * - validate_form:Function (required) - A hook to validating the form row.
     * - submit_form:Function (required)
     *
     * - table:jQuery (required)
     * - trigger:jQuery (required)
     * - trigger_row:jQuery (required)
     * - row:jQuery (required)
     * - submit_row:jQuery (required)
     */
    init_edit_form: function(form) {
      if (form.mode === "add") {
        $("tbody", form.table).append(form.row);
      }
      else if (form.mode === "edit") {
        form.trigger_row.before(form.row);
      }
      else {
        throw "Unknown edit type mode: " + form.mode;
      }
      form.trigger_row.before(form.submit_row);

      var event_prefix = form.event_prefix || "fb.schema.edit.";
      form.row
        .bind(event_prefix + "submit", function() {
          console.log(event_prefix + "submit");
          se.submit_edit_form(form);
        })
        .bind(event_prefix + "cancel", function() {
          console.log(event_prefix + "cancel");
          se.cancel_edit_form(form);
        })
        .bind(event_prefix + "error", function(e, row, error) {
          console.log(event_prefix + "error", row, error);
          se.row_error(row, error);
        })
        .bind(event_prefix + "success", function() {
          console.log(event_prefix + "success");
          form.row.removeClass("loading");
        });

      // submit handler
      $(".button-submit", form.submit_row).click(function() {
        form.row.trigger(event_prefix + "submit");
      });
      // cancel handler
      $(".button-cancel", form.submit_row).click(function() {
        form.row.trigger(event_prefix + "cancel");
      });

      // init edit-row
      if (typeof form.init_form === "function") {
        form.init_form(form);
      }

      form.row.showRow(function() {
        $(":text:first", form.row).focus();
      });
      form.trigger_row.hide();
      form.submit_row.show();
    },

    cancel_edit_form: function(form) {
      form.row.hideRow(function() {
        $(this).remove();
      });
      se.clear_row_message(form.row);
      form.submit_row.remove();
      form.trigger_row.show();
      form.trigger.removeClass("editing");
    },

    submit_edit_form: function(form) {
      // are we already submitting?
      if (form.row.is(".loading")) {
        return;
      }

      // remove focus from activeElement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }

      // clear messages
      se.clear_row_message(form.row);

     // validate edit-row
      if (typeof form.validate_form === "function") {
        form.validate_form(form);
      }

      // any pre-submit errors?
      if (se.has_row_message(form.row, "error")) {
        return;
      }

      // add a loading class to flag we are submitting the form
      form.row.addClass("loading");

      // submit edit-row
      if (typeof form.submit_form === "function") {
        form.submit_form(form);
      }
    },

    ajax_error_handler: function(xhr, row, form) {
      var msg;
      try {
        msg = JSON.parse(xhr.responseText);
        msg = msg.messages[0].message; // display the first message
      }
      catch(e) {
        msg = xhr.responseText;
      }
      // TODO: make error expandable to see whole error message
      if (row) {
        se.row_error(row, msg);
      }
      else if (form) {
        se.form_error(form, msg);
      }
    },

    row_error: function(row, msg) {
      return se.row_message(row, msg, "error");
    },

    row_message: function(row, msg, type) {
      var close = $('<a class="close-msg" href="#">Close</a>').click(function(e) {
        return fb.schema.close_message.apply(this, [e, '.row-msg:first']);
      });
      var span = $("<span>").text(msg);
      var td = $('<td colspan="5">').append(close).append(span);
      var row_msg = $('<tr class="row-msg">').append(td);
      if (type) {
        row_msg.addClass("row-msg-" + type);
      }

      // prepend row_msg to row
      row.before(row_msg);
      row_msg.hide().showRow();

      var msg_data = row.data("row-msg");
      if (!msg_data) {
        msg_data = {};
        row.data("row-msg", msg_data);
      }
      if (!msg_data[type]) {
        msg_data[type] = [row_msg];
      }
      else {
        msg_data[type].push(row_msg);
      }
      return row_msg;
    },

    clear_row_message: function(row) {
      var msg_data = row.data("row-msg");
      if (msg_data) {
        $.each(msg_data, function(type,msgs) {
          $.each(msgs, function(i,msg) {
            msg.remove();
          });
        });
        row.removeData("row-msg");
      }
    },

    has_row_message: function(row, type) {
      var msg_data = row.data("row-msg");
      if (type) {
        return msg_data && msg_data[type] && msg_data[type].length;
      }
      return msg_data != null;
    },

    init_modal_form: function(form) {

      $(document.body).append(form.form.hide());

      var event_prefix = form.event_prefix || "fb.schema.edit.modal.";
      form.form
       .bind(event_prefix + "submit", function() {
          console.log(event_prefix + "submit");
          se.submit_modal_form(form);
        })
        .bind(event_prefix + "error", function(e, error) {
          console.log(event_prefix + "error", error);
          se.form_error(form.form, error);
        })
        .bind(event_prefix + "success", function() {
          console.log(event_prefix + "success");
          form.form.removeClass("loading");
        });

     // submit handler
      $(".button-submit", form.form).click(function() {
        form.form.trigger(event_prefix + "submit");
      });

      // init form
      if (typeof form.init_form === "function") {
        form.init_form(form);
      }

      form.form.overlay({
          close: ".button-cancel",
          closeOnClick: false,
          load: true,
          mask: {
            color: '#000',
	    loadSpeed: 200,
	    opacity: 0.5
	  }
        });
    },

    submit_modal_form: function(form) {
      // are we already submitting?
      if (form.form.is(".loading")) {
        return;
      }

      // remove focus from activeElement
      if (document.activeElement) {
        $(document.activeElement).blur();
      }

      // clear messages
      se.clear_form_message(form.form);

      // validate edit-row
      if (typeof form.validate_form === "function") {
        form.validate_form(form);
      }

      // any pre-submit errors?
      if (se.has_form_message(form.form, "error")) {
        return;
      }

      // add a loading class to flag we are submitting the form
      form.form.addClass("loading");

      // submit edit-row
      if (typeof form.submit_form === "function") {
        form.submit_form(form);
      }
    },

    form_error: function(form, msg) {
      return se.form_message(form, msg, "error");
    },

    form_message: function(form, msg, type) {
      var form_msg = $("<div class='form-msg'>").text(msg).hide();

      $(".form-group", form).prepend(form_msg);
      form_msg.slideDown();

      var msg_data = form.data("form-msg");
      if (!msg_data) {
        msg_data = {};
        form.data("form-msg", msg_data);
      }
      if (!msg_data[type]) {
        msg_data[type] = [form_msg];
      }
      else {
        msg_data[type].push(form_msg);
      }
      return form_msg;
    },

    clear_form_message: function(form) {
      var msg_data = form.data("form-msg");
      if (msg_data) {
        $.each(msg_data, function(type,msgs) {
          $.each(msgs, function(i,msg) {
            msg.remove();
          });
        });
        form.removeData("form-msg");
      }
    },

    has_form_message: function(form, type) {
      var msg_data = form.data("form-msg");
      if (type) {
        return msg_data && msg_data[type] && msg_data[type].length;
      }
      return msg_data != null;
    }

  };

})(jQuery, window.freebase);
