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
  fb.register = {};

  fb.register.display_form_errors = function($form, response) {
    $.each(response.messages, function(i, error) {
      var match = error.code.match(/^\/api\/status\/error\/invalid\/(.*)(\/.*)?/);
      if (match) {
        var fieldname = match[1];
        console.log($form, $form.find('input'));
        var $input = $form.find('input[name='+fieldname+']:first');
        console.log($input);
        if ($input.length) {
          $input.addClass('error');
          $input.siblings('.input-help:first').hide();
          var $input_error = $input.siblings('.input-error:first');
          if ($input_error.length) {
            $input_error.text(error.message);
            $input_error.show();
          }
        }
      }
    });
  };
  
  fb.register.init = function() {
    // Initialize the accordion.
    $('#register-accordion').tabs('#register-accordion div.pane', {
      tabs: 'h2',
      effect: 'slide',
      initialIndex: null
    });

    //Initialize the forms.
    $('form').each(function(i, form) {
      var $form = $(form);
      $form.ajaxForm({
        dataType: 'json',
        success: function(response, status, xhr) {
          $('#registration').html(response.result.html);
        },
        error: function(xhr, status, error) {
          var response = JSON.parse(xhr.responseText);
          fb.register.display_form_errors($form, response);
        }
      });
    });

    $('form input').change(function(e) {
      var $input = $(this);
      $input.removeClass('error');
      $input.siblings('.input-error:first').hide();
      $input.siblings('.input-help:first').show();
    });
  };
  
  setTimeout(fb.register.init, 0);
})(jQuery, window.freebase);
