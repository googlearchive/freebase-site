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
      var n = vi.parse_number(val, options);
      try {
        var intValue = parseInt(n, 10);
        if (isNaN(intValue)) {
          throw "isNaN";
        }
        return {text:(new Number(intValue)).toLocaleString(), value:intValue};
      }
      catch (ex) {
        // will throw
      }
      return vi.invalid(val, options, "int");
    },

    "float": function(val, options) {
      var n = vi.parse_number(val, options);
      try {
        var floatValue = parseFloat(n);
        if (isNaN(floatValue)) {
          throw "isNaN";
        }
        return {text:(new Number(floatValue)).toLocaleString(), value:floatValue};
      }
      catch (ex) {
        // will throw
      }
      return vi.invalid(val, options, "float");
    },

    parse_number: function(val, options) {
      var regex = vi.parse_number.regex;
      if (!regex) {
        regex = vi.parse_number.regex = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;
      }
      if (regex.test(val)) {
        return val.replace(/[^\-\d\.]/g, "");
      }
      return vi.invalid(val, options, "number");
    },

    datetime: function(val, options) {
      var date = vi.datetime.fromISOString(val);
      if (date) {
        return {text:val, value:val, date:date};
      }
      throw vi.invalid("datetime", val);
    }
  });


  /**
   * From dojo.date.stamp
   *
   * according to http://svn.dojotoolkit.org/src/trunk/LICENSE :
   *    Dojo is availble under *either* the terms of the modified BSD license *or* the
   *    Academic Free License version 2.1.
   */
  $.extend(vi.datetime, {

    // Methods to convert dates to or from a wire (string) format using well-known conventions

    fromISOString: function(/*String*/formattedString, /*Number?*/defaultTime){
      //	summary:
      //		Returns a Date object given a string formatted according to a subset of the ISO-8601 standard.
      //
      //	description:
      //		Accepts a string formatted according to a profile of ISO8601 as defined by
      //		[RFC3339](http://www.ietf.org/rfc/rfc3339.txt), except that partial input is allowed.
      //		Can also process dates as specified [by the W3C](http://www.w3.org/TR/NOTE-datetime)
      //		The following combinations are valid:
      //
      //			* dates only
      //			|	* yyyy
      //			|	* yyyy-MM
      //			|	* yyyy-MM-dd
      // 			* times only, with an optional time zone appended
      //			|	* THH:mm
      //			|	* THH:mm:ss
      //			|	* THH:mm:ss.SSS
      // 			* and "datetimes" which could be any combination of the above
      //
      //		timezones may be specified as Z (for UTC) or +/- followed by a time expression HH:mm
      //		Assumes the local time zone if not specified.  Does not validate.  Improperly formatted
      //		input may return null.  Arguments which are out of bounds will be handled
      // 		by the Date constructor (e.g. January 32nd typically gets resolved to February 1st)
      //		Only years between 100 and 9999 are supported.
      //
      //	formattedString:
      //		A string such as 2005-06-30T08:05:00-07:00 or 2005-06-30 or T08:05:00
      //
      //	defaultTime:
      //		Used for defaults for fields omitted in the formattedString.
      //		Uses 1970-01-01T00:00:00.0Z by default.

      if(!$.validate_input.datetime._isoRegExp){
        $.validate_input.datetime._isoRegExp =
          //TODO: could be more restrictive and check for 00-59, etc.
          /^(?:(-?\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
      }

      var match = $.validate_input.datetime._isoRegExp.exec(formattedString),
      result = null;

      if(match){
        match.shift();

        // remove leading zeros from year
        match[0] = match[0].replace(/^(-)*0+/g, "$1");

        if(match[1]){match[1]--;} // Javascript Date months are 0-based
        if(match[6]){match[6] *= 1000;} // Javascript Date expects fractional seconds as milliseconds

        if(defaultTime){
          // mix in defaultTime.  Relatively expensive, so use || operators for the fast path of defaultTime === 0
          defaultTime = new Date(defaultTime);
          $.each($.map(["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds"], function(prop){
                         return defaultTime["get" + prop]();
                       }),
                 function(value, index){
                   match[index] = match[index] || value;
                 });
        }

        result = new Date(match[0]||1970, match[1]||0, match[2]||1, match[3]||0, match[4]||0, match[5]||0, match[6]||0); //TODO: UTC defaults
        if(match[0] < 100){
          result.setFullYear(match[0] || 1970);
        }

        var offset = 0,
        zoneSign = match[7] && match[7].charAt(0);
        if(zoneSign != 'Z'){
          offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
          if(zoneSign != '-'){ offset *= -1; }
        }
        if(zoneSign){
          offset -= result.getTimezoneOffset();
        }
        if(offset){
          result.setTime(result.getTime() + offset * 60000);
        }
      }

      return result; // Date or null
    },

    /*=====
            dojo.date.stamp.__Options = function(){
                    //	selector: String
                    //		"date" or "time" for partial formatting of the Date object.
                    //		Both date and time will be formatted by default.
                    //	zulu: Boolean
                    //		if true, UTC/GMT is used for a timezone
                    //	milliseconds: Boolean
                    //		if true, output milliseconds
                    this.selector = selector;
                    this.zulu = zulu;
                    this.milliseconds = milliseconds;
            }
    =====*/

    toISOString: function(/*Date*/dateObject, /*dojo.date.stamp.__Options?*/options){
            //	summary:
            //		Format a Date object as a string according a subset of the ISO-8601 standard
            //
            //	description:
            //		When options.selector is omitted, output follows [RFC3339](http://www.ietf.org/rfc/rfc3339.txt)
            //		The local time zone is included as an offset from GMT, except when selector=='time' (time without a date)
            //		Does not check bounds.  Only years between 100 and 9999 are supported.
            //
            //	dateObject:
            //		A Date object

            var _ = function(n){ return (n < 10) ? "0" + n : n; };
            options = options || {};
            var formattedDate = [],
                    getter = options.zulu ? "getUTC" : "get",
                    date = "";
            if(options.selector != "time"){
                    var year = dateObject[getter+"FullYear"]();
                    date = ["0000".substr((year+"").length)+year, _(dateObject[getter+"Month"]()+1), _(dateObject[getter+"Date"]())].join('-');
            }
            formattedDate.push(date);
            if(options.selector != "date"){
                    var time = [_(dateObject[getter+"Hours"]()), _(dateObject[getter+"Minutes"]()), _(dateObject[getter+"Seconds"]())].join(':');
                    var millis = dateObject[getter+"Milliseconds"]();
                    if(options.milliseconds){
                            time += "."+ (millis < 100 ? "0" : "") + _(millis);
                    }
                    if(options.zulu){
                            time += "Z";
                    }else if(options.selector != "time"){
                            var timezoneOffset = dateObject.getTimezoneOffset();
                            var absOffset = Math.abs(timezoneOffset);
                            time += (timezoneOffset > 0 ? "-" : "+") +
                                    _(Math.floor(absOffset/60)) + ":" + _(absOffset%60);
                    }
                    formattedDate.push(time);
            }
            return formattedDate.join('T'); // String
    }
  });

})(jQuery);
