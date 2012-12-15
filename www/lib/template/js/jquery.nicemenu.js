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

/*
  Assuming the following html:

  <ul class="nicemenu">
    <li class="nicemenu-item">
      <a href="" class="headmenu">Trigger submenu</a>
      <ul class="submenu">
        <li>Foo</li>
        <li>Bar</li>
      </ul>
    </li>
  </ul>

  Turn this structure into a menu system

  $(".nicemenu").nicemenu();

  Note that ".submenu" will be append to document.body on a .headmenu trigger,
  so you should NOT depend on it's document hierarchy.

  Do this:

  $(submenu).data("headmenu")

  and NOT this:

  $(submenu).prev(".headmenu")
*/

;(function($) {

  function default_action_click_handler(e) {
    hide_menus();
    $(this).parents(".headmenu").data("submenu").find("a:first").click();
    return false;
  };

  function headmenu_click_handler(e, options) {
    var headmenu = $(this);
    var submenu = headmenu.data("submenu");
    if (!submenu.is(".submenu-valid")) {
      var pos = headmenu.offset();
      var height = headmenu.outerHeight();
      var top = pos.top + height;
      var left;
      if (submenu.is(".center")) {
        var width = headmenu.outerWidth();
        left = pos.left + width/2 - submenu.outerWidth()/2;
      }
      else if (submenu.is(".right")) {
        var width = headmenu.outerWidth();
        left = pos.left + width - submenu.outerWidth();
      }
      else {
        left = pos.left;
      }
      var css = {
        display: "none",
        position: "absolute",
        top: top,
        left: left
      };
      if (options.overlay) {
        css["zIndex"] = options.overlay.css("zIndex");
      }
      submenu.css(css);
      submenu.mouseover(function() {
        // For any :hover rules that make the menu show/hide,
        // we want to keep the headmenu visible while hovering over
        // the submenu.
        headmenu.parents(".data-row:first").mouseover();
      });

      $(document.body).append(submenu);
      submenu.addClass(".submenu-valid");
    }
    if (submenu.is(":visible")) {
      hide_menus(submenu);
    }
    else {
      hide_menus();
      submenu.fadeIn();
    }
    return false;
  };


  var nicemenu = $.factory("nicemenu", {
    init: function() {
      var options = this.options;
      $(".headmenu", this.element).each(function() {
        var headmenu = $(this);
        var submenu = headmenu.next(".submenu");
        headmenu.data("submenu", submenu);
        submenu.data("headmenu", headmenu);
        $(".default-action", headmenu).click(default_action_click_handler);
        headmenu.click(function(e) {
          return headmenu_click_handler.apply(this, [e, options]);
        });
      });

      $(".submenu", this.element).click(function(e) {
        hide_menus($(this));
        $(this).fadeOut();
        //return false;
      });
    }
  });

  function hide_menus(menus) {
    (menus || $(".submenu:visible")).fadeOut();
  };

  function invalidate_menus(menus) {
    (menus || $(".submenu-valid")).each(function() {
      $(this).removeClass("submenu-valid");
    });
  };

  $(document)
    .click(function() {
      hide_menus();
    })
    .bind("scroll resize", function() {
      hide_menus();
      invalidate_menus();
    });

})(jQuery);
