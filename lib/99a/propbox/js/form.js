/*
 * Copyright 2012, Google Inc.
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

(function($, status) {

   // requires:
   // status (@see freebase.status)

   var formlib = window.formlib = {

     // for success/error/info/warning messages
     status: status,

     /**
      * generic form
      */
     init: function(options) {
         var event_prefix = options.event_prefix || "form.";
         options.form
             .bind(event_prefix + "submit", function() {
                 formlib.submit(options);
             })
             .bind(event_prefix + "cancel", function() {
                 formlib.cancel(options);
             })
             .bind(event_prefix + "error", function(e, msg) {
                 options.form.removeClass("loading");
                 formlib.disable_submit(options);
                 status.error(msg, true);
             })
             .bind(event_prefix + "success", function() {
                 options.form.removeClass("loading");
             })
             .bind(event_prefix + "valid", function() {
                 formlib.enable_submit(options);
             })
             .bind(event_prefix + "invalid", function() {
                 formlib.disable_submit(options);
             });
         formlib.init_submit_cancel(options);
         options.init(options);
     },

     submit: function(options) {
       // are we already submitting?
       if (options.form.is(".loading")) {
         return;
       }

       // is submit button disabled?
       if (!formlib.is_submit_enabled(options)) {
         return;
       }

       // remove focus from activeElement
       if (document.activeElement) {
         $(document.activeElement).blur();
       }

       // validate form
       if (!options.validate(options)) {
         return;
       }

       // add a loading class to the form
       options.form.addClass("loading");

       // submit form
       options.submit(options, formlib.default_submit_ajax_options(options));
     },

     cancel: function(options) {
         // Do nothing
         // options.form.bind(event_prefix + "cancel", ...) to handle cancel
     },


     /**
      * ADD
      */

     /**
      * Inline add form. The form is made up of three rows: (1) edit_row, and (2) submit_row.
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
      * - edit_row:jQuery obj (required) - The form content including all visible inputs (".edit-row").
      * - submit_row:jQuery obj (required) - The submit buttons (submit and cancel) and hidden inputs (".edit-row-submit").
      */
     init_inline_add_form: function(options) {
       // TODO: check options

       var event_prefix = options.event_prefix || "form.inline_add_form.";
       options.edit_row
         .bind(event_prefix + "submit", function() {
           formlib.submit_inline_add_form(options);
         })
         .bind(event_prefix + "cancel", function() {
           formlib.cancel_inline_add_form(options);
         })
         .bind(event_prefix + "error", function(e, msg) {
           options.edit_row.removeClass("loading");
           formlib.disable_submit(options);
           status.error(msg, true);
         })
         .bind(event_prefix + "success", function() {
           options.edit_row.removeClass("loading");
         })
         .bind(event_prefix + "valid", function() {
           formlib.enable_submit(options);
         })
         .bind(event_prefix + "invalid", function() {
           formlib.disable_submit(options);
         });
       formlib.init_submit_cancel(options);
       if (options.trigger) {
         options.trigger.parents(".trigger-row:first").hide();
       }
       options.body
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
       if (!formlib.is_submit_enabled(options)) {
         return;
       }

       // remove focus from activeElement
       if (document.activeElement) {
         $(document.activeElement).blur();
       }

       // validate form
       if (!options.validate(options)) {
         return;
       }

       // add a loading class to the form
       options.edit_row.addClass("loading");

       // submit form
       options.submit(options, formlib.default_submit_ajax_options(options));
     },

     /**
      * Use this when you don't want to wait for a response for your
      * inline_add_form submit and quickly want to reset the form
      * for successive add operations.
      * @param {object} options The init options to init_inline_add_form.
      * @param {object} ajax_options $.ajax options.
      */
     submit_and_continue_inline_add_form: function(options, ajax_options) {
       var old_beforeSend = ajax_options.beforeSend;
       var old_complete = ajax_options.complete;
       var o = $.extend({}, ajax_options, {
         beforeSend: function(xhr, settings) {
           if (old_beforeSend) {
             old_beforeSend.apply(this, arguments);
           }
           // clone the edit and submit row
           var cloned_edit_row = options.edit_row
               .clone().addClass('edit-row-submitting');
           fb.disable($(":input", cloned_edit_row));
           // keep track so we can remove/replace with the 'new-row'
           xhr._cloned_edit_row = cloned_edit_row;
           options.edit_row.before(cloned_edit_row);
           // continue to add without waiting for response
           options.reset(options);
         },
         complete: function(xhr) {
           if (old_complete) {
             old_complete.apply(this, arguments);
           }
           // clean up cloned elements from the xhr
           delete xhr._cloned_edit_row;
         }
       });
       $.ajax(o);
     },

     success_inline_add_form: function(options, new_row, xhr) {
       if (xhr && xhr._cloned_edit_row) {
         xhr._cloned_edit_row.replaceWith(new_row);
       }
       else {
         options.edit_row.before(new_row);
         options.reset(options);
       }
       formlib.animate_new_row(new_row);
       options.edit_row.trigger(options.event_prefix + "success");
     },

     cancel_inline_add_form: function(options) {
       options.edit_row.remove();
       options.submit_row.remove();
       if (options.trigger) {
         options.trigger.parents(".trigger-row:first").show();
       }
     },

     animate_new_row: function(new_row) {
       new_row.addClass('new-row', 1000, function() {
         new_row.removeClass('new-row', 1000);
       });
     },


     /**
      * EDIT
      */

     /**
      * Inline edit form. The form is made up of three rows: (1) edit_row, and (2) submit_row.
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
      * - edit_row:jQuery obj (required) - The form content including all visible inputs (".edit-row").
      * - submit_row:jQuery obj (required) - The submit buttons (submit and cancel) and hidden inputs (".edit-row-submit").
      */
     init_inline_edit_form: function(options) {
       var event_prefix = options.event_prefix || "form.inline_edit_form.";
       options.edit_row
         .bind(event_prefix + "submit", function() {
           formlib.submit_inline_edit_form(options);
         })
         .bind(event_prefix + "cancel", function() {
           formlib.cancel_inline_edit_form(options);
         })
         .bind(event_prefix + "error", function(e, msg) {
           options.edit_row.removeClass("loading");
           formlib.disable_submit(options);
           status.error(msg, true);
         })
         .bind(event_prefix + "success", function() {
           options.edit_row.removeClass("loading");
         })
         .bind(event_prefix + "valid", function() {
           formlib.enable_submit(options);
         })
         .bind(event_prefix + "invalid", function() {
           formlib.disable_submit(options);
         });
       formlib.init_submit_cancel(options);
       options.row.hide();
       options.row
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
       if (!formlib.is_submit_enabled(options)) {
         return;
       }

       // remove focus from activeElement
       if (document.activeElement) {
         $(document.activeElement).blur();
       }

       // validate form
       if (!options.validate(options)) {
         return;
       }

       // add a loading class to the form
       options.edit_row.addClass("loading");

       // submit form
       options.submit(options, formlib.default_submit_ajax_options(options));
     },

     success_inline_edit_form: function(options, new_row) {
       options.row.replaceWith(new_row);
       options.row = new_row;
       formlib.animate_new_row(new_row);
       options.edit_row.trigger(options.event_prefix + "cancel");
     },

     cancel_inline_edit_form: function(options) {
       options.edit_row.remove();
       options.submit_row.remove();
       options.row.show();
     },

     /**
      * DELETE (row)
      */
     success_inline_delete: function(old_row, msg_row, undo_callback) {
       old_row.hide().addClass("old-row");
       old_row.after(msg_row);
       msg_row.append(old_row);
       formlib.animate_new_row(msg_row);
       if (undo_callback) {
         var a = $('<a href="#">undo</a><span class="divider">|</span>');
         $(".msg-default", msg_row).next().append(a);
         a.click(function() {
           undo_callback();
           return false;
         });
       }
     },

     /**
      * UNDO (DELETE)
      */
     success_inline_delete_undo: function(msg_row) {
       var old_row = $(".old-row", msg_row);
       msg_row.before(old_row);
       old_row.show().removeClass("old-row");
       msg_row.remove();
       formlib.animate_new_row(old_row);
     },


     /**
      * MODAL FORM
      */

     init_modal_form: function(options) {
       $(document.body).append(options.form.hide());
       var event_prefix = options.event_prefix || "form.modal_form.";
       options.form
         .bind(event_prefix + "submit", function() {
           formlib.submit_modal_form(options);
         })
         .bind(event_prefix + "cancel", function() {
           formlib.cancel_modal_form(options);
         })
         .bind(event_prefix + "error", function(e, msg) {
           options.form.removeClass("loading");
           formlib.disable_submit(options);
           status.error(msg, true);
         })
         .bind(event_prefix + "success", function() {
           options.form.removeClass("loading");
         })
         .bind(event_prefix + "valid", function() {
           formlib.enable_submit(options);
         })
         .bind(event_prefix + "invalid", function() {
           formlib.disable_submit(options);
         });
       formlib.init_submit_cancel(options);
       if (options.form.data("overlay")) {
           // remove existing overlay data
           options.form.removeData("overlay");
       }
       options.form.overlay({
         close: ".modal-buttons .cancel",
         closeOnClick: false,
         load: true,
         fixed: false,
         mask: {
           color: '#000',
           loadSpeed: 200,
           opacity: 0.5
         },
         onLoad: function() {
           // init form
           options.overlay = this;
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
       if (!formlib.is_submit_enabled(options)) {
         return;
       }

       // remove focus from activeElement
       if (document.activeElement) {
         $(document.activeElement).blur();
       }

       // validate form
       if (!options.validate(options)) {
         return;
       }

       // add a loading class to the form
       options.form.addClass("loading");

       // submit form
       options.submit(options, formlib.default_submit_ajax_options(options));
     },

     cancel_modal_form: function(options) {
       options.form.data("overlay").close();
       options.form.next("#exposeMask").hide();
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
       var submit_button = $(".save", submit_content)
         .click(function() {
           form_content.trigger(event_prefix + "submit");
         });
       formlib.disable(submit_button);
       // cancel button
       $(".cancel", submit_content).click(function() {
         form_content.trigger(event_prefix + "cancel");
       });
       // submit/cancel on ENTER/ESCAPE
       $(":input", form_content)
/**         .keypress(function(e) {
           if (e.keyCode === 13 && !e.isDefaultPrevented()) { // enter
             form_content.trigger(event_prefix + "submit");
           }
         })**/
         .keyup(function(e) {
           if (e.keyCode === 27) { // escape
             form_content.trigger(event_prefix + "cancel");
           }
         });
     },

     /**
      * disable/enable submit button
      */

     disable: function(elt) {
       $(elt).attr("disabled", "disabled").addClass("disabled");
     },

     enable: function(elt) {
       $(elt).removeAttr("disabled").removeClass("disabled");
     },

     disable_submit: function(options) {
       var submit_content = options.form || options.submit_row;
       formlib.disable($(".save", submit_content));
     },

     enable_submit: function(options) {
       var submit_content = options.form || options.submit_row;
       formlib.enable($(".save",  submit_content));
     },

     is_submit_enabled: function(options) {
       var submit_content = options.form || options.submit_row;
       return !$(".save", submit_content).is(":disabled");
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

     /**
      * $.ajax default ajax begin/submit options
      */

     default_begin_ajax_options: function() {
       var ajax_options = $.extend(formlib._default_ajax_options("GET"), {
           beforeSend: function() {
               status.doing("Loading...");
           },
           complete: function() {
               if (!this.formlib_error) {
                   status.clear();
               }
           }
       });
       return ajax_options;
     },

     default_submit_ajax_options: function(options) {
       options = options || {};
       var ajax_options = $.extend(formlib._default_ajax_options("POST"), options.ajax, {
           beforeSend: function() {
               this.formlib_options = options;
               status.doing("Saving...");
               if ($.isFunction(options.beforeSend)) {
                   options.beforeSend.apply(this, arguments);
               }
           },
           complete: function() {
               if (!this.formlib_error) {
                   status.clear();
               }
               if ($.isFunction(options.complete)) {
                   options.complete.apply(this, arguments);
               }
           }
       });
       var submit_content = options.submit_row || options.form;
       if (submit_content) {
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
         success: function(data, textStatus, xhr) {
           if (!formlib.check_ajax_success(data, textStatus, xhr)) {
             return this._error(xhr);
           }
           // onsuccess is our own success handler that's called after
           // the boiler plate check_ajax_success
           if ($.isFunction(this.onsuccess)) {
             this.onsuccess(data, textStatus, xhr);
           }
         },
         error: function(xhr) {
           return this._error(xhr);
         },
         _error: function(xhr) {
           // handle 401: Not authorized
           if (xhr.status === 401) { // unauthorized
             status.info("Authorizing...");
             $(window).trigger("fb.user.unauthorized");
             return;
           }
           console.error(xhr.responseText);
           this.formlib_error = true;
           var errmsg = formlib.get_error_message(xhr.responseText);
           if ($.isFunction(this.onerror)) {
             this.onerror(errmsg, xhr);
           }
           else {
             var form_content = null;
             if (this.formlib_options) {
                 if (this.formlib_options.form) {
                     // This is a modal dialog.
                     // Close on error
                     this.formlib_options.form.trigger(this.formlib_options.event_prefix + "cancel");
                     form_content = this.formlib_options.form;
                 }
                 else {
                     form_content = this.formlib_options.edit_row;
                 }
             }
             if (form_content) {
                 form_content.trigger(this.formlib_options.event_prefix + "error", errmsg);
             }
             else {
                 status.error(errmsg, true);
             }
           }
         }
       };
     },

     /**
      * "this" is $.ajax scope
      */
     check_ajax_success: function(data, textStatus, xhr) {
       // TODO: do we need to handle any freebase api specific codes here?
       return formlib.check_api_response(data, textStatus, xhr);
     },

     /**
      * "this" is $.ajax scope
      */
     check_api_response: function(data, textStatus, xhr) {
       if ($.isPlainObject(data)) {
         if (data.error && data.error.code === 401) {
           status.info("Authorizing...");
           $(window).trigger("fb.user.unauthorized");
           return false;
         }
         // JSON
         else if (data.code !== "/api/status/ok") {
           return false;
         }
       }
       else if (xhr.status !== 200) {
         return false;
       }
       return true;
     },

     get_error_message: function(msg) {
         // try JSON parse and extract the error message
         var errmsg = null;
         try {
             var data = JSON.parse(msg);
             if (data) {
                 if (data.error && data.error.message) {
                     errmsg = data.error.message;
                 }
                 else if ($.isArray(data.messages) &&
                          data.messages.length) {
                     errmsg = data.messages[0].message;
                 }
             }
         }
         catch (ex) {
             // ignore;
         }
         if (!errmsg) {
             errmsg = msg;
         }
         return errmsg;
     }
   };

})(jQuery, window.freebase.status);
