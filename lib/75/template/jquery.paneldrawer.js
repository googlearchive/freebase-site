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
;(function($) {

  $.factory("paneldrawer", {

    init: function() {
      var self = this;
      var o = this.options;
      var elt = this.element;

      this.headers = $("." + o.css_panel_header, elt);
      this.panel_content =  $(elt).find("." + o.css_panel_content);
      this.drawer_content = $(elt).find("." + o.css_drawer_content);
      this.drawer_toggle = $(elt).find("." + o.css_drawer_toggle);
      this.drawer_toggle.click(function(e) {
        return self.toggle();
      });
      
      elt.css("overflow", "hidden");
      this.drawer_height = this.options.drawer_height || this.drawer_content.outerHeight();
      this.headers_height = 0;
      $("." + o.css_panel_header, elt).each(function(i, header) {
        self.headers_height += $(header).outerHeight();
      });

      this.toggle_state = this.options.toggle_state;
      if (this.options.init_height) {
        this.set_height($(elt).innerHeight());
      }
    },
    
    set_height: function(height) {
      this.total_height = height;
      this.finish_toggle(this.toggle_state);
      this.panel_content.height(this.total_height - this.headers_height - (this.toggle_state ? this.drawer_height : 0));
    },
    
    finish_toggle: function(state) {
      this.toggle_state = state;
      if (state) {
        this.drawer_content.height(this.drawer_height);
        this.drawer_toggle.removeClass("up");
        this.drawer_toggle.addClass("down");
      } else {
        this.drawer_content.height(0);
        this.drawer_toggle.removeClass("down");
        this.drawer_toggle.addClass("up");
      }
      if (!this.options.init_height)
        this.element.css("height", "initial");
      if (this.options.toggle_callback) 
        this.options.toggle_callback.call(this.drawer_toggle, this.toggle_state);
    },

    toggle: function(e) {
      var self = this;

      var panel_height = this.panel_content.height();
      this.element.height(this.total_height);
      
      if (!this.toggle_state) {
        // expand
        if (this.options.animate) {
          this.panel_content.animate({height: "-=" + this.drawer_height}, function() {
            self.finish_toggle(!self.toggle_state);
          });
        } else {
          this.panel_content.height(panel_height - this.drawer_height);
          this.finish_toggle(!this.toggle_state);
        }
      }
      else {
        // collapse
        if (this.options.animate) {
          this.panel_content.animate({height: "+=" + this.drawer_height}, function() {
            self.finish_toggle(!self.toggle_state);
          });
        } else {
          this.panel_content.height(panel_height + this.drawer_height);
          this.finish_toggle(!this.toggle_state);
        }
      }

      return false;
    }
  });


  $.extend(true, $.paneldrawer, {
    defaults: {
      css_panel_header: "panel-header",
      css_panel_content: "panel-content",
      css_drawer_header: "drawer-header",
      css_drawer_content: "drawer-content",
      css_drawer_toggle: "toggle",
      animate: true,
      toggle_state: true,
      init_height: true
    }
  });

})(jQuery);
