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

  $.fn.validate_input = function (options) {
    return this.each(function() {
      var $this = $(this);
      if (!$this.is(":text")) {
        return;
      }
      var inst = $this.data("$.validate_input");
      if (inst) {
        inst._destroy();
      }
      inst = new vi(this, options);
      $this.data("$.validate_input", inst);
    });
  };
  var vi = $.validate_input = function(input, options) {
    this.options = $.extend(true, {}, vi.defaults, options);
    if (typeof this.options.validator !== "function") {
      throw ("A validator is required");
    }
    this.input = $(input);
    this.original_value = this.input.val(); // original value
    this.init();
    var self = this;
    this.input.bind("remove", function() {
      self._destroy();
    });
    return this;
  };
  vi.prototype = {
    init: function() {
      var self = this;
      this.input
        .bind("keyup.validate_input", function(e) {
          self.textchange(e);
        })
        .bind($.browser.msie ? "paste.validate_input" : "input.validate_input", function(e) {
          self.textchange(e);
        });
    },
    _destroy: function() {
      this.input.unbind(".validate_input");
    },
    original: function(val) {
      // trigger an original event signifying the value is exactly the same as when
      // this input was initialized with $.fn.validate_input
      this.input.trigger("original");
    },
    valid: function(data) {
      this.input.trigger("valid", data);
    },
    invalid: function(val, msg) {
      this.input.trigger("invalid", msg);
    },
    textchange: function(e) {
      clearTimeout(this.textchange_timeout);
      var self = this;
      this.textchange_timeout = setTimeout(function() {
        self.textchange_delay();
      }, 200);
    },
    textchange_delay: function() {
      var val = this.input.val();
      if (this.original_value === val) {
        return this.original(val);
      }
      val = $.trim(val);
      var o = this.options;
      try {
        var data = o.validator(val, o);
        return this.valid(data);
      }
      catch(ex) {
        return this.invalid(val, "" + ex);
      }
    }
  };
  $.extend(vi, {
    defaults: {
      validator: function(v, options) {
        // default validator just echo value
        return {text:v, value:v};
      }
    },
    log: function() {
      //console.log.apply(null, arguments);
    }
  });

})(jQuery);
