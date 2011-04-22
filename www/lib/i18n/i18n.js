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

  var bundle;
  var isRTL = false;

  var FORMAT_LENGTHS = {
    "long":1, "short":1, "full":1, "medium":1
  };

  var r_y = /^\d{4}$/;
  var r_yM = /^\d{4}\-\d{2}$/;
  var r_L = /L/g;

  var i18n = window.i18n = {

    normalize_pattern: function(pattern) {
     /**
      * Dojo currently does not support 'L' to denote month.
      * Just replace with 'M' as a work around.
      *
      * http://bugs.dojotoolkit.org/ticket/12749
      * @see http://cldr.unicode.org/translation/date-time
      */
      return pattern.replace(r_L, "M");
    },

    ize: function(context) {
      i18n.ize_datetime(context);
      i18n.ize_number(context);
    },

    /**
     * localize datetime value i.e., <time datetime="1853-03-30"> ==> 1853年3月30日 (zh)
     */
    ize_datetime: function(context) {
      var times = $("time", context)
        .each(function() {
          var $this = $(this);
          var isostr = $this.attr("datetime");
          if (isostr) {
            var format = $this.attr("data-format");
            var str = i18n.datetime(isostr, format);
            $this.text(str);
          }
        });

      if (isRTL) {
        times.attr("dir", "rtl");
      }

      times.css("visibility", "visible");
    },

    ize_datetime_input: function(input) {
      var $input = $(input);
      var val = $input.val();
      if (val !== "") {
        var str = i18n.datetime(val);
        $input.val(str);
      }
      if (isRTL) {
        $input.attr("dir", "rtl");
      }
    },

    datetime: function(isostr, format) {
      var d = dojo.date.stamp.fromISOString(isostr);
      var o = {
        selector: "date"
      };
      if (format) {
        if (FORMAT_LENGTHS[format]) {
          o.formatLength = format;
        }
        else {
          o.datePattern = bundle["dateFormatItem-" + format];
        }
      }
      else if (r_y.test(isostr)) {
        o.datePattern = bundle["dateFormatItem-y"];
      }
      else if (r_yM.test(isostr)) {
        o.datePattern = bundle["dateFormatItem-yMMM"];
      }
      else {
        o.datePattern = bundle["dateFormat-long"];
      }
      if (o.datePattern) {
        o.datePattern = i18n.normalize_pattern(o.datePattern);
      }
      return dojo.date.locale.format(d, o);
    },

    /**
     * localize number value i.e., <span class="number" data-value="0.8"> ==> 0,8 (fr)
     */
    ize_number: function(context) {
      var numbers = $(".number", context)
        .each(function() {
          var $this = $(this);
          var v = $this.attr("data-value");
          if (v != null) {
            var str = i18n.number(v);
            $this.text(str);
          }
        });

      if (isRTL) {
        numbers.attr("dir", "rtl");
      }
      numbers.css("visibility", "visible");
    },

    ize_number_input: function(input) {
      var $input = $(input);
      var val = $input.val();
      if (val !== "") {
        var str = i18n.number(val);
        $input.val(str);
      }
      if (isRTL) {
        $input.attr("dir", "rtl");
      }
    },

    number: function(n) {
      return dojo.number.format(n);
    }
  };

  dojo.ready(function() {
    if (dojo.locale === "ar" || dojo.locale === "he") {
      isRTL = true;
    }
    bundle = dojo.date.locale._getGregorianBundle();
    i18n.ize();
  });

})(jQuery, dojo,  window.freebase);
