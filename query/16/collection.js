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
;(function($, fb, propbox) {

  var collection = fb.collection = {
    
    init_infinitescroll: function() {
      var table = $("#infinitescroll");
      var next = table.attr("data-next");
      if (!next) {
        // nothing to scroll
        return;
      }
      var a_next = $("#infinitescroll-next");
      table.infinitescroll({
        nextSelector: "#infinitescroll-next",
        navSelector: "#infinitescroll-next",
        dataType: "json",
        pathParse: function() {
          return [
            a_next[0].href + "&" + $.param({cursor:table.attr("data-next")}) + "&page=",
            ""
          ];
        },
        appendCallback: false
      }, function(data) {
        data = JSON.parse(data);
        var next = data.result.cursor;
        var html = $(data.result.html);
        i18n.ize(html);
        table.append(html);
        if (next) {
          table.attr("data-next", next);
        }
        else {
          $(window).unbind('.infscr');
        }
      });
    },

    init: function() {
      collection.init_infinitescroll();
    }
  };

  $(collection.init);

})(jQuery, window.freebase, window.propbox);
