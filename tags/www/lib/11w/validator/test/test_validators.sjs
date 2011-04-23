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

var validators = acre.require("validator/validators");
var i18n = acre.require("i18n/i18n.sjs");

var undefined;
function fn() {};

var tests = {
  Boolean: {
    valid: [true, false],
    invalid: ["boolean", 0, undefined, fn, null, [], {}]
  },
  String: {
    valid: ["", "FooBar"],
    invalid: [true, -1, undefined, fn, null, ["string"], {a:1}]
  },
  Number: {
    valid: [-1, 0, 1, 1.0],
    invalid: ["number", false, undefined, fn, null, [2], {a:2}]
  },
  Undefined: {
    valid: [undefined],
    invalid: ["undefined", 3.14, true, fn, null, [undefined], {a:undefined}]
  },
  Function: {
    valid: [fn],
    invalid: ["function", -1, false, undefined, null, [fn], {a:fn}]
  },
  Null: {
    valid: [null],
    invalid: ["null", 0, false, undefined, fn, [], {}]
  },
  Array: {
    valid: [[], [null]],
    invalid: ["[0]", 0, true, undefined, fn, null, {a:[]}]
  },
  Dict: {
    valid: [{}, {a:null}],
    invalid: ["{}", 1, false, undefined, fn, null, [{}]]
  }
};

for (var env in tests) {
  test("validators."+env, tests[env], function() {

    var valid = tests[env].valid;
    var invalid = tests[env].invalid;
    var validator = validators[env];

    // test valids
    valid.forEach(function(ok) {
      strictEqual(validator(ok), ok);
    });

    // test invalids
    invalid.forEach(function(nok) {
      try {
        validator(nok);
        ok(false, env + " validator accepted " + (typeof nok) + " value");
      }
      catch(e if e instanceof validators.Invalid) {
        ok(e, e.toString());
      }
      catch(e) {
        ok(false, "unexpected exception " + e);
      }

      // if_invalid
      try {
        strictEqual(validator(nok, {if_invalid: "hello"}), "hello");
      }
      catch(e) {
        ok(false, "option if_invalid ignored");
      }
    });

    // if_empty, required
    ["", [], {}, null, undefined].forEach(function(empty) {
      try {
        strictEqual(validator(empty, {if_empty: "world"}), "world");
      }
      catch (e) {
        ok(false, "option if_empty ignored");
      }
      try {
        validator(empty, {required: true});
        ok(false, "option required ignored");
      }
      catch (e if e instanceof validators.Invalid) {
        ok(e, e.toString());
      }
      catch(e) {
        ok(false, "unexpected exception " + e);
      }
    });
  });
}

var truthy = [true, "true", "yes", "1", "-1", [0], [{}], {a:null}];
test("validators.StringBool", truthy, function() {
  truthy.forEach(function(t) {
    strictEqual(validators.StringBool(t), true);
  });
});

var falsey = [false, "false", "no", "", "0", undefined, [], {}];
test("validators.StringBool", falsey, function() {
  falsey.forEach(function(f) {
    strictEqual(validators.StringBool(f), false);
  });
});



var mqlid_test = {
  valid: ["/", "/freebase", "/type/type", "/film/film/property", "/0/1/2", "/A/b_-", "/wikipedia/ja/$30DE$30C4$30BF$30B1"],
  invalid: ["/freebase/", "#9202a8c04000641f80000000010c393g",
            "#00000000000000000000000000000000", "foobar", "", "!/freebase",
            "/_", "/A/-"]
};
test("validators.MqlId", mqlid_test, function() {
  mqlid_test.valid.forEach(function(id) {
    strictEqual(validators.MqlId(id), id);
  });

  mqlid_test.invalid.forEach(function(id) {
    try {
      validators.MqlId(id);
      ok(false, "expected invalid mql id " + id);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});


var oneof_test = {
  "boolean": {
    oneof: [true, false],
    valid: [true, false],
    invalid: ["true", "false"]
  },
  "string": {
    oneof: ["option 1", "option 2", "option n", ""],
    valid: ["option 1", "option 2", "option n", ""],
    invalid: [1, 2, null]
  },
  "number": {
    oneof: [1, 2, 3],
    valid: [3, 2],
    invalid: [0, -1, -2]
  },
  "mixed": {
    oneof: [true, 1, "true", undefined, null],
    valid: [true, 1, "true", undefined, null],
    invalid: [0, "false", false]
  }
};
test("valdiators.OneOf", oneof_test, function() {
  for (var env in oneof_test) {
    var testing = oneof_test[env];
    var oneof = testing.oneof;
    var valid = testing.valid;
    var invalid = testing.invalid;

    valid.forEach(function(val) {
      strictEqual(validators.OneOf(val, {oneof:oneof}), val);
    });

    invalid.forEach(function(val) {
      try {
        validators.OneOf(val, {oneof:oneof});
        ok(false, "not oneof " + val);
      }
      catch(e if e instanceof validators.Invalid) {
        ok(e, e.toString());
      }
      catch(e) {
        ok(false, "unexpected exception " + e);
      }
    });
  }
});


var timestamp_test = {
  valid: ["2009", "2009-01-01", "2009-12-31T23:00:01"],
  invalid: ["2009/10/01", "10", "2009-1-1", "2009-10-10T1:1:1"]
};

test("validators.Timestamp", timestamp_test, function() {
  timestamp_test.valid.forEach(function(val) {
    strictEqual(validators.Timestamp(val), val);
  });

  timestamp_test.invalid.forEach(function(val) {
    try {
      validators.Timestamp(val);
      ok(false, "not timestamp " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});


var datejs_test = {
  valid: ["today", "yesterday", "now", "2009/11/05", "2009-1-1"].concat(timestamp_test.valid)
};

test("validators.Datejs", datejs_test, function() {
  datejs_test.valid.forEach(function(val) {
    var d = validators.Datejs(val);
    ok(d, "validate datejs string: " + d);
    ok(acre.freebase.date_from_iso(d), "valid iso8601");
  });
});


var int_test = {
  valid: [0, -0, +0, 1, -1, +1, 100.1, 3.24, "1.XX"],
  invalid: ["foo", Number.NaN, "X123"]
};
test("validators.Int", int_test, function() {

  int_test.valid.forEach(function(val) {
    strictEqual(validators.Int(val), parseInt(val, 10));
  });

  int_test.invalid.forEach(function(val) {
    try {
      validators.Int(val);
      ok(false, "not integer " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });

});

var float_test = {
  valid: ["0.123", "1.2.3", "1,3"].concat(int_test.valid),
  invalid: ["foo", Number.NaN, ",123"]
};

test("validators.Float", int_test, function() {

  float_test.valid.forEach(function(val) {
    strictEqual(validators.Float(val), parseFloat(val));
  });

  float_test.invalid.forEach(function(val) {
    try {
      validators.Float(val);
      ok(false, "not float " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});


var key_test = {
  valid: ["a", "bcd", "e_f", "g123", "h_4", "i_1_j"],
  invalid: [1, null, NaN, "", "1", "-", "_", "2ab", "c-d", "e345-", "k_"]
};

test("validators.PropertyKey", key_test, function() {
  key_test.valid.forEach(function(val) {
    strictEqual(validators.PropertyKey(val), val);
  });

  key_test.invalid.forEach(function(val) {
    try {
      validators.PropertyKey(val);
      ok(false, "not property key " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});

test("validators.TypeKey", key_test, function() {
  key_test.valid.forEach(function(val) {
    strictEqual(validators.TypeKey(val), val);
  });

  key_test.invalid.forEach(function(val) {
    try {
      validators.TypeKey(val);
      ok(false, "not type key " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});


var domain_key_test = {
  valid: ["abcde", "fghijklmno", "p_qrs", "t1234", "u_56789", "v_0_w", "x_1_2"],
  invalid: [12345, null, "abcd", "efg1", "h-ijk", "2lmno", "pqrst_", "u-vwxy", "z345-", "abcd_"]
};

test("validators.DomainKey", domain_key_test, function() {
  domain_key_test.valid.forEach(function(val) {
    strictEqual(validators.DomainKey(val), val);
  });

  domain_key_test.invalid.forEach(function(val) {
    try {
      validators.DomainKey(val);
      ok(false, "not domain key " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});


test("reserved_word", function() {
  'meta typeguid left right datatype scope attribute relationship property link class future update insert delete replace create destroy default sort limit offset optional pagesize cursor index !index for while as in is if else return count function read write select var connect this self super xml sql mql any all macro estimate-count guid id object domain name key type keys value timestamp creator permission namespace unique schema reverse'.split(' ').forEach(function(word) {
    ok(validators.reserved_word(word), "reserved word: " + word);
  });
});


test("MultiValue", function() {
  same(validators.MultiValue(true), [true]);
  same(validators.MultiValue([true]), [true]);
  same(validators.MultiValue(false), [false]);
  same(validators.MultiValue([false]), [false]);
  same(validators.MultiValue(""), [""]);
  same(validators.MultiValue([""]), [""]);
  same(validators.MultiValue("foo bar"), ["foo bar"]);
  same(validators.MultiValue(["foo bar"]), ["foo bar"]);
  same(validators.MultiValue(0), [0]);
  same(validators.MultiValue([0]), [0]);
  same(validators.MultiValue(null), []);
  same(validators.MultiValue([null]), []);
  same(validators.MultiValue(null, {allow_null:true}), [null]);
  same(validators.MultiValue([null], {allow_null:true}), [null]);
  same(validators.MultiValue(undefined), []);
  same(validators.MultiValue([undefined]), []);
  same(validators.MultiValue(undefined, {allow_null:true}), [undefined]);
  same(validators.MultiValue([undefined], {allow_null:true}), [undefined]);
  same(validators.MultiValue([null, undefined]), []);
  same(validators.MultiValue([null, undefined], {allow_null:true}), [null, undefined]);
  same(validators.MultiValue([]), []);
  same(validators.MultiValue([], {allow_null:true}), []);
  same(validators.MultiValue({foo:"bar"}), [{foo:"bar"}]);
  same(validators.MultiValue([{foo:"bar"}]), [{foo:"bar"}]);

  same(validators.MultiValue([true, false, "", "foo bar", 0, null, undefined, ["hello"], {foo:"bar"}]),
                             [true, false, "", "foo bar", 0, ["hello"], {foo:"bar"}]);
  same(validators.MultiValue([true, false, "", "foo bar", 0, null, undefined, ["hello"], {foo:"bar"}], {allow_null:true}),
                             [true, false, "", "foo bar", 0, null, undefined, ["hello"], {foo:"bar"}]);

  same(validators.MultiValue(["yes", "1", "true", 1, -1,
                              "no", "0", "false", 0, null, undefined], {validator:validators.StringBool}),
                             [true, true, true, true, true,
                              false, false, false, false, false, false]);

  try {
    validators.MultiValue(["today", "yesterday", "bad date", {bad:"date"}],
                          {validator:validators.Datejs});
    ok(false, "expected invalid exception");
  }
  catch (e if e instanceof validators.Invalid) {
    ok(true, "got expected invalid exception: " + e);
  }

  same(validators.MultiValue(["today", "yesterday", "bad date", {bad:"date"}], {validator:validators.Datejs, if_invalid:null}),
    [validators.Datejs("today"), validators.Datejs("yesterday")]);

  same(validators.MultiValue(["today", "yesterday", "bad date", {bad:"date"}], {validator:validators.Datejs, if_invalid:null, allow_null:true}),
    [validators.Datejs("today"), validators.Datejs("yesterday"), null, null]);
});

test("Json", function() {
  var json = {foo:"bar", "hello":"world", baz: {bap:"bop"}};
  same(validators.Json(JSON.stringify(json)), json);

  [{}, []].forEach(function(o) {
    same(validators.Json(JSON.stringify(o)), o);
  });
});

test("Uri", function() {
  var valid = [
    "http://www.freebase.com",
    "https://foo.com/#name",
    "http://xyz.org/p/a/t/h.cgi?a=http://foo.bar"
  ];
  var invalid = [
    "www.freebase.com",
    "/some/path",
    "file:///User/blah/private",
    "http://foo/bar"
  ];
  valid.forEach(function(val) {
    strictEqual(validators.Uri(val), val);
  });
  invalid.forEach(function(val) {
    try {
      validators.Uri(val);
      ok(false, "not Uri " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});

test("MqlKey", function() {
  var valid = [
    "A", "a", "0", "a-b", "0-A-9_", "0-",
    "abc", "1023", "$30DE$30C4$30BF$30B1", "$30DEa-z$30C4_$30BF4$30B1-"
  ];
  var invalid = [
    "a$001",
    "0.ca",
    "key",
    "$30DE$30C4$30BF$30B"  // incomplete hex
  ];
  valid.forEach(function(val) {
    strictEqual(validators.MqlKey(val), val);
  });
  invalid.forEach(function(val) {
    try {
      validators.MqlKey(val);
      ok(false, "not valid mql key " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});


test("LangId", function() {
  i18n.LANGS.forEach(function(lang) {
    equal(validators.LangId(lang.id), lang.id);
  });
  var invalid = [
    "/lang/en@",
    "/LANG/bad",
    "/lan/en",
    "/language/en",
    "/m/1234_",
    "/guid/en",
    "/en/lang",
    "#9813313419073481097001090000134a"
  ];
  invalid.forEach(function(val) {
    try {
      validators.LangId(val);
      ok(false, "not valid lang " + val);
    }
    catch(e if e instanceof validators.Invalid) {
      ok(e, e.toString());
    }
    catch(e) {
      ok(false, "unexpected exception " + e);
    }
  });
});

acre.test.report();

