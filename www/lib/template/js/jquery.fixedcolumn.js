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
;(function ($) {

  /**
   * A simple utility to fix the width of all or specific column(s)
   * of a <table>.
   * You should use this with a proper TABLE structure with a THEAD.
   * It will find the first row (TR) of the table, preferably in the THEAD
   * section and calculate and set the width of the column(s) specified
   * in options.
   * Please make sure your table cell content within TD or TH,
   * is wrapped by an inline-block element, since we cannot set the width of
   * TD or TH elements. For example:
   *
   * <table>
   *   <thead>
   *     <tr>
   *       <th>
   *         <span class="wrapper" style="display:inline-block">
   *         ...
   *         </span>
   *       </th>
   *       ...
   *
   * USAGE:
   *   $("#mytable").fixedcolumn();           // fix width for 1st column
   *   $("#mytable").fixedcolumn({all:true}); // fix width for all columns
   */
  $.fn.fixedcolumn = function(options) {
    var o = $.extend(true, {}, options);

    return this.each(function() {
      var children = $(this).find("tr:first").children();
      if (children.length > 1) {
        // We only want to set the width of columns
        // the table has more than one column.
        if (!o.all) {
          children = $(children.get(0));
        }
        children.each(function() {
          var child = $(this);
          var name = child[0].nodeName.toUpperCase();
          if (name === "TD" || name === "TH") {
            var w = child.width();
            if (w > 0) {
              $(":first-child", child).width(w).css("display","inline-block");
            }
          }
        });
      }
    });
  };

})(jQuery);
