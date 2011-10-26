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
;(function ($) {

  /**
   * jQuery animation (slideUp/Down, fadeIn/Out) does not work on table rows
   * because the animations set "display:block" which break table layout (especially firefox)
   *
   * showRow and hideRow is a workaround by wrapping the contents of each table cell (td)
   * and animating the wrappers, which almost achieves the same effect.
   */

  /**
   * show row animation
   *
   * @param callback - callback once animation is finished
   * @param animation - "slideDown" or "fadeIn", default is "slideDown"
   * @param speed - speed of animation, "slow", "fast", or milliseconds
   */
  $.fn.showRow = function(callback, animation, speed) {
    animation = animation === "fadeIn" ? "fadeIn" : "slideDown";
    var thisArg = this;
    return this.each(function() {
      var row = $(this).hide();
      var td = $("> td, > th", row).wrapInner('<div class="wrapInner" style="display: block;">');
      var wrapInner = $(".wrapInner", td).hide();
      row.show();
      wrapInner[animation](speed, function() {
        $(this).each(function() {
          $(this).replaceWith($(this).contents());
        });
        if (callback) {
          callback.call(thisArg);
        }
      });
    });
  };

  /**
   * hide row animation
   *
   * @param callback - callback once animation is finished
   * @param animation - "slideDown" or "fadeIn", default is "slideDown"
   * @param speed - speed of animation, "slow", "fast", or milliseconds
   */
  $.fn.hideRow = function(callback, animation, speed) {
    animation = animation === "fadeOut" ? "fadeOut" : "slideUp";
    var thisArg = this;
    return this.each(function() {
      var row = $(this).show();
      var td = $("> td, > th", row).wrapInner('<div class="wrapInner" style="display: block;">');
      var wrapInner = $(".wrapInner", td);
      wrapInner[animation](speed, function() {
        $(this).each(function() {
          $(this).replaceWith($(this).contents());
        });
        row.hide();
        if (callback) {
          callback.call(thisArg);
        }
      });
    });
   };

})(jQuery);
