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

  function run_tests() {
    var key;
    var source;

    QUnit.testStart = function(name) {
      key = $("#key");
      source = $("#source");
    };

    test("init", function() {
      var inst = key.mqlkey().data("mqlkey");
      ok(inst, "mqlkey initialized");
    });

    var schema_key_test = {
      valid: [
        "a",
        "abcd",
        "e_f",
        "h_4",
        "i_1_j",
        "e345",
        "l_m_o_p_3r4"
      ],
      invalid: [
        "",
        "1",
        "-",
        "_",
        "-_-",
        "a__b",
        "c--d",
        "a!@#$%^&*()",
        "1abc",
        "_abc",
        "-abc",
        "abc_",
        "abc-"
      ]
    };

    function valid(val) {
      return "valid: \"" + val + "\"";
    };

    function invalid(val, msg) {
      return "invalid: \"" + val + "\", error: " + msg;
    };

    test("valid schema=true, check_key=true", schema_key_test.valid.length, function() {
      key.mqlkey({check_key:true, schema:true});
      var tests = schema_key_test.valid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(true, valid(val));
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        })
        .bind("invalid", function(e, msg) {
          ok(false, invalid(key.val(), msg));
          start();
        });
      stop();
      key.val(tests[current++]).trigger("keyup");
    });

    test("valid schema=true, check_key=false", schema_key_test.valid.length, function() {
      key.mqlkey({check_key:false, schema:true});
      var tests = schema_key_test.valid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(true, valid(val));
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        })
        .bind("invalid", function(e, msg) {
          ok(false, invalid(key.val(), msg));
          start();
        });
      stop();
      key.val(tests[current++]).trigger("keyup");
    });

    test("invalid schema=true, check_key=true", schema_key_test.invalid.length, function() {
      key.mqlkey({check_key:true, schema:true});
      var tests = schema_key_test.invalid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(false, valid(val));
          start();
        })
        .bind("invalid", function(e, msg) {
          ok(true, invalid(key.val(), msg));
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        });
      stop();
      key.val(tests[current++]).trigger("keyup");
    });

    test("invalid schema=true, check_key=false", schema_key_test.invalid.length, function() {
      key.mqlkey({check_key:false, schema:true});
      var tests = schema_key_test.invalid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(false, valid(val));
          start();
        })
        .bind("invalid", function(e, msg) {
          ok(true, invalid(key.val(), msg));
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        });
      stop();
      key.val(tests[current++]).trigger("keyup");
    });

    test("valid schema=true, minlen=5", 1, function() {
      key.mqlkey({minlen:5, check_key:false, schema:true});
      key
        .bind("valid", function(e, val) {
          ok(true, valid(val));
          start();
        });
      stop();
      key.val("abcde").trigger("keyup");
    });

    test("invalid schema=true, minlen=5", 1, function() {
      key.mqlkey({minlen:5, check_key:false, schema:true});
      key
        .bind("invalid", function(e, msg) {
          ok(true, invalid(key.val(), msg));
          start();
        });
      stop();
      key.val("abcd").trigger("keyup");
    });

    test("valid schema=true, check_key=true, namespace=/", 1, function() {
      key.mqlkey({check_key:true, namespace:"/"});
      key
        .bind("valid", function(e, val) {
          ok(true, valid(val));
          start();
        });
      stop();
      key.val("foobar").trigger("keyup");
    });

    test("invalid schema=true, check_key=true, namespace=/", 1, function() {
      key.mqlkey({check_key:true, namespace:"/"});
      key
        .bind("invalid", function(e, msg) {
          ok(true, invalid(key.val(), msg));
          start();
        });
      stop();
      key.val("film").trigger("keyup");
    });

    test("valid schema=true, source", 2, function() {
      key.mqlkey({check_key:true, namespace:"/", source:"#source", schema:true});
      key.bind("valid", function(e, val) {
        equal(val, "foo_bar", valid(val));
        equal(key.val(), "foo_bar", valid(key.val()));
        start();
      });
      stop();
      source.val("1Foo-Bar-").trigger("change");
    });

    test("invalid schema=true, source", 1, function() {
      key.mqlkey({check_key:true, namespace:"/", source:source, schema:true});
      key.bind("invalid", function(e, msg) {
        ok(true, invalid(key.val(), msg));
        start();
      });
      stop();
      source.val("Film").trigger("change");
    });

    var valid_keys = ["35783", "google", "0bgUgbUf0P1N2", "0083-5621", "google", "google", "0001288776", "17251", "Google_Inc$002E", "$AD6C$AE00", "1e100$002Enet", "20$0025_time", "52020", "Animated_Google", "Blue_Red_Yellow_Blue_Green_Red", "Dashboard_$0028Google_account_service$0029", "Demo_Slam", "Foofle", "G00gl3", "G00gle", "G4g", "GGEA", "GHits", "GOOG", "GOOGLE", "Gaia_$0028Security_Technology$0029", "Gewgol", "Ggogle", "Giigke$002Ccin", "Gogle", "Goog$003Be", "GoogIe", "Googer", "Googers", "Googgle", "Googke", "Googl", "Googl3", "Google", "Google$0021", "Google$002C_Inc$002E", "Google$002E", "Google$002Ec", "Google$002Ecpm", "Google$002Eeu", "Google$002Em", "Google$002F", "Google$002Fto_do", "Google$005C", "Google$2122", "Google_$0028Company$0029", "Google_$0028company$0029", "Google_Angika", "Google_Australia", "Google_Blog", "Google_Demo_Slam", "Google_English", "Google_Glossary", "Google_Guys", "Google_Inc", "Google_Inc$002E", "Google_Incorporated", "Google_Measure_Map", "Google_Personalized_Home", "Google_Research", "Google_Site_Search", "Google_Space", "Google_check", "Google_community", "Google_guys", "Google_inc$002E", "Google_pakistan", "Google_voice-powered_search", "Google_website_optimizer", "Googleable", "Googlee", "Googlenym", "Googleom", "Googlit", "Googlr", "Googlw", "Goolge", "Goolgle", "Gooogle", "Goooogle", "Gooooogle", "Goooooogle", "Gooooooogle", "Goooooooogle", "Gooooooooogle", "Gstatic$002Ecom", "Innovation_Time_Off", "Mountain_view_chocolate_factory", "Renewable_Energy_Cheaper_Than_Coal", "Sherifian_post", "Site_Flavored_Google_Search_Box", "The_Google_Guys", "Tyle", "Www$002Egoogle", "Www$002Egoogle$002Ecom", "Wwwgoogle", "1092923", "Google", "Google", "Google", "Google_Inc$002E", "Google", "Ca-MvGOO", "N12410638269152547172", "Google", "34781", "Google", "480394", "Google_Inc$002E", "9907", "Google", "1249", "Google", "1417698", "Google_Inc$002E", "870743", "Google", "Google", "11456", "Google", "Google_$0028$043A$043E$043C$043F$0430$043D$0438$044F$0029", "265", "Google_$0028$043A$043E$043C$043F$0430$043D$0438$044F$0029"];

    test("valid schema=false, check_key=false", valid_keys.length, function() {
      key.mqlkey({check_key:false, schema:false});
      var tests = valid_keys;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(true, valid(val));
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        })
        .bind("invalid", function(e, msg) {
          ok(false, invalid(key.val(), msg));
          start();
        });
      stop();
      key.val(tests[current++]).trigger("keyup");
    });

    var invalid_keys = [
      "$XXXX",
      "%ABCD",
      "1$13X3",
      "G__O",
      "G__$0028",
      "$0430__G",
      "$0029--$0043D"
    ];

    test("invalid schema=false, check_key=false", invalid_keys.length, function() {
      key.mqlkey({check_key:false, schema:false});
      var tests = invalid_keys;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(false, valid(val));
          start();
        })
        .bind("invalid", function(e, msg) {
          ok(true, invalid(key.val(), msg));
          if (current < tests.length) {
            key.val(tests[current++]).trigger("keyup");
          }
          else {
            start();
          }
        });
      stop();
      key.val(tests[current++]).trigger("keyup");
    });

  };

  $(run_tests);

})(jQuery);
