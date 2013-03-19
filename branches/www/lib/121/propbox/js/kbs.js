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

  var viewport = (function() {
    if (typeof window.innerWidth != 'undefined') {
     return function() {
        return {
          w: window.innerWidth,
          h: window.innerHeight
        };
      };
    }
    else if (typeof document.documentElement != 'undefined' &&
             typeof document.documentElement.clientWidth != 'undefined' &&
             document.documentElement.clientWidth != 0)
    {
      return function() {
        return {
          w: document.documentElement.clientWidth,
          h: document.documentElement.clientHeight
        };
      };
    }
    else {
      return function() {
        return {
          w: document.getElementsByTagName('body')[0].clientWidth,
          h: document.getElementsByTagName('body')[0].clientHeight
        };
      };
    };
  })();

  function kbs(context) {

    // wipe current .kbs.current
    $(".kbs.current", context).removeClass("current");

    var first_domain = $(".domain-section:first", context);
    var last_domain = $(".domain-section:last", context);

    //$(".kbs:first", first_domain).addClass("current");

    var scroll_to = this.scroll_to = function(item) {
      var scrollTop = $(document).scrollTop();
      var scrollBottom = $(document).height();
      var viewHeight = viewport().h;
      var viewBottom = scrollTop + viewHeight;
      var offsetTop = item.offset().top;
      var offsetBottom = offsetTop + item.height();

      if (offsetTop < scrollTop) {
        $(document).scrollTop(offsetTop);
      }
      else if (offsetBottom > viewBottom) {
        $(document).scrollTop(scrollTop + (offsetBottom - viewBottom));
      }
    };

    var get_current = this.get_current = function() {
      return $(".kbs.current:first", context);
    };

    var set_next = this.set_next = function(current, next, dont_scroll) {
      current = current || get_current();
      if (next.length) {
        current.removeClass("current");
        next.addClass("current");
        if (!dont_scroll) {
          scroll_to(next);
        }
      }
    };

    var next_domain = this.next_domain = function(dont_scroll) {
      var current = get_current();
      var next = _next_domain(current);
      if (next) {
        next = next.find(".kbs:first");
        set_next(current, next, dont_scroll);
      }
    };

    var _next_domain = this._next_domain = function(current) {
      if (! (current && current.length)) {
        return $(".domain-section:first", context);
      }
      var current_domain = current.closest(".domain-section");
      if (!current_domain.length || current_domain[0] === last_domain[0]) {
        return first_domain;
      }
      else {
        return current_domain.next(".domain-section");
      }
    };

    var prev_domain = this.prev_domain = function() {
      var current = get_current();
      var prev = _prev_domain(current);
      if (prev) {
        prev = prev.find(".kbs:first");
        set_next(current, prev);
      }
    };

    var _prev_domain = this._prev_domain = function(current) {
      if (! (current && current.length)) {
        return $(".domain-section:last", context);
      }
      var current_domain = current.closest(".domain-section");
      if (current.closest(".property-section").length ||
          current.closest(".type-section").length) {
        return current_domain;
      }
      if (!current_domain.length || current_domain[0] === first_domain[0]) {
        return last_domain;
      }
      else {
        return current_domain.prev(".domain-section");
      }
    };

    var next_type = this.next_type = function() {
      var current = get_current();
      var next = _next_type(current);
      if (next) {
        next = next.find(".kbs:first");
        set_next(current, next);
      }
    };

    var _next_type = this._next_type = function(current) {
      if (! (current && current.length)) {
        return $(".type-section:first", context);
      }
      var current_domain = current.closest(".domain-section");
      var current_type = current.closest(".type-section");
      var next;
      if (current_type.length) {
        next = current_type.next(".type-section");
      }
      else {
        next = current_domain.find(".type-section:first");
      }
      if (!(next && next.length)) {
        var next_domain = _next_domain(current_domain);
        if (next_domain) {
          while (next_domain.get(0) !== current_domain.get(0)) {
            next = next_domain.find(".type-section:first");
            if (next.length) {
              break;
            }
            next_domain = _next_domain(next_domain);
          }
        }
      }
      return next;
    };

    var prev_type = this.prev_type = function() {
      var current = get_current();
      var prev = _prev_type(current);
      if (prev) {
        prev = prev.find(".kbs:first");
        set_next(current, prev);
      }
    };

    var _prev_type = this._prev_type = function(current) {
      if (! (current && current.length)) {
        return $(".type-section:last", context);
      }
      var current_domain = current.closest(".domain-section");
      var current_type = current.closest(".type-section");
      var current_prop = current.closest(".property-section");
      if (current_prop.length) {
        return current_type;
      }
      var prev;
      if (current_type.length) {
        prev = current_type.prev(".type-section");
      }
      if (!(prev && prev.length)) {
        var prev_domain = _prev_domain(current_domain);
        if (prev_domain) {
          while (prev_domain.get(0) !== current_domain.get(0)) {
            prev = prev_domain.find(".type-section:last");
            if (prev.length) {
              break;
            }
            prev_domain = _prev_domain(prev_domain);
          }
        }
      }
      return prev;
    };

    var next_prop = this.next_prop = function() {
      var current = get_current();
      var next = _next_prop(current);
      if (next) {
        next = next.find(".kbs:first");
        set_next(current, next);
      }
    };

    var _next_prop = this._next_prop = function(current) {
      if (! (current && current.length)) {
        return $(".property-section:first", context);
      }
      var current_domain = current.closest(".domain-section");
      var current_type = current.closest(".type-section");
      var current_prop = current.closest(".property-section");
      var next;
      if (current_prop.length) {
        next = current_prop.next(".property-section");
      }
      else if (current_type.length) {
        next = current_type.find(".property-section:first");
      }
      else {
        next = current_domain.find(".property-section:first");
      }
      if (!(next && next.length)) {
        var next_type = _next_type(current);
        if (next_type) {
          while (next_type.get(0) !== current_type.get(0)) {
            next = next_type.find(".property-section:first");
            if (next.length) {
              break;
            }
            if (current_type.get(0) == null) {
              current_type = next_type;
            }
            next_type = _next_type(next_type);
          }
        }
      }
      return next;
    };

    var prev_prop = this.prev_prop = function() {
      var current = get_current();
      var prev = _prev_prop(current);
      if (prev) {
        prev = prev.find(".kbs:first");
        set_next(current, prev);
      }
    };

    var _prev_prop = this._prev_prop = function(current) {
      if (! (current && current.length)) {
        return $(".property-section:last", context);
      }
      var current_domain = current.closest(".domain-section");
      var current_type = current.closest(".type-section");
      var current_prop = current.closest(".property-section");
      var current_list = current.closest(".data-section");
      if (current_list.length) {
        return current_prop;
      }
      var prev;
      if (current_prop.length) {
        prev = current_prop.prev(".property-section");
      }
      if (!(prev && prev.length)) {
        if (current_type.length) {
          prev_type = _prev_type(current_type);
        }
        else {
          prev_type = _prev_type(current_domain);
        }
        if (prev_type) {
          while(prev_type.get(0) !== current_type.get(0)) {
            prev = prev_type.find(".property-section:last");
            if (prev.length) {
              break;
            }
            if (current_type.get(0) == null) {
              current_type = prev_type;
            }
            prev_type = _prev_type(prev_type);
          }
        }
      }
      return prev;
    };

    this.next = function() {
      var current = get_current();
      if (current && current.length) {
        var next = this._next(current);
        if (next) {
          set_next(current, next);
          return;
        }
      }
      // Set current to the first visible "kbs" class.
      current = $(".kbs:visible:first", context);
      set_next(current, current);
    };

    this._next = function(current) {
      if (! (current && current.length)) {
        return $(".domain-section:first .kbs:first", context);
      }
      var current_domain = current.closest(".domain-section");
      var current_type = current.closest(".type-section");
      var current_prop = current.closest(".property-section");
      var current_list = current.closest(".data-section");
      var next;
      if (current_list.length) {
        next = current.next(".kbs");
        if (next.length) {
          return next;
        }
        next = current_prop.next(".property-section").find(".kbs:first");
        if (next.length) {
          return next;
        }
        next = current_type.next(".type-section").find(".kbs:first");
        if (next.length) {
          return next;
        }
        if (current_domain.get(0) === last_domain.get(0)) {
          return first_domain.find(".kbs:first");
        }
        else {
          return current_domain.next(".domain-section").find(".kbs:first");
        }
      }
      else if (current_prop.length) {
        next = current_prop.find(".data-section:first .kbs:first");
        if (next.length) {
          return next;
        }
        next = current_prop.next(".property-section").find(".kbs:first");
        if (next.length) {
          return next;
        }
        next = current_type.next(".type-section").find(".kbs:first");
        if (next.length) {
          return next;
        }
        if (current_domain.get(0) === last_domain.get(0)) {
          return first_domain.find(".kbs:first");
        }
        else {
          return current_domain.next(".domain-section").find(".kbs:first");
        }
      }
      else if (current_type.length) {
        next = current_type.find(".property-section:first .kbs:first");
        if (next.length) {
          return next;
        }
        next = current_type.next(".type-section").find(".kbs:first");
        if (next.length) {
          return next;
        }
        if (current_domain.get(0) === last_domain.get(0)) {
          return first_domain.find(".kbs:first");
        }
        else {
          return current_domain.next(".domain-section").find(".kbs:first");
        }
      }
      else {
        next = current_domain.find(".type-section:first .kbs:first");
        if (next.length) {
          return next;
        }
        if (current_domain.get(0) === last_domain.get(0)) {
          return first_domain.find(".kbs:first");
        }
        else {
          return current_domain.next(".domain-section").find(".kbs:first");
        }
      }
    };

    this.prev = function() {
      var current = get_current();
      var prev = this._prev(current);
      if (prev) {
        set_next(current, prev);
      }
    };

    this._prev = function(current) {
      var prev;
      if (! (current && current.length)) {
        prev = $(".data-section:last .kbs:last", context);
        if (!prev.length) {
          prev = $(".property-section:last .kbs:first", context);
        }
        if (!prev.length) {
          prev = $(".type-section:last .kbs:first", context);
        }
        if (!prev.length) {
          prev = $(".domain-section:last .kbs:first", context);
        }
        return prev;
      }
      var current_domain = current.closest(".domain-section");
      var current_type = current.closest(".type-section");
      var current_prop = current.closest(".property-section");
      var current_list = current.closest(".data-section");
      if (current_list.length) {
        prev = current.prev(".kbs");
        if (prev.length) {
          return prev;
        }
        return current_prop.find(".kbs:first");
      }
      else if (current_prop.length) {
        prev = current_prop.prev(".property-section").find(".kbs:last");
        if (prev.length) {
          return prev;
        }
        return current_type.find(".kbs:first");
      }
      else if (current_type.length) {
        prev = current_type.prev(".type-section").find(".kbs:last");
        if (prev.length) {
          return prev;
        }
        return current_domain.find(".kbs:first");
      }
      else {
        if (current_domain.get(0) === first_domain.get(0)) {
          return last_domain.find(".kbs:last");
        }
        else {
          return current_domain.prev(".domain-section").find(".kbs:last");
        }
      }
    };

    var edit = this.edit = function() {
      this.get_current().trigger("edit");
    };

    var self = this;
    $(document)
      .unbind(".kbs")
      .bind("keydown.kbs", function(e) {
        var target = e.target;
        if (target == document.body ||
            target == document ||
            target == window ||
            target == $("html")[0]) {
          var keyCode = e.keyCode;
          //console.log(keyCode);
          if (keyCode === 68) { // d
            if (e.shiftKey) {
              prev_domain();
            }
            else {
              next_domain();
            }
          }
          else if (keyCode === 84) { // t
            if (e.shiftKey) {
              prev_type();
            }
            else {
              next_type();
            }
          }
          else if (keyCode === 80) { // p
            if (e.shiftKey) {
              prev_prop();
            }
            else {
              next_prop();
            }
          }
          else if (keyCode === 74) { // j
            self.next();
          }
          else if (keyCode === 75) { // k
            self.prev();
          }
          else if (keyCode === 69) { // e
            self.edit();
          }
        }
      });
  };

  window.kbs = kbs;

})(jQuery);
