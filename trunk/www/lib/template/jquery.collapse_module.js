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
;(function($) {

  /**
   * Given:
   *
   * <div id="module-column">
   *   <div class="module">
   *     <div class="trigger">Expand/Collapse</div>
   *     <div class="module-section">...</div>
   *   </div>
   *   <div class="module">...</div>
   *   <div class="module">...</div>
   * </div>
   * <div id="main-column">...<//div>
   *
   * $(".module").collapse_module("#main-column");
   *
   * Will collapse/expand all ".modules" except the first module.
   * The first module's ".module-section" will be collapsed/expanded.
   * "#main-column"'s margin-left will be toggled with respect to the collapsing/expanding of the modules
   * The ".trigger" should be inside the first ".module".
   */
  $.fn.collapse_module = function(column) {
    var $column = $(column);
    var modules = $(this);
    var first_module = modules.get(0);
    var trigger = $(".trigger:first", first_module);
    var first_section = $(".module-section", first_module);
    var other_modules = modules.slice(1);
    var column_offset = $column.css("margin-left");

    console.log("column_offset", column_offset);

    trigger.click(function() {
      var collapsed = trigger.hasClass("collapsed");
      if (collapsed) {
        $column.animate({marginLeft: column_offset}, function() {
          first_section.slideDown(function() {
            trigger.removeClass("collapsed");
          });
          other_modules.fadeIn();
        });
      }
      else {
        other_modules.fadeOut();
        first_section.slideUp(function() {
          $column.animate({marginLeft: 0});
          trigger.addClass("collapsed");
        });
      }
      return false;
    });
  };

})(jQuery);
