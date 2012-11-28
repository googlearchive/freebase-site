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


(function($, fb) {

   var p = fb.permission = {
     init: function() {
       if (!fb.user) {
         // if no user, don't need to waste our time with the permission query
         setTimeout(function() {
           p.has_permission = false;
           $(window).trigger("fb.permission.has_permission", p.has_permission);
         });
         return;
       }
       var c = fb.c;

       if (c && c.id) {
         //console.log("permission.js", c.id, fb.user.id);

         // does fb.user have permission on c.id?
         $.ajax({
           url: fb.h.ajax_url("lib/permission/has_permission.ajax"),
           data: {id:c.id, user_id:fb.user.id},
           dataType: "json",
           success: function(data) {
             p.has_permission = ( data.result && data.result[c.id] === true );
             //console.log("has_permission", p.has_permission);
             $(window).trigger("fb.permission.has_permission", p.has_permission);
           }
         });
       }

       /**
        * Check for specific permissioned objects in the page.
        * A permissioned object has the class 'edit-perm {id: "/some/id"}'
        */
       check_permissioned_objects($(".edit-perm"), fb.user.id);
     }
   };

   // check permission when user is signedin
   $(window).bind("fb.user.signedin", p.init);

   // if user is signeout, fb.permission.has_permission is always FALSE
   $(window).bind("fb.user.signedout", p.init);

   // enable/show edit controls if user has permission
   $(window).bind("fb.permission.has_permission", function(e, has_permission) {
     if (has_permission) {
       $(".edit").show();
     } else {
       $(".no-edit").show();
     }
   });

})(jQuery, window.freebase);


function check_permissioned_objects(perm_objs, user_id) {
  if (! (perm_objs.length && user_id)) {
    return;
  }
  var seen = {};
  var ids = [];
  $.each(perm_objs, function() {
    var id = $(this).metadata().id;
    if (id && !seen[id]) {
      ids.push(id);
      seen[id] = 1;
    }
  });
  if (!ids.length) {
    return;
  }

  $.ajax({
    url: fb.h.ajax_url("lib/permission/has_permission.ajax"),
    data: {id:ids, user_id:user_id},
    traditional: true,
    dataType: "json",
    success: function(data) {
      var permissions = data.result || {};
      $.each(perm_objs, function() {
        var id = $(this).metadata().id;
        if (id && permissions[id] === true) {
          $(this).show();
        }
        else {
          $(this).addClass("edit-perm-lock");
        }
      });
    }
  });
};
