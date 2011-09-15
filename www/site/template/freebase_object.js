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

(function($, fb) {

  $(function() {

    // Initialize all nicemenus
    $(".nicemenu").nicemenu();

    // Truncate object blurb
    var $obj_desc = $("#description");
    var $obj_blurb = $(".blurb", $obj_blurb);

    /**
     * TODO: this truncator does not handle internationalization
     * the 'string' and 'title' both need this
     */
    $obj_blurb.cmtextconstrain({
      restrict: {
        type: 'words',
        limit: 30
      },
      showControl: {
        string: '[ + ]',
        title: 'Show more'
      },
      hideControl: {
        string: '[ - ]',
        title: 'Show less'
      },
      trailingString: '...'
    });

    /**
     * When the browser supports both javascript and css opacity
     * we fade the object description in to prevent the page from
     * shifting before the truncation function has run
     */
    $obj_desc.animate({opacity: 1}).css('height', 'auto');


    /**
     * The layout requires that we set an explicity margin on the object title
     * that is equal to the width of the object timestamp to prevent the two
     * from bumping into each other. Because this value changes, we have to
     * set it via javascript.
     *
     * Additionally, for localization, we format the object creation
     * timestamp on the client-side, this causes the original timestamp
     * value to jump after it's been formatted. Thus, we do some basic
     * animation to smooth that transition out.
     */

    var $obj_timestamp = $("#page-header .creation-timestamp");
    var $published = $(".published", $obj_timestamp).css({opacity:0});
    var offset = $obj_timestamp.width();
    $published.animate({opacity: 1}, function() {
      $obj_timestamp.animate({opacity: 1});
    });
    $("#page-header h1").css("margin-right", offset);

    /*
     * Initialize page scroll behavior for fixed positioning on scroll
     */

    fb.init_page_scroll();
    fb.search_focus();

  });

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


  fb.init_page_scroll = function() {

    // Get a reference to the window object
    var $view = $(window);

    // page-header is the element which we toggle
    // from being static/fixed depending on scroll position
    var $masthead = $("#page-header");
    var $header = $("#header");
    var $content = $("#content");
    var header_height = $header.outerHeight();
    var masthead_height = $masthead.outerHeight();


    // Bind to the window scroll and resize events.
    // Remember, resizing can also change the scroll
    // of the page.
    $view.bind(
      "scroll resize",
      function(){

        // Get the current scroll of the window.
        var scroll_offset = $view.scrollTop();

        // if the scroll_offset is >= to header_height
        // then we know that the site header is offscreen
        // and we should set the masthead to fixed positioning
        if (scroll_offset >= header_height) {
          $masthead.addClass("sticky");
          $content.css({
            'padding-top': masthead_height + 'px'
          });
        }
        // reset positioning otherwise
        else {
          $masthead.removeClass("sticky");
          $content.css({
            'padding-top': '0'
          });
        }
      }
    );

  };

  // Global shortcut for focusing/blurring freebase suggest module in header
  fb.search_focus = function() {
   
   var FOCUS_KEY = 191; // '/'
   var BLUR_KEY = 27    // 'esc' 

   $(document).keydown(function(e) {
     $fb_suggest = $("#header #fb-search-input");

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
   })  
  }

})(jQuery, window.freebase);
