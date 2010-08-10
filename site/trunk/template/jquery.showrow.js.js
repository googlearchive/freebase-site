(function ($) {

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
      var td = $("> td", row).wrapInner('<div class="wrapInner" style="display: block;">');
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
      var td = $("> td", row).wrapInner('<div class="wrapInner" style="display: block;">');
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
