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

  $(function() {
    var input =  $("#validate_input");

    QUnit.testStart = function(name) {
      // init
    };
    QUnit.testDone = function(name, failures, total) {
      // cleanup
      input.unbind().val("");
    };

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

    test("validate_input allow_empty=null", function() {
      expect(1);
      stop();
      input.validate_input()
        .bind("valid", function(e, v) {
  console.log("v", v);
          same(v, {text:"",value:""});
          start();
        });
      input.trigger("keyup");
    });

    test("validate_input allow_empty=true", function() {
      expect(1);
      stop();
      input.validate_input({allow_empty:true})
        .bind("valid", function() {
          ok(true, "allow_empty=true");
          start();
        });
      input.trigger("keyup");
    });

    test("validate_input allow_empty=false", function() {
      expect(1);
      stop();
      input.validate_input({allow_empty:false})
        .bind("invalid", function() {
          ok(true, "allow_empty=false");
          start();
        });
      input.trigger("keyup");
    });

    test("validate_input validator=foo", function() {
      expect(1);
      stop();
      input.validate_input({validator:function(v) { return {text:"foo",value:"bar"}; }})
        .bind("valid", function(e, val) {
          same(val, {text:"foo",value:"bar"});
          start();
        });
      input.trigger("keyup");
    });
  });
})(jQuery);


