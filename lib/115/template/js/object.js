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

  $(function() {

    // Initialize all nicemenus
    $(".nicemenu").nicemenu();

    // Decide whether gear menu is empty and show message if it is.
    // Need to do this client-side because it's permission-dependent.
    $(window).bind("fb.permission.has_permission", function(e, has_permission) {
      var selector = ".nav-utilities > li > .submenu > li:not(.no-settings)";
      if (!has_permission) {
        selector += ":not(.edit)";
      }
      if (!$(selector).length) {
        $("li.no-settings").show();
      }
   });

    // DAE: Can we do this in CSS?
    $("#description").css('height', 'auto');

    /**
     * The layout requires that we set an explicity margin on the object title
     * that is equal to the width of the object timestamp to prevent the two
     * from bumping into each other. Because this value changes, we have to
     * set it via javascript.
     */
    var $obj_timestamp = $("#page-header .creation-timestamp");
    var offset = $obj_timestamp.width();
    $("#page-header h1").css("margin-right", offset);

    var less_blurb = $('#less-blurb');
    if (less_blurb.length) {
      less_blurb.click(minimize_blurb);
      $('#more-blurb').click(maximize_blurb);
      //$(window).bind('scroll resize', update_blurb);
    }

    fb.init_search();
  });

  /**
   * This is the onclick handler for all nav "get_script" actions.
   * @param nav:HTMLElement (required) - The anchor element where nav.href 
   *     is the javascript that will be dynamically loaded with $.getScript.
   * @param method:String (optional) - This is the namespaced function 
   *     that will be invoked with args. E.g., "foo.bar" will mapped to the 
   *     function specified by window.freebase["foo"]["bar"].
   * @param args:Array (optional) - This is the arguments to the method.
   */
  fb.nav_get_script = function(nav, method, args) {
      $.ajax({
          url: nav.href,
          dataType: "script",
          beforeSend: function() {
              fb.status.doing("Loading...");
          },
          success: function() {
              fb.status.clear();
              if (method) {
                  var namespaces = method.split(".");
                  if (namespaces.length) {
                      var m = fb;            
                      namespaces.every(function(ns) {
                          if (m[ns]) {
                              m = m[ns];
                              return true;
                          }
                          else {
                              m = null;
                              return false;
                          }
                      });
                      if ($.isFunction(m) && $.isArray(args)) {
                          m.apply(null, args);
                      }
                  }
              }
          },
          error: function() {
              fb.status.error("Error retrieving script");
          }
    });
    return false;
  };


  fb.init_search = function() {
      // Global shortcut for focusing/blurring freebase suggest module in header
      var FOCUS_KEY = 191; // '/'
      var BLUR_KEY = 27;    // 'esc'
      var $fb_suggest = $("#header #fb-search-input");

      fb.keyboard_shortcut.add('/', function() {
        $fb_suggest.focus();
      });

      $fb_suggest.keydown(function(e) {
        if (e.keyCode === BLUR_KEY) {
          $fb_suggest.blur();
        }
      });
  };


  var min_blurb = null;
  var max_blurb = null;
  $(function() {
    min_blurb = $('#min-blurb');
    max_blurb = $('#max-blurb');
  });

  function minimize_blurb(e) {
    if (!min_blurb.is(':visible')) {
      max_blurb.hide();
      min_blurb.show();
    }
    // If explicitly clicked, don't auto-resize.
    if (e) {
      $(window).unbind('scroll resize', update_blurb);
    }
    return false;
  }

  function maximize_blurb(e) {
    if (!max_blurb.is(':visible')) {
      min_blurb.hide();
      max_blurb.show();
    }
    // If explicitly clicked, don't auto-resize.
    if (e) {
      $(window).unbind('scroll resize', update_blurb);
    }
    return false;
  }

  function update_blurb() {
    if ($(document.body).scrollTop() < 40) {
      maximize_blurb();
    }
    else {
      minimize_blurb();
    }
  }

})(jQuery, window.freebase);
