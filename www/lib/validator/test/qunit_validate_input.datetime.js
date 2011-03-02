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
 * No equivalent datejs files. Use alternatives
 */
var SKIP_CODES = {
  "zh-Hans-CN": 1,
  "zh-Hant-TW": 1,
  "iw-IL": 1,
  "fil-PH": 1,
  "sr-Cyrl-RS": 1,
  "es-419": 1
};

/**
 * Known failures
 */
var skip_tests = true;
var SKIP_TESTS = {
  "cs-CZ": 1,
  "es-ES": 1,
  "pt-BR": 1,
  "sv-SE": 1,
  "pt-PT": 1,
  "vi-VN": 1,
  "lt-LT": 1,
  "lv-LV": 1,
  "es-MX": 1
};

(function($) {

  $(function() {
    var input =  $("#validate_input");

    module("datetime");

    var datejs_path;
    var validatejs;
    $("script").each(function() {
      var src = $(this).attr("src");
      if (src) {
        if (src.indexOf("date-en-US.js") !== -1) {
          datejs_path = src.replace("date-en-US.js", "");
        }
        if (src.indexOf("validator/jquery.validate_input.js") !== -1) {
          validatejs = src;
        }
      }
    });

    function load_datejs(datejs) {
      var error = false;
      $.ajax({
        url: datejs,
        error: function() {
          error = true;
        },
        async: false,
        dataType: "script"
      });
      if (error) {
        return false;
      }
      $.ajax({
        url: validatejs,
        error: function() {
          error = true;
        },
        async: false,
        dataType: "script"
      });
      if (error) {
        return false;
      }
      return true;
    };

    test("init", function() {
      ok(datejs_path, "datejs_path: " + datejs_path);
      ok(validatejs, "validatejs: " + validatejs);
    });

    var datejss = [];
    $.each(LANGS, function(i,lang) {
      var codes = lang.code;
      if (!$.isArray(codes)) {
        codes = [codes];
      }
      $.each(codes, function(j, code) {
        if (SKIP_CODES[code]) {
          return;
        }
        var datejs = "date-" + code + ".js";
        if (skip_tests && SKIP_TESTS[code]) {
          console.warn("SKIP", datejs);
          return;
        }
        datejss.push([datejs_path + datejs, datejs]);
      });
    });

    function test_datejs(datejs) {
      var path = datejs[0];
      datejs = datejs[1];

      module(datejs);

      test("$.validate_input.datetime", function() {
        stop();
        if (load_datejs(path)) {
          start();
          var tests = get_tests();
          var i,l;
          for(i=0,l=tests.length; i<l; i++) {
            var datestr = tests[i][0];
            var text = tests[i][1];
            var value = tests[i][2];
            //console.log("datestr", datestr, "expected", value);
            try {
              var result = $.validate_input.datetime(datestr);
              equal(result.text, text, "datestr: " + datestr + ", text: " + text);
              equal(result.value, value, "datestr: " + datestr + ", value: " + value);
            }
            catch (ex) {
              console.warn(ex);
              ok(false, "Can't parse: " + datestr + ", expected: " + value);
              //break;
            }
          }
        }
      });
/**



        test("validate_input", function() {
          stop();
          if (load_datejs(path)) {
            start();
            var tests = get_tests(Date);
            var i,l;
            for(i=0,l=tests.length; i<l; i++) {
                 var datestr = tests[i][0];
                 var text = tests[i][1];
                 var value = tests[i][2];
                 input.unbind()
                   .validate_input({validator:$.validate_input.datetime})
                   .bind("valid", function(e, data) {
                     same(data, {text:text, value:value});
                     start();
                   });
                 stop();
                 input.val(datestr).trigger("keyup");
            }
          };
        });
**/


    };

    var t = 0;
    for (var i=t,l=datejss.length; i<l; i++) {
      if (i > 1) {
        //break;
      }
      var datejs = datejss[i];
      test_datejs(datejs);
    }

    function get_tests() {
      var d = (new Date()).set({month:0, day:12, year:2000});
      var tests = [
        ["2000", "2000", "2000"],
        ["-0002", "-0002", "-0002"],
        ["2006-01-31T23:59:59+07:00", "2006-01-31T23:59:59+07:00", "2006-01-31T23:59:59+07:00"],
        ["2006-10-22T07:34:24.0001Z", "2006-10-22T07:34:24.0001Z", "2006-10-22T07:34:24.0001Z"]
      ];
      for (var m=0; m<12; m++) {
        var d = (new Date()).set({month:m, day:(m+1)*2, year:2000 + m});
        $.each(["y", "d", "D"], function(i, f) {
          var datestr, text, value;
          datestr = d.toString(f);
          if (f === "y") {
            text = datestr;
            value = d.toString("yyyy-MM");
          }
          else {
            text = d.toString("D");
            value = d.toString("yyyy-MM-dd");
          }
          tests.push([datestr, text, value]);
        });
      }
      return tests;
    };
/**
    var date_tests = [
      "2006", "2006", "2006",
      "-0002", "-0002", "-0002",

      "1/2006",
      Date.parseExact("1/2006", "M/yyyy").toString(Date.CultureInfo.formatPatterns.yearMonth),
      "2006-01",

      "01-2011",
      Date.parseExact("01-2011", "MM-yyyy").toString(Date.CultureInfo.formatPatterns.yearMonth),
      "2011-01",

      "2010.1",
      Date.parseExact("2010.1", "yyyy.M").toString(Date.CultureInfo.formatPatterns.yearMonth),
      "2010-01",

      "2000 01",
      Date.parseExact("2000 01", "yyyy MM").toString(Date.CultureInfo.formatPatterns.yearMonth),
      "2000-01",

      "2006/1/31",
      Date.parseExact("2006/1/31", "yyyy/M/d").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-31",

      "2006.01.31",
      Date.parseExact("2006.01.31", "yyyy.MM.dd").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-31",

      "31 " + Date.CultureInfo.monthNames[0] + ", 2006",
      Date.parseExact("31 " + Date.CultureInfo.monthNames[0] + ", 2006", "d MMM, yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-31",

      "31 " + Date.CultureInfo.abbreviatedMonthNames[0] + ", 2006",
      Date.parseExact("31 " + Date.CultureInfo.abbreviatedMonthNames[0] + ", 2006", "dd MMM, yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-31",

      "1/12/2006",
       Date.parseExact("1/12/2006", "M/d/yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-12",

      "12-01-2006",
      Date.parseExact("12-01-2006", "M-dd-yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-12-01",

      Date.CultureInfo.monthNames[0] + " 1, 2006",
      Date.parseExact(Date.CultureInfo.monthNames[0] + " 1, 2006", "MMM d, yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-01",

      Date.CultureInfo.abbreviatedMonthNames[0] + " 31, 2006",
      Date.parseExact(Date.CultureInfo.monthNames[0] + " 31, 2006", "MMM d, yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-31",


    ];
**/
/**
    test("$.validate_input.datetime", function() {
      for(var i=0,l=date_tests.length; i<l; i+=3) {
        var val = date_tests[i];
        var text = date_tests[i+1];
        var value = date_tests[i+2];
        var result = $.validate_input.datetime(val);
        equal(result.text, text);
        equal(result.value, value);
      }
    });

    for(var i=0,l=date_tests.length; i<l; i+=3) {
      (function() {
        var val = date_tests[i];
        var text = date_tests[i+1];
        var value = date_tests[i+2];
         test(val, function() {
           expect(1);
           stop();
           input.val(val);
           input.validate_input({validator:$.validate_input.datetime})
             .bind("valid", function(e, data) {
               same(data, {text:text, value:value});
               start();
             });
           input.trigger("keyup");
         });

      })();
    };
**/
  });

})(jQuery);
