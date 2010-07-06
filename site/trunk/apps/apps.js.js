$(function() {
  
  function set_search_mode(category) {
    $(".view-mode-option").removeClass("selected");
    $(".search-component").hide();
    if (category === "user") {
      $("#mode-user").addClass("selected");
      $("#user-search").show();
    } else {
      $("#mode-apps").addClass("selected");
      $("#app-search").show();
    }
  }
  
  if (typeof category !== 'undefined') set_search_mode(category);
  
  $(".view-mode-option")
    .click(function() {
      set_search_mode($(this).attr("id").replace("mode-",""));
      return false;
    });

  $("#user-suggest")
    .suggest({type: '/type/user'})
    .bind("fb-select", function(e, data) {
      location.href = bp + data.id;
    });
  
  $(".apps-filter")
    .change(function() {
      var classname = "." + $(this).attr("name");
      $(classname).toggle($(this).val());
    });
  
  $('#create-link')
    .click(function() {
      $.post(bp + "/post/submit/create_app", null, function(data){
        window.location = bp + '/admin' + data.result;
      }, "json");
      return false;
    });  

  $('#edit-props')
    .ajaxForm({
      dataType : 'json',
      success  : function(data) {
        if (data.code == "/api/status/ok") {
          window.location.href = bp + data.result.appid;
        } else {
          alert("Error updating listing");
        }
      }
    });

  $('#icon_form')
    .ajaxForm({
      dataType : 'json',        
      beforeSubmit : function(data, form, options){
        options.url += '?appid=' + app.id + '&name=' + $('#icon_file').val();
      },
      success  : function(o) {
        if (o.code === '/api/status/ok') {
          app.icon = o.result;
          $('#icon_name').text(o.result.name);
          $('#icon_delete').text("delete");
          $('#icon_file').val("");
        } else {
          if (o.messages && o.messages[0] && o.messages[0].message) {
            console.log(o);
            alert(o.messages[0].message);
          } else {
            alert("Error uploading");   
          }
        }
      }
    });

  $('#icon_file')
    .change(function(event){
      $('#icon_upload_error').text("");
      $('#icon_form').submit();
    });

  $('#icon_delete')
    .click(function(event){
      $.post(bp + "/post/submit/delete_icon", {appid : app.id, iconid: app.icon.id}, function(data){
        $('#icon_name').text("No icon");
        $('#icon_delete').text("");
      }, "json");
      return false;
    });

});
