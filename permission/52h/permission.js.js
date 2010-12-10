
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
