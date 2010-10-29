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

acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var validators = mf.require("validators");
var Class = validators.Class;
var Validator = validators.Validator;

test("Class.factory", function() {

  function MyClass(foo, bar) {
    this.foo = foo;
    this.bar = bar;
  };
  var inst = Class.factory(MyClass, ["foo", "bar"]);

  equal(inst.foo, "foo");
  equal(inst.bar, "bar");
  ok(inst instanceof MyClass);
  equal(typeof inst, "object");

  function AClass(first, middle, last) {
    this.name = first + middle + last;
  };
  inst = validators.Class.factory(AClass, ["1", "2", "3"]);

  equal(inst.name, "123");
  ok(inst instanceof AClass);
  equal(typeof inst, "object");

});


var scope = this;

test("Validator.factory", function() {
  var v = Validator.factory(scope, "MyValidator", {
    "string": function(val, options) {
      return val;
    }
  });
  equal(v, scope.MyValidator);
  equal(v("foo"), "foo");
  equal(v("foo", {}), "foo");
  equal(v({foo:"bar"}, "foo"), "bar");
  equal(v({foo:"bar"}, "foo", {}), "bar");
});


acre.test.report();
