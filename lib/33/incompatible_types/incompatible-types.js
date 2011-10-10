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

   var it = fb.incompatible_types = {

     dialog: null,

     /**
      * Check the compatibility of the types of topic_id to
      * the specified type_id (i.e., the expected type of a property).
      * The compatible_callback will be invoked 2 arguments:
      * 1) the topic_id
      * 2) the type_id
      * The incompatible_callback will be invoked with 3 arguments:
      * 1) the topic id
      * 1) the exiting type id (i.e., type_id)
      * 2) the incompatible type id (that is NOT compatible with the existing type)
      */
     check: function(topic_id, type_id, compatible_callback, incompatible_callback) {

       $.ajax({
         url: fb.h.ajax_url("lib/incompatible_types/incompatible_types.ajax"),
         data: {id:topic_id, type:type_id},
         dataType: "json",
         success: function(data) {
           var result = data.result || [];
           if (result.length) {
             // incompatible types
             result = result[0]; // just alert the first incompatible item
             incompatible_callback(topic_id, result, type_id);
           }
           else {
             compatible_callback(topic_id, type_id);
           }
         }
       });
     },

     /**
      * The specific incompatible callback within the context of suggest input.
      * This callback will overlay a confirm dialog that the
      */
     suggest_incompatible_callback: function(suggest_input, confirm_callback) {
       return function(topic_id, existing_type_id, incompatible_type_id) {
         if (!it.dialog) {
           it.dialog = $(".incompatible-dialog");
         }
         if (it.dialog.length) {
           $(".incompatible-topic", it.dialog).text(topic_id);
           $(".incompatible-existing", it.dialog).text(existing_type_id);
           $(".incompatible-type", it.dialog).text(incompatible_type_id);
           var inst = suggest_input.data("suggest");
           it.dialog.overlay({
             close: "button",
             closeOnClick: false,
             load: true,
             mask: {
               color: '#000',
               loadSpeed: 200,
               opacity: 0.5
             },
             onClose: function() {
               suggest_input.focus().select();
               $("button", it.dialog).unbind();
             },
             onLoad: function() {
               $(".button-cancel", it.dialog).focus();
               $(".button-submit").click(function() {
                 confirm_callback(topic_id, incompatible_type_id);
               });
             }
           });
         }
         else {
           if (confirm("Because " + topic_id + " is already Typed as " + existing_type_id + ", it's unlikely it should also be Typed as " + incompatible_type_id + ". Are you shure you want to continue")) {
             confirm_callback(topic_id, incompatible_type_id);
           }
           suggest_input.focus().select();
         }
       };
     }

   };

})(jQuery, window.freebase);
