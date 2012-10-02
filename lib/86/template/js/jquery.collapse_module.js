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
   * $(".module").collapse_module({column: "#main-column"});
   *
   * Will collapse/expand all ".modules" except the first module.
   * The first module's ".module-section" will be collapsed/expanded.
   * "#main-column"'s margin-left will be toggled with respect to the collapsing/expanding of the modules
   * The ".trigger" should be inside the first ".module".
   */

  $.factory("collapse_module", {

    init: function() {
      var self = this;
      var o = this.options;

      this.$column = $(this.options.column);
      this.modules = $(this.options.modules, this.element);
      this.first_module = this.modules.get(0);
      this.trigger = $(".trigger:first", this.first_module);
      this.first_section = $(".module-section", this.first_module);
      this.other_modules = this.modules.slice(1);
      this.column_offset = this.$column.css("margin-left");
      
      this.set_collapsed(this.options.collapsed);
      
      this.trigger.click(function(e) {
       return self.toggle(e);
      });
    },
    
    set_collapsed: function(collapse) {
      this.toggle_state = collapse;
      if (collapse) {
        this.trigger.addClass("collapsed");
        this.$column.css("margin-left", 0);
        this.first_section.hide();
        this.other_modules.hide();
      } else {
        this.trigger.removeClass("collapsed");
        this.$column.css("margin-left", this.column_offset);
        this.first_section.show();
        this.other_modules.show();
      }
    },
    
    toggle: function(e) {
      var self = this;
      if (this.toggle_state) {
        $.localstore("filters_collapsed", 0, false);
        this.trigger.removeClass("collapsed");
        this.$column.animate({marginLeft: this.column_offset}, function() {
          self.first_section.slideDown(function() {
            self.modules.removeClass("collapsed");
          });
          self.other_modules.fadeIn();
        });
      } else {
        $.localstore("filters_collapsed", 1, false);
        this.trigger.addClass("collapsed");
        this.other_modules.fadeOut();
        this.first_section.slideUp(function() {
          self.$column.animate({marginLeft: 0});
          self.modules.addClass("collapsed");
        });
      }

      this.toggle_state = !this.toggle_state;
      if (this.options.toggle_callback) 
        this.options.toggle_callback.call(this.trigger, this.toggle_state);
      
      return false;
    }
    
  });
  
  var collapsed = $("body").is(".embed") || $.localstore("filters_collapsed");
  $.extend(true, $.collapse_module, {
    defaults: {
      collapsed: (collapsed === null) ? false : !!collapsed,
      modules: ".module",
      column: "#main-column"
    }
  });

})(jQuery);
