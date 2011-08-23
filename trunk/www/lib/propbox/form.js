/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function($, fb, i18n) {


   var form = fb.form = {


     /**
      * Initialize a form that is created by clicking an "Add new" button at the <tfoot> of a <table>.
      * The actual form <tbody> is appending to the <table>.
      *
      * @param options:Object (required): A set of key/value pairs specifying form options:
      * - event_prefix:String (required) - This is the prefix of all events that will be triggered
      *   in the course of interacting with the form. (i.e., <event_prefix[submit|cancel|error|success]).
      * - init:Function (required) - The callback to initialize the form.
      * - validate:Function (required) - The callback to validate the form.
      * - submit:Function (required) - The callback to submit the form.
      * - trigger:jQuery obj (required) - The "Add new" button that triggered the form.
      * - table:jQuery obj (required) - The <table> that will contain the form.
      * - form:jQuery obj (required) - The form should be a <tbody> with 3 rows:
      *   - 1st row: The heading of the form. Also used for status messages.
      *   - 2nd row: The form content (inputs)
      *   - 3rd row: The submit buttons (submit and cancel)
      */
     init_table_add_form: function(options) {console.log("fb.form.init_table_add_form", options);
       // TODO: check options
       var trigger_row = options.trigger.parents("tr:first");
       var head_row = $(".edit-row-head", options.form);
       var form_row = $(".edit-row", options.form);
       var submit_row = $(".edit-row-submit", options.form);
       var event_prefix = options.event_prefix || "fb.form.";
       options.form
         .bind(event_prefix + "submit", function() {console.log("SUBMIT");
           form.submit_table_add_form(options);
         })
         .bind(event_prefix + "cancel", function() {
           form.cancel_table_add_form(options);
         })
         .bind(event_prefix + "error", function(e, msg) {
           form.error(options, msg);
           options.form.removeClass("loading");
         })
         .bind(event_prefix + "success", function() {
           options.form.removeClass("loading");
         });
       // submit button
       $(".button-submit", submit_row)
         .click(function() {
           options.form.trigger(event_prefix + "submit");
         })
         // disable submit
         .attr("disabled", "disabled")
         .addClass("disabled");
       // cancel button
       $(".button-cancel", submit_row).click(function() {
         options.form.trigger(event_prefix + "cancel");
       });
       // submit/cancel on ENTER/ESCAPE
       $(":input", options.form)
         .keypress(function(e) {
           if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
             options.form.trigger(event_prefix + "submit");
           }
         })
         .keyup(function(e) {
           if (e.keyCode === 27) { // escape
             options.form.trigger(event_prefix + "cancel");
           }
         });
       trigger_row.hide();
       options.table.append(options.form);
       options.init(options);
     },

     submit_table_add_form: function(options) {
       // are we already submitting?
       if (options.form.is(".loading")) {
         return;
       }

       // remove focus from activeElement
       if (document.activeElement) {
         $(document.activeElement).blur();
       }

       // clear messages
       form.clear_message(options);

       // validate form
       if (!options.validate(form)) {
         return;
       }

       // add a loading class to the form
       options.form.addClass("loading");

       // submit form
       var ajax_options = $.extend({data:{}, dataType:"json", type:"POST"}, options.ajax);
       $("input[type=hidden]", options.form).each(function() {
         ajax_options.data[this.name] = this.value;
       });
       options.submit(options, ajax_options);
     },

     success_table_add_form: function(options, new_row) {
       $("tbody:first", options.table).append(new_row);
       // i18n'ize dates and numbers
       i18n.ize(new_row);
       options.reset(options);
       options.form.trigger(options.event_prefix + "success");
     },

     cancel_table_add_form: function(options) {
       var trigger_row = options.trigger.parents("tr:first");
       options.form.remove();
       trigger_row.show();
     },


     /**
      * disable/enable submit button
      */
     disable_submit: function(options) {
       var submit_row = options.submit_row || $(".edit-row-submit", options.form);
       fb.disable($(".button-submit", submit_row));
     },

     enable_submit: function(options) {
       var submit_row = options.submit_row || $(".edit-row-submit", options.form);
       fb.enable($(".button-submit", submit_row));
     },

     /**
      * jquery.mqkley.js helpers for init and validate
      */
     init_mqlkey: function(input, mqlkey_options) {
       return input
         .next(".key-status")
           .removeClass("valid invalid loading")
           .text("")
           .removeAttr("title")
           .end()
         .mqlkey(mqlkey_options)
         .bind("valid", function(e, val) {
           $(this).next(".key-status")
             .removeClass("invalid loading")
             .addClass("valid")
             .text("valid")
             .attr("title", "Key is available");
         })
         .bind("invalid", function(e, msg) {
           $(this).next(".key-status")
             .removeClass("valid loading")
             .addClass("invalid")
             .text("invalid")
             .attr("title", msg);
         })
         .bind("textchange", function(e) {
           $(this).next(".key-status")
             .removeClass("valid invalid")
             .text("loading")
             .addClass("loading");
         });
     },

     validate_mqlkey: function(options, input) {
       var key_status = input.next(".key-status");
       var keyval = input.val();
       if (keyval === "") {
         //console.log("VALIDATE MQLKEY", "EMPTY");
         input.trigger(options.event_prefix + "error", "Key is required");
         return false;
       }
       if (keyval === input.data("mqlkey").original) {
         //console.log("VALIDATE MQLKEY", "ORIGINAL");
         return true;
       }
       if (key_status.is(".invalid")) {
         //console.log("VALIDATE MQLKEY", "INVALID");
         input.trigger(options.event_prefix + "error", key_status.attr("title"));
         return false;
       }
       else if (key_status.is(".loading")) {
         //console.log("VALIDATE MQLKEY", "LOADING");
         return false;
       }
       //console.log("VALIDATE MQLKEY", "VALID");
       return true;
     },


     error: function(options, msg) {
       form.disable_submit(options);
       return form.message(options, msg, "error");
     },

     message: function(options, msg, type) {
       var msg_row = options.head_row || $(".edit-row-head", options.form);
       msg_row.find(".close-msg").css("visibility", "visible").next().find(".msg-default").hide().next().text(msg);
       msg_row.addClass("row-msg");
       if (type) {
         msg_row.addClass("row-msg-" + type);
       }
     },

     clear_message: function(options) {
       var msg_row = options.head_row || $(".edit-row-head", options.form);
       msg_row.find(".close-msg").css("visibility", "hidden").next().find(".msg-default").show().next().html("&nbsp;");
       msg_row.removeClass("row-msg");
     },

     check_ajax_success: function(data, status, xhr) {
       // TODO:
       // handle 401: Not authorized
       // check data.status code
       return true;
     },

     check_ajax_error: function(xhr) {
       // TODO:
       return xhr.responseText;
     }
   };

})(jQuery, window.freebase, window.i18n);
