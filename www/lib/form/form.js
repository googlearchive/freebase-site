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

(function($, fb) {


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
       var head_row = $("tr:first", options.form);
       var form_row = head_row.next("tr");
       var submit_row = form_row.next("tr");
       var event_prefix = options.event_prefix || "fb.form.";
       options.form
         .bind(event_prefix + "submit", function() {
           form.submit_table_add_form(options);
         })
         .bind(event_prefix + "cancel", function() {
           form.cancel_table_add_form(options);
         })
         .bind(event_prefix + "error", function(e, msg) {
           form.error(head_row, msg);
           options.form.removeClass("loading");
         })
         .bind(event_prefix + "success", function() {
           options.form.removeClass("loading");
         });
       // submit button
       $(".button-submit", submit_row).click(function() {
         options.form.trigger(event_prefix + "submit");
       });
       // cancel button
       $(".button-cancel", submit_row).click(function() {
         options.form.trigger(event_prefix + "cancel");
       });
       trigger_row.hide();
       options.table.append(options.form);
       options.init(options);
     },

     validate_table_add_form: function(options) {

     },

     sumbit_table_add_form: function(options) {

     },

     cancel_table_add_form: function(options) {
       var trigger_row = options.trigger.parents("tr:first");
       options.form.remove();
       trigger_row.show();
     },













     error: function(row, msg) {

     },


     check_ajax_success: function(data, status, xhr) {console.log("check_ajax_success", arguments);
       // handle 401: Not authorized
       // check data.status code
       return true;
     },

     check_ajax_error: function(xhr) {console.log("check_ajax_error", arguments);
       return xhr.responseText;
     }
   };

})(jQuery, window.freebase);
