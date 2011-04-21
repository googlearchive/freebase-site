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

  var input;

  QUnit.testStart = function(name) {
    // init
  };
  QUnit.testDone = function(name, failures, total) {
    // cleanup
    input.unbind().val("");
  };

  $(function() {
    input =  $("#validate_input");
    test_options();
    test_uri();
    test_int();
    test_float();
    test_datetime();
  });


  function test_options() {

    module("options");

    test("validate_input validator=null", function() {
      expect(1);
      try {
        input.validate_input({validator:null});
        ok(false, "Can't validate with validator=null");
      }
      catch(ex) {
        ok(true, "expected error: " + ex);
      }
    });

    test("validat_input original", function() {
      expect(1);
      stop();
      input
        .val("original value")
        .validate_input()
        .bind("original", function() {
          ok(true, "original value");
          start();
        })
        .trigger("keyup");
    });

    test("validate_input validator=foo", function() {
      expect(1);
      stop();
      input.validate_input({validator:function(v) { return {text:"foo",value:"bar"}; }})
        .bind("valid", function(e, val) {
          same(val, {text:"foo",value:"bar"});
          start();
        });
      input.val("foo").trigger("keyup");
    });
  };

  function test_uri() {
    module("uri");

    test("$.validate_input.uri", function() {
      equal(typeof $.validate_input.uri, "function");
    });

    test("valid", function() {
      var tests = [
        "http://www.freebase.com",
        "https://foo.com/#name",
        "http://xyz.org/p/a/t/h.cgi?a=http://foo.bar"
      ];
      expect(tests.length);
      $.each(tests, function(i,t) {
        try {
          same($.validate_input.uri(t), {text:t, value:t});
        }
        catch(ex) {
          ok(false, ex);
        };
      });
    });

    test("invalid", function() {
      var tests = [
        "www.freebase.com",
        "/some/path",
        "file:///User/blah/private",
        "http://foo/bar"
      ];
      expect(tests.length);
      $.each(tests, function(i,t) {
        try {
          $.validate_input.uri(t);
          ok(false, "Expected invalid: " + t);
        }
        catch(ex) {
          ok(true, ""+ex);
        };
      });

    });
  };


  var valid_numbers = [
    1, 1, 1,
    0, 0, 0,
    -1, -1, -1,
    1000, 1000, 1000,
    1000000.1, 1000000, 1000000.1,
    1.003, 1, 1.003,
    100.01, 100, 100.01,
    1.5, 2, 1.5,
    -1.234, -1, -1.234
  ];

  var invalid_numbers = [
    "foo",
    ""
  ];

  function test_int() {
    module("int");

    test("$.validate_input.int", function() {
      equal(typeof $.validate_input["int"], "function");
    });

    var i,l,j,k;
    for (i=0,l=locales.length; i<l; i++) {
      (function() {
         var locale = locales[i];
         test(locale, function() {
           for (var j=0,k=valid_numbers.length; j<k; j+=3) {
             try {
               var intstr = dojo.number.format(valid_numbers[j], {locale:locale});
               var parsed = $.validate_input["int"](intstr, {locales:[locale]});
               var expected_value = valid_numbers[j+1];
               ok(parsed && parsed.value === expected_value, [intstr, parsed.value, expected_value].join(" => "));
             }
             catch(ex) {
               ok(false, ex);
             };
           }
         });
       })();
    }
  };

  function test_float() {
    module("float");

    test("$.validate_input.float", function() {
      equal(typeof $.validate_input["float"], "function");
    });

    var i,l,j,k;
    for (i=0,l=locales.length; i<l; i++) {
      (function() {
         var locale = locales[i];
         test(locale, function() {
           for (var j=0,k=valid_numbers.length; j<k; j+=3) {
             try {
               var intstr = dojo.number.format(valid_numbers[j], {locale:locale});
               var parsed = $.validate_input["float"](intstr, {locales:[locale]});
               var expected_value = valid_numbers[j+2];
               ok(parsed && parsed.value === expected_value, [intstr, parsed.value, expected_value].join(" => "));
             }
             catch(ex) {
               ok(false, ex);
             };
           }
         });
       })();
    }
  };

  function test_datetime() {
    module("datetime");

    test("$.validate_input.datetime", function() {
      equal(typeof $.validate_input.datetime, "function");
    });

    var valid = [
      "2000", new Date(2000, 0),
      "-0100", new Date(-100, 0),
      "2000-04", new Date(2000, 3),
      "2000-04-05", new Date(2000, 3, 5),
      "2000-04-05T23:59:59", new Date(2000, 3, 5, 23, 59, 59)
    ];

    test("valid", function() {

      for(var i=0,l=valid.length; i<l; i+=2) {
        var val = valid[i];
        var date = valid[i+1];
        try {
          var result = $.validate_input.datetime(val);

          equal(result.text, val);
          equal(result.value, val);
          equal(result.date.toString(), date.toString());
        }
        catch(ex) {
          ok(false, ""+ex);
        }
      }
    });

    var somedate = new Date(2000, 3, 5);
    var formats = $.validate_input.datetime.formats;

    for (var i=0,l=locales.length; i<l; i++) {
      (function() {
         var locale =  dojo.i18n.normalizeLocale(locales[i]);
         test(locale, function() {
           var bundle = dojo.date.locale._getGregorianBundle(locale);
           ok(bundle, "Got gregorian bundle for locale: " + locale);

           for (var j=0,k=formats.length; j<k; j+=2) {
             var ymd = formats[j];
             var dateFormats = formats[j+1];
             for (var n=0,m=dateFormats.length; n<m; n++) {
               var dateFormat = dateFormats[n];
               var datePattern = bundle[dateFormat];
               if (!datePattern) {
                 ok(false, "datePattern does not exist: " + dateFormat);
                 return;
               }
               try {
                 /**
                  * HACK: some dojo cldr formats use Greek Alphabet, 'L' to denote month
                  */
                 datePattern = datePattern.replace(/L/g, "M");
                 var somedatestr = dojo.date.locale.format(somedate, {datePattern:datePattern, selector:"date", locale:locale});
                 var parsed = $.validate_input.datetime(somedatestr, {locales:[locale]});
                 var expected_value = dojo.date.locale.format(somedate, {datePattern:ymd, selector:"date"});
                 ok(parsed && parsed.value === expected_value, [datePattern, somedatestr, parsed.value, expected_value].join(" => "));
               }
               catch (ex) {
                 ok(false, [datePattern, ex].join(": "));
               }
             }
           }
         });
       })();
    }
  };

})(jQuery);


