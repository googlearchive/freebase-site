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

$(function() {
  
  // Setup app search tabset
  var $apps_explorer_search_tabset = $("#apps-search > .section-tabset").tabs("#apps-search > .search-box");

  var $user_form = $("#user-search-input").closest("form");

  $user_form.submit(function(){
      return false;
  });
  
  
  $("#user-search-input")
    .suggest({type: '/type/user'})
    .bind("fb-select", function(e, data) {
      var url = bp + data.id;
      location.href = url;
    })
    .focus(function() {
        this.select();
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
