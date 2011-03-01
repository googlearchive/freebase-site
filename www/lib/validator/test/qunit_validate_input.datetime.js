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

(function($) {

  $(function() {
    var input =  $("#validate_input");

    module("date");

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
      Date.parse("31 " + Date.CultureInfo.monthNames[0] + ", 2006", "d MMM, yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-31",

      "31 " + Date.CultureInfo.abbreviatedMonthNames[0] + ", 2006",
      Date.parse("31 " + Date.CultureInfo.abbreviatedMonthNames[0] + ", 2006", "dd MMM, yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-31",

      "1/12/2006",
       Date.parse("1/12/2006", "M/d/yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-12",

      "12-01-2006",
      Date.parse("12-01-2006", "M/dd/yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-12-01",

      Date.CultureInfo.monthNames[0] + " 1, 2006",
      Date.parse(Date.CultureInfo.monthNames[0] + " 1, 2006", "MMMM d, yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-01",

      Date.CultureInfo.abbreviatedMonthNames[0] + " 31, 2006",
      Date.parse(Date.CultureInfo.monthNames[0] + " 31, 2006", "MMMM d, yyyy").toString(Date.CultureInfo.formatPatterns.shortDate),
      "2006-01-31",

      "2006-01-31T23:59:59+07:00",
      "2006-01-31T23:59:59+07:00",
      "2006-01-31T23:59:59+07:00"
    ];

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
  });

})(jQuery);
