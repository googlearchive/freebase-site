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


  /**
   * This plug-in takes a standard <input type=checkbox /> and converts it
   * into an animated on/off switch.
   *
   * Given the following markup pattern:
   * <input type='checkbox' class='mycheckbox' />
   *
   * The following javascript:
   *
   * $('.mycheckbox').radiotoggle();
   *
   * Outputs:
   *
   * <div class="switch">
   *   <span class="on">On</span>
   *   <span class="off">Off</span>
   *   <span class="slide"></span>
   * </div>
   *
   * The required CSS lives in lib/template/freebase.ui.radiotoggle.less
   *
   * TODO:
   *   1. Make animations harness CSS3 when possible
   *   2. Make animation values dynamic per/ initial height/width rather than fixed
   */

(function($) {

  //Attach new method to jQuery
  $.fn.extend({

    radiotoggle: function(options) {
    
      //Set up defaults
      var defaults = { 
        onLabel:      'On', 
        offLabel:     'Off' 
      };

      options = $.extend({}, defaults, options)

      //Iterate over the current set of matched elements
      return this.each(function() {

        // setup our objects
        var $input = $(this);
        var $markup = $('<div class="switch"><span class="on">' + options.onLabel + '</span><span class="off">' + options.offLabel + '</span><span class="slide"><span class="inner"></span></span></div>');
        var $slide = $(".slide", $markup);
        var $on = $(".on", $markup);
        var $off = $(".off", $markup);


        // we need to determine whether we are starting
        // with an checked or unchecked input box
        // and initialize accordingly
        if($input.is(":checked")) {
          $markup.addClass("on"); 
          var is_checked = true;
        }
        else {
          $markup.find(".off").css("display", "block");
          $markup.find(".on").hide();
          $slide.animate({left: 30}, 300);
        }

        // append the switch to the DOM and hide input
        $markup.insertAfter($input);
        $input.hide();


        $markup.click(function() {
          // uncheck box and animate off
          if(is_checked) {
            $slide.animate({ left: 30 }, 300, function() {
              $on.hide();
              $off.css({display: "block"});
              $input.attr("checked", false);
              $markup.removeClass("on");
            });
            is_checked = false;
            $input.removeAttr("checked");
          }
          // check box and animate on
          else {
            $slide.animate({ left: -3 }, 300, function() {
              $off.hide();
              $on.css({display: "block"});
              $input.attr("checked", true);
              $markup.addClass("on");
            });
            is_checked = true;
            $input.attr("checked", "checked");
          }
          
          $input.click();
        });
      });

    }
  });
})(jQuery);
