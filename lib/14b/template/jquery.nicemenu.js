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
*/

;(function($) {
  var nicemenu = $.factory("nicemenu", {
    init: function() {
      $(".headmenu .default-action", this.element).click(function(e) {
        hide_menus();
        $(this).parents(".headmenu").next(".submenu").find("a:first").click();
        return false;
      });
      $(".headmenu", this.element).click(function(e) {
        var headmenu = $(this);
        var pos = headmenu.position();
        var height = headmenu.height();
        var submenu = headmenu.next(".submenu").css({
          top: pos.top + height,
          left: pos.left
        });
        if (submenu.is(":visible")) {
          hide_menus(submenu);
        }
        else {
          hide_menus();
          submenu.fadeIn(function() {
            headmenu.addClass("expanded");
          });
        }
        return false;
      });
      $(".submenu", this.element).click(function(e) {
        hide_menus($(this));
        $(this).fadeOut(function() {
          $(this).prev(".headmenu").removeClass("expanded");
        });
        //return false;
      });
    }
  });

  function hide_menus(menus) {
    (menus || $(".submenu:visible")).fadeOut(function() {
      $(this).prev(".headmenu").removeClass("expanded");
    });
  };

  $(document).click(function() {
    hide_menus();
  });
})(jQuery);
