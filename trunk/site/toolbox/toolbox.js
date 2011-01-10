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

/**
 * requires:
 *   jquery.position.js
 *   core.js
 */
(function($, fb) {
  var tb = fb.toolbox = {
    show: function(menu) {
      clearTimeout(menu.data("popup-timeout"));

      // if popup panel already exists, just show it
      var popup = menu.data("popup");
      if (popup) {
        popup.show();
        menu.removeClass("expand").addClass("collapse");
        $(".toolbox-textbox", popup).focus();
        return;
      }

      // dynamically create a new popup panel
      popup = $('<div class="popup popup-loading toolbox-popup" style="display:none;position:absolute;">');
      $(document.body).append(popup);
      menu.data("popup", popup);
      popup.hover(function() {
                    tb.show(menu);
                  },
                  function() {
                    tb.hide(menu);
                  });

      // get contents of popup
      $.ajax({
        url: menu.attr("data-popup-url"),
        dataType: "jsonp",
        jsonpCallback: "window.freebase.toolbox.jsonp",
        data: {
          id: fb.user.id,
          context: "#" + menu.attr("id")
        }
      });

      // show popup
      popup.position({
        of: menu,
        my: "left top",
        at: "left bottom"
      });

      popup.show();
      menu.removeClass("expand").addClass("collapse");
    },

    jsonp: function(data) {
      // TODO: handle error status code
      var result = data.result;
      var menu = $(result.context);
      if (!menu.length) return;
      var popup = menu.data("popup");
      if (!popup) return;
      popup.html(data.result.html);
      popup.removeClass("popup-loading");
      tb.init_search(popup);
      if (popup.is(":visible")) {
        $(".toolbox-textbox", popup).focus();
      }
    },

    hide: function(menu) {
      clearTimeout(menu.data("popup-timeout"));
      menu.data("popup-timeout", setTimeout(function() {
        tb.hide_delay(menu);
      }, 0));
    },

    hide_delay: function(menu) {
      var popup = menu.data("popup");
      if (popup) {
        popup.hide();
        menu.removeClass("collapse").addClass("expand");
      }
    },

    init_search: function(popup) {
      var input = $(".toolbox-search .toolbox-textbox", popup);
      input.keydown(tb.keydown);
    },

    keydown: function(e) {
      var input = $(this);
      var timeout = input.data("keydown.timeout");
      clearTimeout(timeout);
      input.data("keydown.timeout", setTimeout(function() {
        tb.keydown_delay(input);
      }, 200));
    },

    keydown_delay: function(input) {
      var list = input.data("list");
      if (list == null) {
        list = input.parents(".toolbox-search").siblings(".toolbox-content").find("li[data-name]");
        input.data("list", list);
      }
      var v = $.trim(input.val()).toLowerCase();
      if (v === "") {
        list.show();
      }
      else {
        list.each(function() {
                    var $this = $(this);
                    var name = $this.attr("data-name");
                    if (name && name.toLowerCase().indexOf(v) !== -1) {
                      $this.show();
                      return;
                    }
                    var id = $this.attr("data-id");
                    if (id && id.toLowerCase().indexOf(v) !== -1) {
                      $this.show();
                      return;
                    }
                    $this.hide();
                  });
      }
    }
  };

  // if fb.user, show expand for all toolboxes
  if (fb.user) {
    $(".nav-global-menu")
      .addClass("expand")
      .hover(function() {
               tb.show($(this));
             },
             function() {
               tb.hide($(this));
             });
  }
})(jQuery, window.freebase);

