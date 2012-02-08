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

    var element = $("#element");

    test("factory", function() {
      var foo_class = $.factory("fooplugin");
      ok(foo_class && typeof foo_class === "function");
      same(element.fooplugin({foo:"bar"}), element);
      var foo_instance = element.data("$.fooplugin");
      ok(foo_instance && foo_instance instanceof foo_class);
      same(foo_instance.options.foo, "bar");
      try {
        $.factory("fooplugin");
        ok(false, "expected exception since fooplugin already exists");
      }
      catch(ex) {
        ok(true, "expected exception: " + ex);
      }
    });

    test("factory proto", function() {
      $.factory("barplugin", {
        init: function() {
          var clicked_class = this.options.clicked_class;
          this.element.bind("click.bar", function() {
            $(this).addClass(clicked_class);
          });
        },
        _destroy: function() {
          this.element.unbind(".bar");
        }
      });
      element.barplugin({clicked_class:"bar_clicked"});
      element.click();
      ok(element.hasClass("bar_clicked"));
      element.removeClass("bar_clicked");
      element.data("$.barplugin")._destroy();
      element.click();
      ok(!element.hasClass("bar_clicked"));
    });
  };

  $(run_tests);
})(jQuery);
