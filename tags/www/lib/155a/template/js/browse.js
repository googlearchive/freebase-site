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

    fb.init_search();

    init_count_loop();
  });

  /**
   * Do looping of topics count stats
   */
  function init_count_loop() {
    var $a = $("#page-header .topics-count").first();
    var $b = $("#page-header .topics-count").last();
    $b.hide();

    function toggle() {
        var toShow = null;
        var toHide = null;
        if ($a.is(":visible")) {
            toHide = $a;
            toShow = $b;
        }
         else {
            toHide = $b;
            toShow = $a;
        }

        toHide.fadeOut();
        toShow.fadeIn(function() {
          setTimeout(toggle, 6000);
        });
    }
    setTimeout(toggle, 6000);
  }

  /**
   * This is the onclick handler for all nav "ajax" actions.
   * Assumes nav.href is a javascript that will be invoked with $.getScript
   */
  fb.nav_ajax = function(nav) {
    $.getScript(nav.href, function() {
      fb.nav_ajax.begin(nav);
    });
    return false;
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
