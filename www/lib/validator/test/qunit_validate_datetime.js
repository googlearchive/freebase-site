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

    module("datetime");

    var datejs_path;
    var validatejs;
    $("script").each(function() {
      var src = $(this).attr("src");
      if (src) {
        if (src.indexOf("date-en-US.js") !== -1) {
          datejs_path = src.replace("date-en-US.js", "");
        }
        if (src.indexOf("validator/jquery.validate_datetime.js") !== -1) {
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
        else {
          start();
        }
      });

    };

    var t = 0;
    for (var i=t,l=datejss.length; i<l; i++) {
      if (i > t) {
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

  });

})(jQuery);
