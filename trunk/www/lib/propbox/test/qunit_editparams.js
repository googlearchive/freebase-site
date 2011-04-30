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

;(function($, ep) {

  function run_tests() {


    test("isEmpty", function() {
      ok(ep.isEmpty());
      ok(ep.isEmpty(null));
      ok(ep.isEmpty(""));
      ok(!ep.isEmpty(" "));
      ok(!ep.isEmpty([]));
      ok(!ep.isEmpty({}));
    });


    test("inArray", function() {
      equal(ep.inArray(0, [1,2,3,4,5,6,7,8,9,0]), 9);
      equal(ep.inArray(0, [1,2,3,4,5,6,7,8,9,"0"]), -1);
      equal(ep.inArray({a:0}, [{a:1},{a:0},{a:2}]), -1);
      equal(ep.inArray({a:2}, [{a:1},{a:0},{a:2}], "a"), 2);
      equal(ep.inArray({a:0,b:1}, [{a:0,b:1}]), -1);
      equal(ep.inArray({a:0,b:1}, [{a:0,b:1}], "a", "b"), 0);

      var b = {a:0,b:1,c:2};
      equal(ep.inArray(b, [{a:0,b:1,c:3}, b]), 1);
      equal(ep.inArray(b, [{a:0,b:1,c:3}, {a:0,c:2}], "a", "c"), 1);
    });


    test("validate", function() {

      same(ep.validate({expected_type:{id:"/some/type"}}, {id:"foo"}),
           {id:"foo"});

      same(ep.validate({expected_type:{id:"/type/int"}}, {value:0}),
           {value:0});

      same(ep.validate({expected_type:{id:"/type/text"}}, {value:"foo", lang:"/lang/ko"}),
           {value:"foo", lang:"/lang/ko"});

      try {
        ep.validate({expected_type:{id:"/type/text"}}, {value:"foo"});
        ok(false, "expected error");
      }
      catch(ex) {
        ok(true, ex);
      }

      $.each(["/type/int", "/type/float", "/type/boolean"], function(i, type) {
        try {
          ep.validate({expected_type:{id:type}}, {value:"foo"});
          ok(false, "expected error");
        }
        catch(ex) {
          ok(true, ex);
        }
      });
    });


    test("clause", function() {
      same(ep.clause({id:"foo"}, "insert"), {id:"foo", connect:"insert"});
      same(ep.clause({id:"foo", value:"bar"}, "delete"), {id:"foo", connect:"delete"});
      same(ep.clause({value:"foo"}, "update"), {value:"foo", connect:"update"});
      same(ep.clause({value:"foo", lang:"bar"}, "replace"), {value:"foo", lang:"bar", connect:"replace"});
    });


    test("diff unique non-literal", function() {
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/some/type"}
      };

      same(ep.diff(structure,
                   [{id:"foo"}],
                   [{id:"bar"}]),
           [{id:"bar", connect:"replace"}]);

      // invalid old_values > 1
      try {
        ep.diff(structure,
                [{id:"foo"}, {id:"bar"}],
                [{id:"bar"}]);
        ok(false, "expected error");
      }
      catch(ex) {
        ok(true, ex);
      }

      // invalid new_values > 1
      try {
        ep.diff(structure,
                [{id:"foo"}],
                [{id:"foo"}, {id:"bar"}]);
        ok(false, "expected error");
      }
      catch(ex) {
        ok(true, ex);
      }

      // invalid data
      try {
        ep.diff(structure,
                [{id:"foo"}],
                [{value:"bar"}]);
        ok(false, "expected error");
      }
      catch(ex) {
        ok(true, ex);
      }

      // no-op
      same(ep.diff(structure,
                   [{id:"foo"}],
                   [{id:"foo"}]),
           []);
    });


    test("diff unique literal", function() {
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/datetime"}
      };

      same(ep.diff(structure,
                   [{value:"2010"}],
                     [{value:"2011"}]),
           [{value:"2011", connect:"replace"}]);

      // invalid old_values > 1
      try {
        ep.diff(structure,
                [{value:"2010"}, {id:"2009"}],
                [{value:"2011"}]);
        ok(false, "expected error");
      }
      catch(ex) {
        ok(true, ex);
      }

      // invalid new_values > 1
      try {
        ep.diff(structure,
                [{value:"2010"}],
                [{value:"2011"}, {id:"2012"}]);
        ok(false, "expected error");
      }
      catch(ex) {
        ok(true, ex);
      }

      // invalid data
      try {
        ep.diff(structure,
                [{value:"2010"}],
                [{id:"2011"}]);
        ok(false, "expected error");
      }
      catch(ex) {
        ok(true, ex);
      }

      // no-op
      same(ep.diff(structure,
                   [{value:"2010"}],
                   [{value:"2010"}]),
           []);
    });


    test("diff unique text", function() {
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"}
      };

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}],
                   [{value:"bar", lang:"/lang/en"}]),
           [{value:"bar", lang:"/lang/en", connect:"replace"}]);

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}],
                   [{value:"bar", lang:"/lang/ru"}]),
           [{value:"foo", lang:"/lang/en", connect:"delete"}, {value:"bar", lang:"/lang/ru", connect:"replace"}]);

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/ru"}],
                   []),
           [{value:"foo", lang:"/lang/en", connect:"delete"}, {value:"bar", lang:"/lang/ru", connect:"delete"}]);

      try {
        ep.diff(structure,
                [{value:"foo"}],
                [{value:"bar", lang:"/lang/ru"}]);
        ok(false, "expected error");
      }
      catch(ex) {
        ok(true, ex);
      };
    });


    test("diff non-unique non-literal", function() {
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/some/type"}
      };

      same(ep.diff(structure,
                   [{id:"foo"}, {id:"bar"}, {id:"baz"}],
                   [{id:"foo"}, {id:"bar"}, {id:"baz"}, {id:"hello"}]),
           [{id:"hello", connect:"replace"}]);

      same(ep.diff(structure,
                   [{id:"foo"}, {id:"bar"}, {id:"baz"}],
                   [{id:"foo"}, {id:"baz"}, {id:"hello"}]),
           [{id:"bar", connect:"delete"}, {id:"hello", connect:"replace"}]);
    });


    test("diff non-unique literal", function() {
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/int"}
      };

      same(ep.diff(structure,
                   [{value:1}, {value:2}, {value:3}],
                   [{value:4}, {value:5}, {value:6}]),
           [{value:1, connect:"delete"}, {value:2, connect:"delete"}, {value:3, connect:"delete"},
            {value:4, connect:"replace"}, {value:5, connect:"replace"}, {value:6, connect:"replace"}]);

      same(ep.diff(structure,
                   [{value:1}, {value:2}, {value:3}],
                   []),
           [{value:1, connect:"delete"}, {value:2, connect:"delete"}, {value:3, connect:"delete"}]);

      same(ep.diff(structure,
                   [{value:1}, {value:2}, {value:3}],
                   [{value:1}, {value:2}, {value:3}]),
           []);
    });


    test("diff non-unique text", function() {
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"}
      };

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}],
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}, {value:"baz", lang:"/lang/en"}]),
           [{value:"baz", lang:"/lang/en", connect:"replace"}]);

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}],
                   [{value:"bar", lang:"/lang/en"}, {value:"foo", lang:"/lang/ru"}]),
           [{value:"foo", lang:"/lang/en", connect:"delete"}, {value:"foo", lang:"/lang/ru", connect:"replace"}]);

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}],
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}]),
           []);

    });

    test("parse unique-text-insert", function() {
      var context = $("#unique-text-insert");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      $(".fb-input", data_input).val("bar");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: []
      };
      same(ep.parse(structure, context), [{value:"bar", lang:"/lang/en", connect:"replace"}]);
    });


    test("parse unique-text-replace", function() {
      var context = $("#unique-text-noop");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      $(".fb-input", data_input).val("bar");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"}]
      };
      same(ep.parse(structure, context), [{value:"bar", lang:"/lang/en", connect:"replace"}]);
    });

    test("parse unique-text-delete", function() {
      var context = $("#unique-text-delete");
      $(".data-input", context).data_input({lang:"/lang/en"}).remove();
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"}]
      };
      same(ep.parse(structure, context), [{value:"foo", lang:"/lang/en", connect:"delete"}]);
    });

    test("parse unique-text-noop", function() {
      var context = $("#unique-text-noop");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      $(".fb-input", data_input).val("");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"}]
      };
      same(ep.parse(structure, context), []);
    });

    test("parse unique-text-langs-insert", function() {
      var context = $("#unique-text-langs-insert");
      $(".data-input", context).data_input();
      $(".data-input:last", context).data_input({lang:"/lang/zh"}).find(".fb-input").val("baz");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), [{value:"baz", lang:"/lang/zh", connect:"replace"}]);
    });

    test("parse unique-text-langs-replace", function() {
      var context = $("#unique-text-langs-replace");
      $(".data-input", context).data_input();
      $(".data-input:last", context).find(".fb-input").val("baz");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), [{value:"baz", lang:"/lang/ko", connect:"replace"}]);
    });

    test("parse unique-text-langs-delete", function() {
      var context = $("#unique-text-langs-delete");
      $(".data-input", context).remove();
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), [
        {value:"foo", lang:"/lang/en", connect:"delete"},
        {value:"bar", lang:"/lang/ko", connect:"delete"}]);
    });

    test("parse unique-text-langs-noop", function() {
      var context = $("#unique-text-langs-noop");
      $(".data-input", context).data_input().val("");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
    });
  };




  $(run_tests);
})(jQuery, window.editparams);
