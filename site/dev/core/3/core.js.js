
/**
 * init user signed-in state
 */
(function($) {
  $(function(){

    $.ajax({
      url: user_info_service_url || "/api/service/user_info",
      cache: false,
      dataType: "json",
      success: function(data) {
        if (data) {
          // signed in
          var u = $("#nav-username a:first");
          if (u.length) {
            u[0].href += data.id;
            u.text(data.username);
          }
          $("#signedin").show();
        }
        else {
          // signed out
          $("#signedout").show();
        }
      },
      error: function() {
         $("#signedout").show();
      }
    });
  });
})(jQuery);


/**
 * init freebase site header search box (suggest)
 */
(function($){
   $(function() {
     var search = $("#SearchBox .SearchBox-input,#global-search-input");
     var root =  document.location.protocol + "//www.freebase.com";

     search.suggest({
       service_url:root,
       soft:true,
       category: "object",
       parent: "#site-search-box",
       align: "right",
       status: null
     });
     var search_label = $("#site-search-label"),
     search_suggest = $("#site-search-box .fbs-pane");

     search
       .bind("fb-select", function(e, data) {
         window.location = root + "/view" + data.id;
         return false;
       })
       .bind("fb-pane-show", function(e, data) {
         search_label.html("<span>Select an item from the list</span>").removeClass("loading");
       })
       .bind("fb-textchange", function (e, data) {
         if ($.trim(search.val()) === "") {
           search_label.html("<span>Start typing to get some suggestions</span>").removeClass("loading");
         }
         else {
           search_label.html("<span>Searching...</span>").addClass("loading");
         }
       })
       .bind("fb-error", function() {
         search_label.html("<span>Sorry, something went wrong. Please try again later</span>").removeClass("loading");
       })
       .focus(function(e) {
         if (!search_label.is(":visible")) {
           $('#site-search-label').slideDown("fast");
         }
       })
       .blur(function(e) {
         if (!search_suggest.is(":visible") && search_label.is(":visible")) {
           $('#site-search-label').slideUp("fast");
         }
       });

     $('.SearchBox-form').submit(function(e){
       /* Do not allow form to be submitted without content */
       if ($.trim($("#global-search-input").val()).length == 0){
         return false;
       }
       else{
         return true;
       }
     });

   });
})(jQuery);

