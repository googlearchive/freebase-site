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

acre.require("/test/lib").enable(this);

var f = acre.require("filter/filters.sjs");
var validators = acre.require("validator/validators.sjs");

test("check_param_spec", function() {
  expect(0);
  try {
    f.check_param_spec({
        param1: {
          validator: validators.String
        },
        param2: {
          validator: validators.Int
        }
    });
  }
  catch(e) {
    ok(false, "failed on valid param spec: " + e);
  }
});

test("check_param_spec no validator", function() {
  expect(1);
  try {
    f.check_param_spec({
        param1: {
          validator: validators.String
        },
        param2: {
          // empty spec
        }
    });
  }
  catch(e) {
    ok(true, "expected invalid param spec: " + e);
  }
});

test("validate", function() {
  var params = {
    domain: "/some/domain",
    lang: "/lang/ko",
    as_of_time: "invalid timestamp",
    foo: "true",
    bar: "false",
    baz: "1"
  };
  var filters = f.validate(params, {
    foo: {
      validator: validators.StringBool
    },
    bar: {
      validator: validators.StringBool
    },
    baz: {
      validator: validators.Int
    }
  });

  ok(filters, "got validate result");
  same(filters.domain, "/some/domain");
  same(filters.lang, "/lang/ko");
  same(filters.as_of_time, null);
  same(filters.foo, true);
  same(filters.bar, false);
  same(filters.baz, 1);
});


acre.test.report();
