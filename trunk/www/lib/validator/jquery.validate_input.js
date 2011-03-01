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
;(function($, fb) {

  /**
   * Required libs
   * date.js
   * isodate.js
   */

  $.fn.validate_input = function (options) {
    return this.each(function() {
      var $this = $(this);
      if (!$this.is(":text")) {
        return;
      }
      var inst = $this.data("validate_input");
      if (inst) {
        inst._destroy();
      }
      inst = new validate_input(this, options);
      $this.data("validate_input", inst);
    });
  };
  var validate_input = $.validate_input = function(input, options) {
    this.options = $.extend(true, {}, validate_input.defaults, options);
    if (typeof this.options.validator !== "function") {
      throw ("A validator is required");
    }
    this.input = $(input);
    this.original = this.input.val(); // original value
    this.value = null;                // validated value
    this.init();
    var self = this;
    this.input.bind("remove", function() {
      self._destroy();
    });
    return this;
  };
  validate_input.prototype = {
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
    valid: function(data) {
      this.input.trigger("valid", data);
    },
    invalid: function(val, msg) {
      this.value = null;
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
      var val = $.trim(this.input.val());
      var o = this.options;
      if (val === "") {
        if (o.allow_empty === true) {
          return this.valid({text:"", value:""});
        }
        else if (o.allow_empty === false) {
          return this.invalid("", "");
        }
      }
      try {
        var data = o.validator(val);
        return this.valid(data);
      }
      catch(ex) {
        return this.invalid(val, "" + ex);
      }
    }
  };
  $.extend(validate_input, {
    defaults: {
      allow_empty: null,
      validator: function(v) {
        // default validator just echo value
        return {text:v, value:v};
      }
    },

    datetime: function(val) {
      var date;
      // replace all non-date characters to "-"
      var datepart = val.replace(/[\s\.\,\/\x27]/g, "-");
      // 1. try Date.parseExact using datetime_formats
      datepart = datepart.replace(/\-+/g, "-");
      for (var i=0,l=datetime_formats.length; i<l; i+=3) {
        var input_format = datetime_formats[i];
        var text_format = datetime_formats[i+1];
        var value_format = datetime_formats[i+2];
        try {
          date = Date.parseExact(datepart, input_format);
          return {
            text: date.toString(Date.CultureInfo.formatPatterns[text_format]),
            value: date.toString(value_format)
          };
        }
        catch (ex) {
          // ignore and continue
        }
      };

      // try isodate
      date = fb.date_from_iso(val);
      if (date) {
        return {
          text: val,
          value: val
        };
      }

      throw "Unrecoginzed datetime: " + val;
    }

  });


  var datetime_formats = [
    "M-yyyy", "yearMonth", "yyyy-MM",
    "MM-yyyy", "yearMonth", "yyyy-MM",
    "yyyy-MM", "yearMonth", "yyyy-MM",
    "yyyy-M", "yearMonth", "yyyy-MM",

    "M-d-yyyy", "shortDate", "yyyy-MM-dd",
    "MM-dd-yyy", "shortDate", "yyyy-MM-dd",
    "MM-d-yyyy", "shortDate", "yyyy-MM-dd",
    "M-dd-yyyy", "shortDate", "yyyy-MM-dd",

    "yyyy-M-d", "shortDate", "yyyy-MM-dd",
    "yyyy-M-dd", "shortDate", "yyyy-MM-dd",
    "yyyy-MM-d", "shortDate", "yyyy-MM-dd",
    "yyyy-MM-dd", "shortDate", "yyyy-MM-dd",

    "d-MMM-yyyy", "shortDate", "yyyy-MM-dd",
    "dd-MMM-yyyy", "shortDate", "yyyy-MM-dd",
    "d-MMMMM-yyyy", "shortDate", "yyyy-MM-dd",
    "dd-MMMM-yyyy", "shortDate", "yyyy-MM-dd",

    "MMM-d-yyyy", "shortDate", "yyyy-MM-dd",
    "MMM-dd-yyyy", "shortDate", "yyyy-MM-dd",
    "MMMM-d-yyyy", "shortDate", "yyyy-MM-dd",
    "MMMM-dd-yyyy", "shortDate", "yyyy-MM-dd"
  ];


})(jQuery, window.freebase);
