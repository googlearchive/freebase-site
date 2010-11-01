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
    var browser_support = ("placeholder" in document.createElement("input"));

    var text = $("#text");
    var textarea = $("#textarea");
    var checkbox = $("checkbox");
    var form = $("#form");

    QUnit.testStart = function(name) {
      $.each([text, textarea, checkbox], function() {
        this.placeholder();
      });
    };
    QUnit.testDone = function(name, failures, total) {
      $.each([text, textarea, checkbox], function() {
        var inst = this.data("placeholder");
        if (inst) {
          inst.destroy();
        }
        this.val("");
      });
    };

    test("init", function() {
      ok(typeof $.fn.placeholder === "function", "$.fn.placeholder defined");
      if (browser_support) {
        ok(!text.data("placeholder"), "browser supports placeholder :text");
        ok(!textarea.data("placeholder"), "browser supports placeholder textarea");
        ok(!checkbox.data("placeholder"), "placeholder n/a on checkbox");
      }
      else {
        ok(text.data("placeholder"), "placeholder initialized :text");
        ok(textarea.data("placeholder"), "placeholder initialized textarea");
        ok(!checkbox.data("placeholder"), "placeholder n/a on checkbox");
      }
    });

    if (browser_support) {
      // nothing to test since browser supports placeholder (html5)
      return;
    }

    test("focus/blur", function() {
      $.each([text, textarea], function() {
        ok(this.hasClass("placeholder"));
        this.focus();
        ok(!this.hasClass("placeholder"));
        this.blur();
        ok(this.hasClass("placeholder"));
      });
    });

    test("submit", function() {
      equal(text[0].value, "text");
      equal(textarea[0].value, "textarea");
      form.submit(function() {
        equal(text[0].value, "");
        equal(text.val(), "");
        equal(textarea[0].value, "");
        equal(textarea.val(), "");
        return false;
      });
      form.submit();
    });

    test("val", function() {
      $.each([text, textarea], function() {
        equal(this.val(), "");
        equal(this[0].value, this.attr("placeholder"));
        this.focus();
        equal(this.val(), "");
        equal(this[0].value, "");
        this.blur();
        equal(this.val(), "");
        equal(this[0].value, this.attr("placeholder"));
      });
    });
  };

  $(run_tests);

})(jQuery);
