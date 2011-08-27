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
      * ADD
      */

     /**
      * Inline add form. The form is made up of three rows: (1) head_row, (2) edit_row, and (3) submit_row.
      * These rows are appended to the end of options.body, in order.
      * Ater successful submit, the new row will added to the end of the body right before the form rows.
      *
      * @param options:Object (required): A set of key/value pairs specifying form options:
      * - event_prefix:String (required) - This is the prefix of all events that will be triggered
      *   in the course of interacting with the form. (i.e., <event_prefix[submit|cancel|error|success]).
      * - init:Function (required) - The callback to initialize the form.
      * - validate:Function (required) - The callback to validate the form.
      * - submit:Function (required) - The callback to submit the form.
      * - reset:Function (required) - The callback to reset the form after a successful submit to continue add form.
      * - trigger:jQuery obj (required) - The "Add new" button that triggered the form.
      * - body:jQuery obj (required) - The list or table (<[o|u]l> or <tbody>) that will inline the form contents.
      * - head_row:jQuery obj (required) - The heading of the form. Also used for status messages (".edit-row-head").
      * - edit_row:jQuery obj (required) - The form content including all visible inputs (".edit-row").
      * - submit_row:jQuery obj (required) - The submit buttons (submit and cancel) and hidden inputs (".edit-row-submit").
      */
     init_inline_add_form: function(options) {
       // TODO: check options
       var trigger_row = options.trigger.parents(".trigger-row:first");
       var event_prefix = options.event_prefix || "fb.form.inline_add_form.";
       options.edit_row
         .bind(event_prefix + "submit", function() {
           form.submit_inline_add_form(options);
         })
         .bind(event_prefix + "cancel", function() {
           form.cancel_inline_add_form(options);
         })
         .bind(event_prefix + "error", function(e, msg) {
           form.error(options, msg);
           options.edit_row.removeClass("loading");
         })
         .bind(event_prefix + "success", function() {
           options.edit_row.removeClass("loading");
         });
       form.init_submit_cancel(options);
       trigger_row.hide();
       options.body
         .append(options.head_row)
         .append(options.edit_row)
         .append(options.submit_row);
       options.init(options);
     },

     submit_inline_add_form: function(options) {
       // are we already submitting?
       if (options.edit_row.is(".loading")) {
         return;
       }

       // is submit button disabled?
       if (!form.is_submit_enabled(options)) {
         return;
       }

       // remove focus from activeElement
       if (document.activeElement) {
         $(document.activeElement).blur();
       }

       // clear messages
       form.clear_message(options);

       // validate form
       if (!options.validate(options)) {
         return;
       }

       // add a loading class to the form
       options.edit_row.addClass("loading");

       // submit form
       options.submit(options, form.default_submit_ajax_options(options));
     },

     success_inline_add_form: function(options, new_row) {
       options.head_row.before(new_row);
       // i18n'ize dates and numbers
       i18n.ize(new_row);
       options.reset(options);
       options.edit_row.trigger(options.event_prefix + "success");
     },

     cancel_inline_add_form: function(options) {
       var trigger_row = options.trigger.parents(".trigger-row:first");
       options.head_row.remove();
       options.edit_row.remove();
       options.submit_row.remove();
       trigger_row.show();
     },


     /**
      * EDIT
      */

     /**
      * Inline edit form. The form is made up of three rows: (1) head_row, (2) edit_row, and (3) submit_row.
      * These rows are appended next to options.row and options.row is hidden.
      * After successful submit, options.row will be replaced by the newly edited row.
      *
      * @param options:Object (required): A set of key/value pairs specifying form options:
      * - event_prefix:String (required) - This is the prefix of all events that will be triggered
      *   in the course of interacting with the form. (i.e., <event_prefix[submit|cancel|error|success]).
      * - init:Function (required) - The callback to initialize the form.
      * - validate:Function (required) - The callback to validate the form.
      * - submit:Function (required) - The callback to submit the form.
      *
      * - row:jQuery obj (required) - The row being edited.
      * - head_row:jQuery obj (required) - The heading of the form. Also used for status messages (".edit-row-head").
      * - edit_row:jQuery obj (required) - The form content including all visible inputs (".edit-row").
      * - submit_row:jQuery obj (required) - The submit buttons (submit and cancel) and hidden inputs (".edit-row-submit").
      */
     init_inline_edit_form: function(options) {
       var event_prefix = options.event_prefix || "fb.form.inline_edit_form.";
       options.edit_row
         .bind(event_prefix + "submit", function() {
           form.submit_inline_edit_form(options);
         })
         .bind(event_prefix + "cancel", function() {
           form.cancel_inline_edit_form(options);
         })
         .bind(event_prefix + "error", function(e, msg) {
           form.error(options, msg);
           options.edit_row.removeClass("loading");
         })
         .bind(event_prefix + "success", function() {
           options.edit_row.removeClass("loading");
         });
       form.init_submit_cancel(options);
       options.row.hide();
       options.row
         .before(options.head_row)
         .before(options.edit_row)
         .before(options.submit_row);
       options.init(options);
     },

     submit_inline_edit_form: function(options) {
       // are we already submitting?
       if (options.edit_row.is(".loading")) {
         return;
       }

       // is submit button disabled?
       if (!form.is_submit_enabled(options)) {
         return;
       }

       // remove focus from activeElement
       if (document.activeElement) {
         $(document.activeElement).blur();
       }

       // clear messages
       form.clear_message(options);

       // validate form
       if (!options.validate(options)) {
         return;
       }

       // add a loading class to the form
       options.edit_row.addClass("loading");

       // submit form
       options.submit(options, form.default_submit_ajax_options(options));
     },

     success_inline_edit_form: function(options, new_row) {
       options.row.replaceWith(new_row);
       options.row = new_row;
       // i18n'ize dates and numbers
       i18n.ize(new_row);
       options.edit_row.trigger(options.event_prefix + "cancel");
     },

     cancel_inline_edit_form: function(options) {
       options.head_row.remove();
       options.edit_row.remove();
       options.submit_row.remove();
       options.row.show();
     },



     /**
      * DELETE (row)
      */
     success_inline_delete: function(old_row, new_row, undo_callback) {
       old_row.replaceWith(new_row);
       if (undo_callback) {
         var a = $('<a href="#">Undo</a>');
         $(".msg-default", new_row).next().append(a);
         a.click(function() {
           undo_callback();
           return false;
         });
       }
     },

     /**
      * UNDO (DELETE)
      */
     success_inline_delete_undo: function(old_row, new_row) {
       old_row.replaceWith(new_row);
       // i18n'ize dates and numbers
       i18n.ize(new_row);
     },


     /**
      * MODAL FORM
      */

     init_modal_form: function(options) {
       $(document.body).append(options.form.hide());
       var event_prefix = options.event_prefix || "fb.form.modal_form.";
       options.form
         .bind(event_prefix + "submit", function() {
           form.submit_modal_form(options);
         })
         .bind(event_prefix + "cancel", function() {
           form.cancel_modal_form(options);
         })
         .bind(event_prefix + "error", function(e, msg) {
           form.error(options, msg);
           options.form.removeClass("loading");
         })
         .bind(event_prefix + "success", function() {
           options.form.removeClass("loading");
         });
       form.init_submit_cancel(options);
       options.form.overlay({
         close: ".modal-buttons .button-cancel",
         closeOnClick: false,
         load: true,
         mask: {
           color: '#000',
	   loadSpeed: 200,
	   opacity: 0.5
	 },
         onLoad: function() {
           // init form
           options.init(options);
         }
       });
     },

     submit_modal_form: function(options) {
       // are we already submitting?
       if (options.form.is(".loading")) {
         return;
       }

       // is submit button disabled?
       if (!form.is_submit_enabled(options)) {
         return;
       }

       // remove focus from activeElement
       if (document.activeElement) {
         $(document.activeElement).blur();
       }

       // clear messages
       form.clear_message(options);

       // validate form
       if (!options.validate(options)) {
         return;
       }

       // add a loading class to the form
       options.form.addClass("loading");

       // submit form
       options.submit(options, form.default_submit_ajax_options(options));
     },

     cancel_modal_form: function(options) {
       options.form.data("overlay").close();
     },


     /**
      * form helpers
      */



     /**
      * Init submit/cancel buttons. Also handle ENTER/ESCAPE key events in the form inputs.
      */
     init_submit_cancel: function(options) {
       var form_content = options.form || options.edit_row;
       var submit_content = options.form || options.submit_row;

       var event_prefix = options.event_prefix;
       // submit button
       var submit_button = $(".button-submit", submit_content)
         .click(function() {
           form_content.trigger(event_prefix + "submit");
         });
       fb.disable(submit_button);
       // cancel button
       $(".button-cancel", submit_content).click(function() {
         form_content.trigger(event_prefix + "cancel");
       });
       // submit/cancel on ENTER/ESCAPE
       $(":input", options.edit_row)
         .keypress(function(e) {
           if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
             form_content.trigger(event_prefix + "submit");
           }
         })
         .keyup(function(e) {
           if (e.keyCode === 27) { // escape
             form_content.trigger(event_prefix + "cancel");
           }
         });
     },

     /**
      * disable/enable submit button
      */
     disable_submit: function(options) {
       var submit_content = options.form || options.submit_row;
       fb.disable($(".button-submit", submit_content));
     },

     enable_submit: function(options) {
       var submit_content = options.form || options.submit_row;
       fb.enable($(".button-submit",  submit_content));
     },

     is_submit_enabled: function(options) {
       var submit_content = options.form || options.submit_row;
       return !$(".button-submit", submit_content).is(":disabled");
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
       var msg_row = options.head_row;
       msg_row.find(".close-msg").css("visibility", "visible").next().find(".msg-default").hide().next().text(msg);
       msg_row.addClass("row-msg");
       if (type) {
         msg_row.addClass("row-msg-" + type);
       }
     },

     clear_message: function(options) {
       // TODO: handle modal messages AND inline messages
/**
       var msg_row = options.head_row;
       msg_row.find(".close-msg").css("visibility", "hidden").next().find(".msg-default").show().next().html("&nbsp;");
       msg_row.removeClass("row-msg");
**/
     },


     /**
      * $.ajax default ajax begin/submit options
      */

     default_begin_ajax_options: function() {
       return form._default_ajax_options("GET");
     },

     default_submit_ajax_options: function(options) {
       var ajax_options = form._default_ajax_options("POST");
       if (options) {
         $.extend(ajax_options, options.ajax);
         var submit_content = options.submit_row || options.form;
         $("input[type=hidden]", submit_content).each(function() {
           ajax_options.data[this.name] = this.value;
         });
       }
       return ajax_options;
     },

     _default_ajax_options: function(method) {
       return {
         data: {},
         dataType: "json",
         type: method || "GET",
         success: function() {
           if (!form.check_ajax_success.apply(null, arguments)) {
             return;
           }
           // onsuccess is our own success handler that's called after
           // the boiler plate check_ajax_success
           if (this.onsuccess) {
             this.onsuccess.apply(this, arguments);
           }
         },
         error: function() {
           var errmsg = form.check_ajax_error.apply(null, arguments);
           // onerror is our own success handler that's called after
           // the boiler plate check_ajax_error
           if (this.onerror) {
             var args = [errmsg].concat(Array.prototype.slice.call(arguments));
             this.onerror.apply(this, args);
           }
         }
       };
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
