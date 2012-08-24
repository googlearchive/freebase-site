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

    if (!$("body").is(".embed")) {
      // Initialize page scroll behavior for fixed positioning on scroll
      fb.init_page_scroll();
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


  /**
   * Turn masthead stickiness on/off dependent on viewport
   */
  fb.init_page_scroll = function() {

    // The mininum height at which stickiness should be triggered
    var MIN_VIEWPORT_HEIGHT = 1000;
    // Constant for tracking whether to show/hide navbar in sticky mode
    // Set to true to hide navbar but show masthead
    // Set to false to always show both
    var HIDE_NAVBAR = false;

    // Our page elements
    var $view     = $(window);
    var $masthead = $("#page-header");
    var $navbar   = $("#header");
    var $content  = $("#content");

    // Various page element heights and calculations
    var viewport_height = $view.height();
    var navbar_height   = $navbar.outerHeight();
    var masthead_height = $masthead.outerHeight();
    var total_height    = navbar_height + masthead_height;
    var comparison_height = 0;

    // If HIDE_NAVBAR = false, than change values to include
    // the height of the navbar. Otherwise, only the masthead
    // is considered for setting values
    if(HIDE_NAVBAR) {
      total_height = navbar_height;
      comparison_height = navbar_height;
    }

    // Bind to the window scroll and resize events. Remember, resizing can
    // also change the scroll of the page.
    $view.bind(
      "scroll resize",
      function(){

        // Need to check this immediately so that we can turn off
        // stickiness if the user has resized browser window with
        // stickiness turned on
        if(viewport_height < MIN_VIEWPORT_HEIGHT) {
          $masthead.removeClass("sticky");
          $content.css({
            'padding-top': '0'
          });
        }

        // Get the current scroll pos & height of the window.
        var scroll_offset = $view.scrollTop();
        viewport_height   = $view.height();

        // only trigger if viewport is greater than MIN_VIEWPORT_HEIGHT
        if (viewport_height > MIN_VIEWPORT_HEIGHT) {
          if (scroll_offset > comparison_height) {
            if(!HIDE_NAVBAR) {
              $navbar.addClass("sticky");
            }
            else {
              $masthead.css({
                'top': 0
              });
            }
            $masthead.addClass("sticky");
            $content.css({
              'padding-top': total_height + 'px'
            });
          }
          // reset positioning otherwise
          else {
            if(!HIDE_NAVBAR) {
              $navbar.removeClass("sticky");
            }
            $masthead.removeClass("sticky");
            $content.css({
              'padding-top': '0'
            });
          }
        }
      }
    );

  };


  fb.init_search = function() {
      // Global shortcut for focusing/blurring freebase suggest module in header
      var FOCUS_KEY = 191; // '/'
      var BLUR_KEY = 27;    // 'esc'
      var $fb_suggest = $("#header #fb-search-input");

      $(document).keydown(function(e) {

          // if module already has focus, look for 'esc' key and blur
          if ($fb_suggest.is(":focus")) {
              if(e.keyCode === BLUR_KEY) {
                  $fb_suggest.blur();
              }
          }
          else {
              // make sure we're not currently in an input box
              if ( this !== event.target && (/textarea|select/i.test( event.target.nodeName ) ||
                  event.target.type === "text") ) {
                      return;
                  }
                  //focus module
              else {
                  if(e.keyCode === FOCUS_KEY) {
                      $fb_suggest.focus();
                      return false;
                  }
              }
          }
      });
  };

})(jQuery, window.freebase);
