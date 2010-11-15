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

   var p = fb.permission = {
     init: function() {
       if (!fb.user) {
         // if no user, don't need to waste our time with the permission query
         return;
       }
       if (typeof fb.acre === "undefined" || typeof fb.acre.c === "undefined") {
         // all templates that go through /freebase/site/template/freebase.mjt will declare an "acre" var.
         return;
       }
       var c = fb.acre.c;
       if (!(c && c.id)) {
         // c.id is the primary node in question
         return;
       }

       //console.log("permission.js", c.id, fb.user.id);

       var perm = fb.permission = {
         jsonp: function(data) {
           perm.has_permission = data.result === true;
           //console.log("has_permission", perm.has_permission);
           $(window).trigger("fb.permission.has_permission", perm.has_permission);
         }
       };

       // does fb.user have permission on c.id?
       $.ajax({
         url: fb.acre.request.app_url + "/permission/service/has_permission",
         data: {id:c.id, user_id:fb.user.id},
         dataType: "jsonp",
         jsonpCallback: "window.freebase.permission.jsonp"
       });
     }
   };

   // only check permission if user is signedin
   $(window).bind("fb.user.signedin", p.init);

})(jQuery, window.freebase);
