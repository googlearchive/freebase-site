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
;(function($, dojo) {

  dojo.require("dojo.date.stamp");
  dojo.require("dojo.date.locale");
  dojo.require("dojo.number");

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
    var o = this.options = $.extend(true, {}, vi.defaults, options);
    if (typeof o.validator !== "function") {
      throw ("A validator is required");
    }
    if (!o.lang) {
      o.lang = "/lang/en";
    }
    if (o.lang === "/lang/en") {
      o.lang = ["lang/en"];
    }
    else {
      o.lang = [o.lang, "/lang/en"];
    }
    // convert mql lang ids to locale strings understood by dojo (cldr)
    o.locales = [];
    $.each(o.lang, function(i, lang) {
      o.locales[i] = dojo.i18n.normalizeLocale(lang.split("/").pop());
    });
    this.input = $(input);
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
        })
        .bind("keypress.validate_input", function(e) {
          if (e.keyCode === 13) {
            self.validate(true);
          }
        })
        .bind("blur.validate_input", function(e) {
          self.validate(true);
        });
    },
    _destroy: function() {
      this.input.unbind(".validate_input");
    },
    valid: function(data) {
      this.input.trigger("valid", data);
    },
    invalid: function(val, msg) {
      this.input.trigger("invalid", msg);
    },
    empty: function() {
      this.input.trigger("empty");
    },
    textchange: function(e) {
      clearTimeout(this.textchange_timeout);
      var self = this;
      this.textchange_timeout = setTimeout(function() {
        self.validate();
      }, 200);
    },
    validate: function(force) {
      if (force) {
        clearTimeout(this.textchange_timeout);
      }
      var o = this.options;
      var val = $.trim(this.input.val());
      if (val === "") {
        return this.empty();
      }
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
    },

    invalid: function(val, options, type, msg) {
      throw new Error("Invalid " + type + (msg ? ": " + msg : ""));
    },

    text: function(val, options) {
      if (val.lengh > 4096) {
        return this.invalid(val, options, type, "Text too long");
      }
      return {text:val, value:val};
    },

    topic: function(val, options) {
      return vi.defaults.validator;
    },

    enumerated: function(val, options) {
      return vi.defaults.validator;
    },

    "boolean": function(val, options) {
      return vi.defaults.validator;
    },

    uri: function(val, options) {
      var regex = vi.uri.regex;
      if (!regex) {
        // from https://github.com/jzaefferer/jquery-validation/
        // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
        regex = vi.uri.regex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
      }
      if (regex.test(val)) {
        return {text:val, value:val};
      }
      return vi.invalid(val, options, "uri");
    },

    "int": function(val, options) {
      return vi.number.parse(val, options, false);
    },

    "float": function(val, options) {
      return vi.number.parse(val, options, true);
    },

    "number": function(val, options, decimal) {
     return vi.number.parse(val, options, decimal);
    },

    datetime: function(val, options) {
      return vi.datetime.parse(val, options);
    },

    mqlkey: function(val, options) {
      var regex = vi.mqlkey.regex;
      if (!regex) {
        regex = vi.mqlkey.regex = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
      }
      if (regex.test(val)) {
        return {text:val, value:val};
      }
      return vi.invalid(val, options, "mqlkey");
    }
  });

  $.extend(vi.number, {
    parse: function(val, options, decimal) {
      var locales = options && options.locales || ["en"];
      var i,l,j,k,n,m;
      var number;
      for (i=0,l=locales.length; i<l; i++) {
        var locale = locales[i];
        number = dojo.number.parse(val, {locale:locale});
        if (isNaN(number)) {
          continue;
        }
        var result = {};
        if (decimal) {
          result.value = number;
          result.text = dojo.number.format(number, {locale:locale});
        }
        else {
          result.value = dojo.number.round(number, 0);
          result.text = dojo.number.format(result.value, {locale:locale});
        }
        return result;
      }
      throw vi.invalid("number", val);
    }
  });

  $.extend(vi.datetime, {

    formats: [
      "yyyy"  , ["dateFormatItem-y"],
      "yyyy-MM" , ["dateFormatItem-yM", "dateFormatItem-yMMM"],
      "yyyy-MM-dd", ["dateFormat-short", "dateFormat-medium", "dateFormat-long"]
    ],

    parse: function(val, options) {
      if(!dojo.date.stamp._isoRegExp){
        /**
         * Fix dojo.date.stamp._isoRegExp to support negative years
         */
	dojo.date.stamp._isoRegExp = /^(?:(-?\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
      }

      // try iso date first
      var date = dojo.date.stamp.fromISOString(val);
      if (date) {
        return {text:val, value:val, date:date};
      }

      // try dojo.date.locale.parse
      var locales = options && options.locales || ["en"];
      var i,l,j,k,n,m;
      for (i=0,l=locales.length; i<l; i++) {
        var locale = locales[i];
        var bundle = dojo.date.locale._getGregorianBundle(locale);
        for (j=0,k=vi.datetime.formats.length; j<k; j+=2) {
          var ymd = vi.datetime.formats[j];
          var formats = vi.datetime.formats[j+1];
          for (n=0,m=formats.length; n<m; n++) {
            var format = formats[n];
            var datePattern = bundle[format];
            if (datePattern) {
              datePattern = i18n.normalize_pattern(datePattern);
              try {
                date = dojo.date.locale.parse(val, {datePattern:datePattern, selector:"date", locale:locale});
                return {text:val, value:dojo.date.locale.format(date, {datePattern:ymd, selector:"date"}), date:date};
              }
              catch (ex) {
                // ignore and continue
              }
            }
          }
        }
      }
      throw vi.invalid("datetime", val);
    }
  });


})(jQuery, dojo);
