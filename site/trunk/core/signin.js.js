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
