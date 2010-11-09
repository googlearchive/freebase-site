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

  function test_timeout() {
    return setTimeout(function() {
        ok(false, "test_timeout");
        start();
    }, 5000);
  };

  function run_tests() {
    var key = $("#key");

    QUnit.testStart = function(name) {

    };
    QUnit.testDone = function(name, failures, total) {
      var inst = key.data("mqlkey");
      if (inst) {
        inst.destroy();
      }
      key.unbind().val("");
    };

    test("init", function() {
      var inst = key.mqlkey().data("mqlkey");
      ok(inst, "mqlkey initialized");
    });

    var key_test = {
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

    test("valid keys check_key=true", key_test.valid.length, function() {
      key.mqlkey({check_key:true});
      var tests = key_test.valid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(true, "valid: " + val);
          if (current < tests.length) {
            key.val(tests[current++]).trigger("textchange");
          }
          else {
            start();
          }
        })
        .bind("invalid", function(e, msg) {
          ok(false, "valid expected: " + msg);
          start();
        });
      stop();
      key.val(tests[current++]).trigger("textchange");
    });

    test("valid keys check_key=false", key_test.valid.length, function() {
      key.mqlkey({check_key:false});
      var tests = key_test.valid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(true, "valid: " + val);
          if (current < tests.length) {
            key.val(tests[current++]).trigger("textchange");
          }
          else {
            start();
          }
        })
        .bind("invalid", function(e, msg) {
          ok(false, "valid expected: " + msg);
          start();
        });
      stop();
      key.val(tests[current++]).trigger("textchange");
    });

    test("invalid keys check_key=true", key_test.invalid.length, function() {
      key.mqlkey({check_key:true});
      var tests = key_test.invalid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(false, "invalid expected: " + val);
          start();
        })
        .bind("invalid", function(e, msg) {
          ok(true, "invalid: " + msg);
          if (current < tests.length) {
            key.val(tests[current++]).trigger("textchange");
          }
          else {
            start();
          }
        });
      stop();
      key.val(tests[current++]).trigger("textchange");
    });

    test("invalid keys check_key=false", key_test.invalid.length, function() {
      key.mqlkey({check_key:false});
      var tests = key_test.invalid;
      var current = 0;
      key
        .bind("valid", function(e, val) {
          ok(false, "invalid expected: " + val);
          start();
        })
        .bind("invalid", function(e, msg) {
          ok(true, "invalid: " + msg);
          if (current < tests.length) {
            key.val(tests[current++]).trigger("textchange");
          }
          else {
            start();
          }
        });
      stop();
      key.val(tests[current++]).trigger("textchange");
    });

    test("valid minlen", 1, function() {
      key.mqlkey({minlen:5, check_key: false});
      var timeout = test_timeout();
      key
        .bind("valid", function(e, val) {
          clearTimeout(timeout);
          ok(true, "valid: " + val);
          start();
        });
      stop();
      key.val("abcde").trigger("textchange");
    });

    test("invalid minlen", 1, function() {
      key.mqlkey({minlen:5, check_key: false});
      var timeout = test_timeout();
      key
        .bind("invalid", function(e, msg) {
          clearTimeout(timeout);
          ok(true, "invalid: " + msg);
          start();
        });
      stop();
      key.val("abcd").trigger("textchange");
    });

    test("valid check_key", 1, function() {
      key.mqlkey({check_key: true, namespace: "/"});
      var timeout = test_timeout();
      key
        .bind("valid", function(e, val) {
          clearTimeout(timeout);
          ok(true, "valid: " + val);
          start();
        });
      stop();
      key.val("foobar").trigger("keyup");
    });

    test("invalid check_key", 1, function() {
      key.mqlkey({check_key: true, namespace: "/"});
      var timeout = test_timeout();
      key
        .bind("invalid", function(e, msg) {
          clearTimeout(timeout);
          ok(true, "invalid: " + msg);
          start();
        });
      stop();
      key.val("film").trigger("keyup");
    });

  };

  $(run_tests);

})(jQuery);
