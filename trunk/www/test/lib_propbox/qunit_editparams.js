/*
 * Copyright 2012, Google Inc.
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

  function expect_exception(exception_type, fn) {
    try {
      fn();
      ok(false, "expected exception");
    }
    catch(ex) {
      if (ex instanceof exception_type) {
        ok(true, "expected exception: " + ex);
      }
      else {
        ok(false, "unxpected exception: " + ex);
      }
    }
  };

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

      same(ep.validate({expected_type:{id:"/type/int"}}, {value:0}), {value:0});

      same(ep.validate({expected_type:{id:"/type/text"}}, {value:"foo", lang:"/lang/ko"}),
           {value:"foo", lang:"/lang/ko"});

      // missing lang
      expect_exception(ep.Invalid, function() {
        ep.validate({expected_type:{id:"/type/text"}}, {value:"foo"});
      });

      $.each(["/type/int", "/type/float", "/type/boolean"], function(i, type) {
        // invalid value type
        expect_exception(ep.Invalid, function() {
          ep.validate({expected_type:{id:type}}, {value:"foo"});
        });
        // empty values
        expect_exception(ep.Empty, function() {
          ep.validate({expected_type:{id:type}}, {value:null});
        });
        expect_exception(ep.Empty, function() {
          ep.validate({expected_type:{id:type}}, {});
        });
      });

      // empty values
      expect_exception(ep.Empty, function() {
        ep.validate({expected_type:{id:"/type/text"}}, {value:"", lang:"/lang/en"});
      });
      expect_exception(ep.Empty, function() {
        ep.validate({expected_type:{id:"/type/text"}}, {value:null, lang:"/lang/en"});
      });
      expect_exception(ep.Empty, function() {
        ep.validate({expected_type:{id:"/type/text"}}, {lang:"/lang/en"});
      });

      // create_new values
      ep.validate({expected_type:{id:"/some/type"}}, {create_new:"create_new", lang:"/lang/en"}, {create_new:"create_new", lang:"/lang/en"});
      expect_exception(ep.Invalid, function() {
        ep.validate({expected_type:{id:"/some/type"}}, {create_new:"create_new"});
      });
    });


    test("clause", function() {
      same(ep.clause({id:"foo"}, "insert"), {id:"foo", connect:"insert"});
      same(ep.clause({id:"foo", value:"bar"}, "delete"), {id:"foo", connect:"delete"});
      same(ep.clause({value:"foo"}, "update"), {value:"foo", connect:"update"});
      same(ep.clause({value:"foo", lang:"bar"}, "replace"), {value:"foo", lang:"bar", connect:"replace"});
      same(ep.clause({value:"foo", lang:"bar"}, "delete"), {value:"foo", lang:"bar", connect:"delete"});


      same(ep.clause({id:"foo"}, "insert", {id:"/type/ect"}), {id:"foo", connect:"insert", type:[{id:"/type/ect", connect:"insert"}]});

      same(ep.clause({id:"foo"}, "update", {id:"/type/ect"}), {id:"foo", connect:"update", type:[{id:"/type/ect", connect:"insert"}]});
      same(ep.clause({id:"foo"}, "replace", {id:"/type/ect"}), {id:"foo", connect:"replace", type:[{id:"/type/ect", connect:"insert"}]});
      same(ep.clause({id:"foo"}, "delete", {id:"/type/ect"}), {id:"foo", connect:"delete"});

      same(ep.clause({id:"foo"}, "insert", {id:"/type/ect", included_types:["/type/inc_type"]}), {id:"foo", connect:"insert", type:[{id:"/type/ect", connect:"insert"}, {id:"/type/inc_type", connect:"insert"}]});

      same(ep.clause({id:"foo"}, "insert", {id:"/type/ect", included_types:["/type/inc_type", "/type/inc_type2"]}), {id:"foo", connect:"insert", type:[{id:"/type/ect", connect:"insert"}, {id:"/type/inc_type", connect:"insert"}, {id:"/type/inc_type2", connect:"insert"}]});

      same(ep.clause({id:"foo"}, "update", {id:"/type/ect", included_types:["/type/inc_type", "/type/inc_type2"], enumeration:true}), {id:"foo", connect:"update"});

      same(ep.clause({id:"foo"}, "insert", {id:"/type/object"}), {id:"foo", connect:"insert"});

      same(ep.clause({id:"foo"}, "insert", {id:"/type/ect", included_types:["/type/object", "/type/inc_type2"]}), {id:"foo", connect:"insert", type:[{id:"/type/ect", connect:"insert"}, {id:"/type/inc_type2", connect:"insert"}]});

      same(ep.clause({id:"foo"}, "insert", {id:"/type/object", included_types:["/type/inc_type"]}), {id:"foo", connect:"insert", type:[{id:"/type/inc_type", connect:"insert"}]});

      same(ep.clause({create_new:"foo", lang:"bar"}, "insert"), {id:null, name:{value:"foo", lang:"bar"}, create:"unconditional", connect:"insert"});
      same(ep.clause({create_new:"foo", lang:"bar"}, "update"), {id:null, name:{value:"foo", lang:"bar"}, create:"unconditional", connect:"update"});
    });


    module("diff");


    test("unique-literal", function() {
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
      expect_exception(ep.Invalid, function() {
        ep.diff(structure,
                [{value:"2010"}, {value:"2009"}],
                [{value:"2011"}]);
      });

      // invalid new_values > 1
      expect_exception(ep.Invalid, function() {
        ep.diff(structure,
                [{value:"2010"}],
                [{value:"2011"}, {value:"2012"}]);
      });

      // invalid data
      same(ep.diff(structure,
                   [{value:"2010"}],
                   [{id:"2011"}]),
           [{value:"2010", connect:"delete"}]);

      // no-op
      same(ep.diff(structure,
                   [{value:"2010"}],
                   [{value:"2010"}]),
           []);
    });


    test("non-unique-literal", function() {
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/int"}
      };

      same(ep.diff(structure,
                   [{value:1}, {value:2}, {value:3}],
                   [{value:4}, {value:5}, {value:6}]),
           [{value:1, connect:"delete"}, {value:2, connect:"delete"}, {value:3, connect:"delete"},
            {value:4, connect:"insert"}, {value:5, connect:"insert"}, {value:6, connect:"insert"}]);

      same(ep.diff(structure,
                   [{value:1}, {value:2}, {value:3}],
                   [{value:2}]),
           [{value:1, connect:"delete"}, {value:3, connect:"delete"}]);

      same(ep.diff(structure,
                   [{value:1}, {value:2}, {value:3}],
                   [{value:1}, {value:2}, {value:3}]),
           []);
    });


    test("unique-text", function() {
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

      expect_exception(ep.Invalid, function() {
        ep.diff(structure,
                [{value:"foo"}],
                [{value:"bar", lang:"/lang/ru"}]);
      });
    });


    test("non-unique-text", function() {
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"}
      };

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}],
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}, {value:"baz", lang:"/lang/en"}]),
           [{value:"baz", lang:"/lang/en", connect:"insert"}]);

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}],
                   [{value:"bar", lang:"/lang/en"}, {value:"foo", lang:"/lang/ru"}]),
           [{value:"foo", lang:"/lang/en", connect:"delete"}, {value:"foo", lang:"/lang/ru", connect:"insert"}]);

      same(ep.diff(structure,
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}],
                   [{value:"foo", lang:"/lang/en"}, {value:"bar", lang:"/lang/en"}]),
           []);
    });

    test("unique-key", function() {
        var structure = {
            id: "/my/key",
            unique: true,
            expected_type: {id:"/type/key"}
        };

        // change key value
        same(ep.diff(structure,
                     [{value:"foo", namespace:"/bar"}],
                     [{value:"baz", namespace:"/bar"}]),
             [{value:"foo", namespace:"/bar", connect:"delete"}, {value:"baz", namespace:"/bar", connect:"replace"}]);

        // change namespace
        same(ep.diff(structure,
                     [{value:"foo", namespace:"/bar"}],
                     [{value:"foo", namespace:"/baz"}]),
             [{value:"foo", namespace:"/bar", connect:"delete"}, {value:"foo", namespace:"/baz", connect:"replace"}]);

        // no-op
        same(ep.diff(structure,
                     [{value:"foo", namespace:"/bar"}],
                     [{value:"foo", namespace:"/bar"}]),
             []);      

        expect_exception(ep.Invalid, function() {
            ep.diff(structure,
                    [{value:"foo"}],
                    [{value:"foo", namespace:"/bar"}]);
            });

    });

    test("non-unique-key", function() {
        var structure = {
            id: "/my/key",
            expected_type: {id:"/type/key"}
        };

        same(ep.diff(structure,
                     [{value:"foo", namespace:"/bar"}, {value:"baz", namespace:"/bam/bam"}],
                     [{value:"foo", namespace:"/bar"}, {value:"baz", namespace:"/bam/bam"}, {value:"bap", namespace:"/kim"}]),
                     [{value:"bap", namespace:"/kim", connect:"insert"}]);

        same(ep.diff(structure,
                     [{value:"foo", namespace:"/bar"}, {value:"baz", namespace:"/bam/bam"}],
                     [{value:"foo", namespace:"/bar"}, {value:"bap", namespace:"/kim"}]),
                     [{value:"baz", namespace:"/bam/bam", connect:"delete"}, {value:"bap", namespace:"/kim", connect:"insert"}]);        

        same(ep.diff(structure,
                     [{value:"foo", namespace:"/bar"}, {value:"baz", namespace:"/bam/bam"}],
                     []),
                     [{value:"foo", namespace:"/bar", connect:"delete"}, {value:"baz", namespace:"/bam/bam", connect:"delete"}]);

        same(ep.diff(structure,
                     [{value:"foo", namespace:"/bar"}, {value:"baz", namespace:"/bam/bam"}],
                     [{value:"foo", namespace:"/bar"}, {value:"baz", namespace:"/bam/bam"}]),
                     []);
    });

    test("unique-non-literal", function() {
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/some/type"}
      };

      same(ep.diff(structure, [{id:"foo"}], [{id:"bar"}]), [{id:"bar", connect:"replace", type:[{id:"/some/type", connect:"insert"}]}]);

      same(ep.diff(structure, [{id:"foo"}], [{id:null}]), [{id:"foo", connect:"delete"}]);

      same(ep.diff(structure,[{id:"foo"}], [{id:""}]), [{id:"foo", connect:"delete"}]);

      // invalid old_values > 1
      expect_exception(ep.Invalid, function() {
        ep.diff(structure, [{id:"foo"}, {id:"bar"}], [{id:"bar"}]);
      });

      // invalid new_values > 1
      expect_exception(ep.Invalid, function() {
        ep.diff(structure, [{id:"foo"}], [{id:"foo"}, {id:"bar"}]);
      });

      // invalid data
      same(ep.diff(structure, [{id:"foo"}], [{value:"bar"}]),
           [{id:"foo", connect:"delete"}]);

      // no-op
      same(ep.diff(structure, [{id:"foo"}], [{id:"foo"}]), []);

      // create new
      same(ep.diff(structure, [{id:"foo"}], [{create_new:"bar",lang:"/lang/fr"}]),
           [{id:null, connect:"replace", create:"unconditional",
             name:{value:"bar", lang:"/lang/fr"}, type:[{id:"/some/type", connect:"insert"}]}]);
    });


    test("non-unique non-literal", function() {
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/some/type"}
      };

      same(ep.diff(structure,
                   [{id:"foo"}, {id:"bar"}, {id:"baz"}],
                   [{id:"foo"}, {id:"bar"}, {id:"baz"}, {id:"hello"}]),
           [{id:"hello", connect:"insert", type:[{id:"/some/type", connect:"insert"}]}]);

      same(ep.diff(structure,
                   [{id:"foo"}, {id:"bar"}, {id:"baz"}],
                   [{id:"foo"}, {id:"baz"}, {id:"hello"}]),
           [{id:"bar", connect:"delete"}, {id:"hello", connect:"insert", type:[{id:"/some/type", connect:"insert"}]}]);

      same(ep.diff(structure,
                   [{id:"foo"}, {id:"bar"}, {id:"baz"}],
                   [{id:"foo"}, {create_new:"hello", lang:"/lang/en"}, {id:"baz"}]),
           [{id:"bar", connect:"delete"}, {id:null, connect:"insert", create:"unconditional",
                                           name:{value:"hello", lang:"/lang/en"},
                                           type:[{id:"/some/type", connect:"insert"}]}]);
    });


    module("parse");


    test("unique-text-insert", function() {
      var context = $("#unique-text-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: []
      };
      same(ep.parse(structure, context), []);
      // add new data-input value: bar
      $(".fb-input", context).val("bar");
      same(ep.parse(structure, context), [{value:"bar", lang:"/lang/en", connect:"replace"}]);
    });


    test("unique-text-delete", function() {
      var context = $("#unique-text-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"}]
      };
      same(ep.parse(structure, context), []);
      // empty value
      $(".fb-input", context).val("");
      same(ep.parse(structure, context), [{value:"foo", lang:"/lang/en", connect:"delete"}]);
      // remove data-input
      $(".data-input", context).remove();
      same(ep.parse(structure, context), [{value:"foo", lang:"/lang/en", connect:"delete"}]);
    });


    test("unique-text-replace", function() {
      var context = $("#unique-text-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"}]
      };
      same(ep.parse(structure, context), []);
      // change data-input value: foo => bar
      $(".fb-input", context).val("bar");
      same(ep.parse(structure, context), [{value:"bar", lang:"/lang/en", connect:"replace"}]);
    });


    test("unique-text-noop", function() {
      var context = $("#unique-text-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input", context).val("foo");
      same(ep.parse(structure, context), []);
    });


    test("unique-text-langs-insert", function() {
      var context = $("#unique-text-langs-insert");
      $(".data-input", context).data_input({lang:"/lang/zh"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      // add new data-input (value:baz, lang:/lang/zh)
      $(".fb-input:last", context).val("baz");
      same(ep.parse(structure, context), [{value:"baz", lang:"/lang/zh", connect:"replace"}]);
    });


    test("unique-text-langs-delete", function() {
      var context = $("#unique-text-langs-delete");
      // remove data-inputs
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:first", context).val("");
      same(ep.parse(structure, context), [{value:"foo", lang:"/lang/en", connect:"delete"}]);
      $(".data-input", context).remove();
      same(ep.parse(structure, context), [{
        value:"foo", lang:"/lang/en", connect:"delete"
      }, {
        value:"bar", lang:"/lang/ko", connect:"delete"
      }]);
    });


    test("unique-text-langs-replace", function() {
      var context = $("#unique-text-langs-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:last", context).val("baz");
      same(ep.parse(structure, context), [{value:"baz", lang:"/lang/ko", connect:"replace"}]);
    });


    test("unique-text-langs-noop", function() {
      var context = $("#unique-text-langs-noop");
      // ignore empty values
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:first", context).val("foo");
      same(ep.parse(structure, context), []);
    });


    test("non-unique-text-insert", function() {
      var context = $("#non-unique-text-insert");
      $(".data-input", context).data_input({lang:"/lang/ja"});
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:last", context).val("baz");
      same(ep.parse(structure, context), [{value:"baz", lang:"/lang/ja", connect:"insert"}]);
    });

    test("non-unique-text-replace", function() {
      var context = $("#non-unique-text-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:first", context).val("baz");
      same(ep.parse(structure, context), [
        {value:"foo", lang:"/lang/en", connect:"delete"},
        {value:"baz", lang:"/lang/en", connect:"insert"}
      ]);
    });

    test("non-unique-text-delete", function() {
      var context = $("#non-unique-text-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:last", context).val("");
      same(ep.parse(structure, context), [
        {value:"bar", lang:"/lang/ko", connect:"delete"}
      ]);
      $(".fb-input", context).val("");
      same(ep.parse(structure, context), [
        {value:"foo", lang:"/lang/en", connect:"delete"},
        {value:"bar", lang:"/lang/ko", connect:"delete"}
      ]);
      $(".data-input", context).remove();
      same(ep.parse(structure, context), [
        {value:"foo", lang:"/lang/en", connect:"delete"},
        {value:"bar", lang:"/lang/ko", connect:"delete"}
      ]);
    });

    test("non-unique-text-noop", function() {
      var context = $("#non-unique-text-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:first", context).val("foo");
      same(ep.parse(structure, context), []);
    });


    test("unique-datetime-insert", function() {
      var context = $("#unique-datetime-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/type/datetime"},
        values: []
      };
      same(ep.parse(structure, context), []);
      $(".fb-input", context).val("2009-12");
      same(ep.parse(structure, context), [{value:"2009-12", connect:"replace"}]);
    });


    test("unique-float-replace", function() {
      var context = $("#unique-float-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/type/float"},
        values: [{value:1.23}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input", context).val("4.56");
      same(ep.parse(structure, context), [{value:4.56, connect:"replace"}]);
    });


    test("unique-int-delete", function() {
      var context = $("#unique-int-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/type/int"},
        values: [{value:0}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input", context).val("");
      same(ep.parse(structure, context), [{value:0, connect:"delete"}]);
      $(".data-input", context).remove();
      same(ep.parse(structure, context), [{value:0, connect:"delete"}]);
    });


    test("unique-boolean-noop", function() {
      var context = $("#unique-boolean-noop");
      $(".data-input", context).data_input({lang:"/lang/fr"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/type/boolean"},
        values: [{value:false}]
      };
      same(ep.parse(structure, context), []);
      // same value be ignored
      $(":radio:last", context).click();
      same(ep.parse(structure, context), []);
    });


    test("non-unique-uri-insert", function() {
      var context = $("#non-unique-uri-insert");
      $(".data-input", context).data_input({lang:"/lang/fr"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/type/uri"},
        values: [{value:"http://www.freebase.com"},{value:"http://www.metaweb.com"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:last", context).val("http://www.google.com");
      same(ep.parse(structure, context), [{value:"http://www.google.com", connect:"insert"}]);
    });


    test("non-unique-int-delete", function() {
      var context = $("#non-unique-int-delete");
      $(".data-input", context).data_input({lang:"/lang/ko"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/type/int"},
        values: [{value:-1},{value:0}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:first", context).val("");
      same(ep.parse(structure, context), [{value:-1, connect:"delete"}]);
      $(".data-input:last", context).remove();
      same(ep.parse(structure, context), [{value:-1, connect:"delete"},{value:0, connect:"delete"}]);
    });


    test("non-unique-datetime-replace", function() {
      var context = $("#non-unique-datetime-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/type/datetime"},
        values: [{value:"2009-12"},{value:"2011-05-02"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:first", context).val("");
      $(".fb-input:last", context).val("2011-05-05");
      same(ep.parse(structure, context),
           [{value:"2009-12", connect:"delete"}, {value:"2011-05-02", connect:"delete"}, {value:"2011-05-05", connect:"insert"}]);
    });


    test("non-unique-float-noop", function() {
      var context = $("#non-unique-float-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/type/float"},
        values: [{value:-1.23},{value:.98}]
      };
      same(ep.parse(structure, context), []);
      // empty values should be ignored
      $(".fb-input:first", context).val("-1.23");
      same(ep.parse(structure, context), []);
    });


    test("unique-topic-insert", function() {
      var context = $("#unique-topic-insert");
      $(".data-input", context).data_input({lang:"/lang/fr"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/person", included_types:["/common/topic"]},
        values: []
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input", context), "/en/bob_dylan");
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"replace", type:[{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]}]);

      // create_new
      fb_select_new($(".fb-input", context), "bobby rullo");
      same(ep.parse(structure, context), [{id:null, connect:"replace", create:"unconditional",
                                           name:{value:"bobby rullo", lang:"/lang/fr"},
                                           type:[{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]}]);
    });


    test("unique-topic-delete", function() {
      var context = $("#unique-topic-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/person", included_types:["/common/topic"]},
        values: [{id:"/en/bob_dylan"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input", context).val("");
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"delete"}]);
      $(".data-input", context).remove();
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"delete"}]);
    });

    test("unique-topic-replace", function() {
      var context = $("#unique-topic-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/person", included_types:["/common/topic"]},
        values: [{id:"/en/bob_dylan"}]
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input", context), "/en/foo");
      same(ep.parse(structure, context), [{id:"/en/foo", connect:"replace", type:[{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]}]);


      // create_new
      fb_select_new($(".fb-input", context), "bobby rullo");
      same(ep.parse(structure, context), [{id:null, connect:"replace", create:"unconditional",
                                           name:{value:"bobby rullo", lang:"/lang/en"},
                                           type:[{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]}]);
    });


    test("unique-topic-noop", function() {
      var context = $("#unique-topic-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/person", included_types:["/common/topic"]},
        values: [{id:"/en/bob_dylan"}]
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input", context), "/en/bob_dylan");
      same(ep.parse(structure, context), []);
    });

    test("non-unique-topic-insert", function() {
      var context = $("#non-unique-topic-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/person", included_types:["/common/topic"]},
        values: [{id:"/en/bob_dylan"},{id:"/en/lady_gaga"}]
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:last", context), "/en/jack_kerouac");
      same(ep.parse(structure, context), [{id:"/en/jack_kerouac", connect:"insert",type:[{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]}]);


      // create_new
      fb_select_new($(".fb-input:last", context), "bobby rullo");
      same(ep.parse(structure, context), [{id:null, connect:"insert", create:"unconditional",
                                           name:{value:"bobby rullo", lang:"/lang/en"},
                                           type:[{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]}]);
    });

    test("non-unique-topic-delete", function() {
      var context = $("#non-unique-topic-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type:{id:"/people/person", included_types:["/common/topic"]},
        values: [{id:"/en/bob_dylan"},{id:"/en/lady_gaga"}]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:last", context).val("");
      same(ep.parse(structure, context), [{id:"/en/lady_gaga", connect:"delete"}]);
      $(".fb-input:first", context).val("");
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"delete"},{id:"/en/lady_gaga", connect:"delete"}]);
      fb_select($(".fb-input:last", context), "/en/lady_gaga");
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"delete"}]);
      $(".data-input", context).remove();
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"delete"},{id:"/en/lady_gaga", connect:"delete"}]);
    });

    test("non-unique-topic-replace", function() {
      var context = $("#non-unique-topic-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/person", included_types:["/common/topic"]},
        values: [{id:"/en/bob_dylan"},{id:"/en/lady_gaga"}]
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:last", context), "/en/jack_kerouac");
      same(ep.parse(structure, context), [{id:"/en/lady_gaga", connect:"delete"}, {id:"/en/jack_kerouac", connect:"insert", type:[{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]}]);

      // create_new
      fb_select_new($(".fb-input:last", context), "bobby rullo");
      same(ep.parse(structure, context), [{id:"/en/lady_gaga", connect:"delete"},
                                          {id:null, connect:"insert", create:"unconditional",
                                           name:{value:"bobby rullo", lang:"/lang/en"},
                                           type:[{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]}]);
    });

    test("non-unique-topic-noop", function() {
      var context = $("#non-unique-topic-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/person", included_types:["/common/topic"]},
        values: [{id:"/en/bob_dylan"},{id:"/en/lady_gaga"}]
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:first", context), "/en/bob_dylan");
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:last", context), "/en/lady_gaga");
      same(ep.parse(structure, context), []);
    });

    test("unique-enumerated-insert", function() {
      var context = $("#unique-enumerated-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/gender", included_types:["/common/topic"], enumeration:true},
        values: []
      };
      same(ep.parse(structure, context), []);
      enum_select($("select", context), "/en/female");
      same(ep.parse(structure, context), [{id:"/en/female", connect:"replace"}]);
    });

    test("unique-enumerated-delete", function() {
      var context = $("#unique-enumerated-delete");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/gender", included_types:["/common/topic"], enumeration:true},
        values: [{id:"/en/female"}]
      };
      same(ep.parse(structure, context), []);
      enum_select($("select", context), null);
      same(ep.parse(structure, context), [{id:"/en/female", connect:"delete"}]);
      data_input.remove();
      same(ep.parse(structure, context), [{id:"/en/female", connect:"delete"}]);
    });

    test("unique-enumerated-replace", function() {
      var context = $("#unique-enumerated-replace");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/gender", included_types:["/common/topic"], enumeration:true},
        values: [{id:"/en/female"}]
      };
      same(ep.parse(structure, context), []);
      enum_select($("select", context), "/en/male");
      same(ep.parse(structure, context), [{id:"/en/male", connect:"replace"}]);
    });

    test("unique-enumerated-noop", function() {
      var context = $("#unique-enumerated-noop");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/gender", included_types:["/common/topic"], enumeration:true},
        values: [{id:"/en/male"}]
      };
      same(ep.parse(structure, context), []);
      enum_select($("select", context), "/en/male");
      same(ep.parse(structure, context), []);
      enum_select($("select", context), "/en/female");
      enum_select($("select", context), "/en/male");
      same(ep.parse(structure, context), []);
    });

    test("non-unique-enumerated-insert", function() {
      var context = $("#non-unique-enumerated-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/gender", included_types:["/common/topic"], enumeration:true},
        values: [{id:"/en/male"}]
      };
      same(ep.parse(structure, context), []);
      enum_select($("select:last", context), "/en/female");
      same(ep.parse(structure, context), [{id:"/en/female", connect:"insert"}]);
    });

    test("non-unique-enumerated-delete", function() {
      var context = $("#non-unique-enumerated-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/gender", included_types:["/common/topic"], enumeration:true},
        values: [{id:"/en/male"},{id:"/en/female"}]
      };
      same(ep.parse(structure, context), []);
      enum_select($("select:first", context), "/en/female");
      same(ep.parse(structure, context), [{id:"/en/male", connect:"delete"}]);
      enum_select($("select:last", context), "/en/male");
      same(ep.parse(structure, context), []);
      enum_select($("select:first", context), "/en/male");
      same(ep.parse(structure, context), [{id:"/en/female", connect:"delete"}]);
      $(".data-input", context).remove();
      same(ep.parse(structure, context), [{id:"/en/male", connect:"delete"},{id:"/en/female", connect:"delete"}]);
    });

    test("non-unique-enumerated-replace", function() {
      var context = $("#non-unique-enumerated-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/gender", included_types:["/common/topic"], enumeration:true},
        values: [{id:"/en/female"}]
      };
      same(ep.parse(structure, context), []);
      enum_select($("select", context), "/en/male");
      same(ep.parse(structure, context), [{id:"/en/female", connect:"delete"},{id:"/en/male", connect:"insert"}]);
    });

    test("non-unique-enumerated-noop", function() {
      var context = $("#non-unique-enumerated-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/gender", included_types:["/common/topic"], enumeration:true},
        values: [{id:"/en/male"},{id:"/en/female"}]
      };
      same(ep.parse(structure, context), []);
      enum_select($("select:first", context), "/en/male");
      same(ep.parse(structure, context), []);
      enum_select($("select:last", context), "/en/female");
      same(ep.parse(structure, context), []);
      enum_select($("select:first", context), "/en/female");
      enum_select($("select:last", context), "/en/male");
      same(ep.parse(structure, context), []);
    });

    test("unique-mediator-insert", function() {
      var context = $("#unique-mediator-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/film/film/gross_revenue",
        expected_type: {id:"/measurement_unit/dated_money_value", mediator:true},
        unique: true,
        properties: [{
          id: "/measurement_unit/dated_money_value/currency",
          expected_type: {id:"/finance/currency", included_types:["/common/topic"]},
          unique: true
        },{
          id: "/measurement_unit/dated_money_value/amount",
          expected_type: {id:"/type/float"},
          unique: true
        }],
        values: []
      };
      same(ep.parse(structure, context), []);
      $(".data-input:last", context).find(".fb-input").val("6,087,542");
      same(ep.parse(structure, context), [{
        id: null,
        create: "unconditional",
        connect: "replace",
        type: [{id:"/measurement_unit/dated_money_value", connect:"insert"}],
        "/measurement_unit/dated_money_value/amount": [{
          value: 6087542,
          connect: "replace"
        }]
      }]);
      fb_select($(".data-input:first", context).find(".fb-input"), "/en/us");
      same(ep.parse(structure, context), [{
        id: null,
        create: "unconditional",
        connect: "replace",
        type: [{id:"/measurement_unit/dated_money_value", connect:"insert"}],
        "/measurement_unit/dated_money_value/amount": [{
          value: 6087542,
          connect: "replace"
        }],
        "/measurement_unit/dated_money_value/currency": [{
          id: "/en/us",
          connect: "replace",
          type: [{id:"/finance/currency", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);

      // create_new
      fb_select_new($(".data-input:first", context).find(".fb-input"), "new currency");
      same(ep.parse(structure, context), [{
        id: null,
        create: "unconditional",
        connect: "replace",
        type: [{id:"/measurement_unit/dated_money_value", connect:"insert"}],
        "/measurement_unit/dated_money_value/amount": [{
          value: 6087542,
          connect: "replace"
        }],
        "/measurement_unit/dated_money_value/currency": [{
          id: null,
          connect: "replace",
          create: "unconditional",
          name: {
            value: "new currency",
            lang: "/lang/en"
          },
          type: [{id:"/finance/currency", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);
    });

    test("unique-mediator-delete", function() {
      var context = $("#unique-mediator-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/film/film/gross_revenue",
        expected_type: {id:"/measurement_unit/dated_money_value", mediator:true},
        unique: true,
        properties: [{
          id: "/measurement_unit/dated_money_value/currency",
          expected_type: {id:"/finance/currency", included_types:["/common/topic"]},
          unique: true
        },{
          id: "/measurement_unit/dated_money_value/amount",
          expected_type: {id:"/type/float"},
          unique: true
        }],
        values: [{
          id: "/m/123",
          property: {
            "/measurement_unit/dated_money_value/currency": {
              values: [{
                id: "/en/us"
              }]
            },
            "/measurement_unit/dated_money_value/amount": {
              values: [{
                value: 1234567
              }]
            }
          }
        }]
      };
      same(ep.parse(structure, context), []);
      $(".data-input:last", context).remove();
      same(ep.parse(structure, context), [{
        id: "/m/123",
        "/measurement_unit/dated_money_value/amount": [{
          value: 1234567,
          connect: "delete"
        }]
      }]);
      $(".fb-input", context).val("");
      same(ep.parse(structure, context), [{
        id: "/m/123",
        "/measurement_unit/dated_money_value/amount": [{
          value: 1234567,
          connect: "delete"
        }],
        "/measurement_unit/dated_money_value/currency": [{
          id: "/en/us",
          connect: "delete"
        }]
      }]);
    });

    test("unique-mediator-replace", function() {
      var context = $("#unique-mediator-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/film/film/gross_revenue",
        expected_type: {id:"/measurement_unit/dated_money_value", mediator:true},
        unique: true,
        properties: [{
          id: "/measurement_unit/dated_money_value/currency",
          expected_type: {id:"/finance/currency", included_types:["/common/topic"]},
          unique: true
        },{
          id: "/measurement_unit/dated_money_value/amount",
          expected_type: {id:"/type/float"},
          unique: true
        }],
        values: [{
          id: "/m/123",
          property: {
            "/measurement_unit/dated_money_value/currency": {
              values: [{
                id: "/en/us"
              }]
            },
            "/measurement_unit/dated_money_value/amount": {
              values: [{
                value: 1234567
              }]
            }
          }
        }]
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:first", context), "/en/korean_won");
      same(ep.parse(structure, context), [{
        id: "/m/123",
        "/measurement_unit/dated_money_value/currency": [{
          id: "/en/korean_won",
          connect: "replace",
          type: [{id:"/finance/currency", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);
      $(".fb-input:last", context).val("1200000");
      same(ep.parse(structure, context), [{
        id: "/m/123",
        "/measurement_unit/dated_money_value/amount": [{
          value: 1200000,
          connect: "replace"
        }],
        "/measurement_unit/dated_money_value/currency": [{
          id: "/en/korean_won",
          connect: "replace",
          type: [{id:"/finance/currency", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);

      // create_new
      fb_select_new($(".data-input:first", context).find(".fb-input"), "new currency");
      same(ep.parse(structure, context), [{
        id: "/m/123",
        "/measurement_unit/dated_money_value/amount": [{
          value: 1200000,
          connect: "replace"
        }],
        "/measurement_unit/dated_money_value/currency": [{
          id: null,
          connect: "replace",
          create: "unconditional",
          name: {
            value: "new currency",
            lang: "/lang/en"
          },
          type: [{id:"/finance/currency", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);
    });

    test("unique-mediator-noop", function() {
      var context = $("#unique-mediator-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/film/film/gross_revenue",
        expected_type: {id:"/measurement_unit/dated_money_value", mediator:true},
        unique: true,
        properties: [{
          id: "/measurement_unit/dated_money_value/currency",
          expected_type: {id:"/finance/currency", included_types:["/common/topic"]},
          unique: true
        },{
          id: "/measurement_unit/dated_money_value/amount",
          expected_type: {id:"/type/float"},
          unique: true
        }],
        values: [{
          id: "/m/123",
          property: {
            "/measurement_unit/dated_money_value/currency": {
              values: [{
                id: "/en/us"
              }]
            },
            "/measurement_unit/dated_money_value/amount": {
              values: [{
                value: 1234567
              }]
            }
          }
        }]
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:first", context), "/en/us");
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:last", context), "1,234,567.00");
      same(ep.parse(structure, context), []);
    });


    test("non-unique-mediator-insert", function() {
      var context = $("#non-unique-mediator-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/tv/tv_program/regular_cast",
        expected_type: {id: "/tv/regular_tv_appearance", mediator:true},
        properties: [{
          id: "/tv/regular_tv_appearance/actor",
          unique: true,
          expected_type: {id: "/tv/tv_actor", included_types:["/people/person", "/common/topic"]}
        },{
          id: "/tv/regular_tv_appearance/character",
          unique: true,
          expected_type: {id: "/tv/tv_character", included_types:["/common/topic"]}
        },{
          id: "/tv/regular_tv_appearance/seasons",
          expected_type: {id: "/tv/tv_series_season", included_types:["/common/topic"]}
        }],
        values: []
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:first", context), "/en/matthew_fox");
      same(ep.parse(structure, context), [{
        id: null,
        create: "unconditional",
        connect: "insert",
        type: [{id:"/tv/regular_tv_appearance", connect:"insert"}],
        "/tv/regular_tv_appearance/actor": [{
          id: "/en/matthew_fox",
          connect: "replace",
          type: [{id:"/tv/tv_actor", connect:"insert"},{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);
      fb_select($(".fb-input:eq(1)", context), "/en/jack_shephard");
      same(ep.parse(structure, context), [{
        id: null,
        create: "unconditional",
        connect: "insert",
        type: [{id:"/tv/regular_tv_appearance", connect:"insert"}],
        "/tv/regular_tv_appearance/actor": [{
          id: "/en/matthew_fox",
          connect: "replace",
          type: [{id:"/tv/tv_actor", connect:"insert"},{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }],
        "/tv/regular_tv_appearance/character": [{
          id: "/en/jack_shephard",
          connect: "replace",
          type: [{id: "/tv/tv_character", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);
      fb_select($(".fb-input:eq(2)", context), "/en/lost_season_1");
      fb_select($(".fb-input:eq(3)", context), "/en/lost_season_2");
      fb_select($(".fb-input:eq(4)", context), "/en/lost_season_3");
      same(ep.parse(structure, context), [{
        id: null,
        create: "unconditional",
        connect: "insert",
        type: [{id:"/tv/regular_tv_appearance", connect:"insert"}],
        "/tv/regular_tv_appearance/actor": [{
          id: "/en/matthew_fox",
          connect: "replace",
          type: [{id: "/tv/tv_actor", connect:"insert"},{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }],
        "/tv/regular_tv_appearance/character": [{
          id: "/en/jack_shephard",
          connect: "replace",
          type: [{id: "/tv/tv_character", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }],
        "/tv/regular_tv_appearance/seasons": [{
          id: "/en/lost_season_1",
          connect: "insert",
          type: [{id: "/tv/tv_series_season", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        },{
          id: "/en/lost_season_2",
          connect: "insert",
          type: [{id: "/tv/tv_series_season", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        },{
          id: "/en/lost_season_3",
          connect: "insert",
          type: [{id: "/tv/tv_series_season", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);

      // create_new
      fb_select_new($(".fb-input:first", context), "Matthew Wolf");
      fb_select_new($(".fb-input:eq(4)", context), "New Lost Season");
      same(ep.parse(structure, context), [{
        id: null,
        create: "unconditional",
        connect: "insert",
        type: [{id:"/tv/regular_tv_appearance", connect:"insert"}],
        "/tv/regular_tv_appearance/actor": [{
          id: null,
          name: {
            value: "Matthew Wolf",
            lang: "/lang/en"
          },
          connect: "replace",
          create: "unconditional",
          type: [{id: "/tv/tv_actor", connect:"insert"},{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }],
        "/tv/regular_tv_appearance/character": [{
          id: "/en/jack_shephard",
          connect: "replace",
          type: [{id: "/tv/tv_character", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }],
        "/tv/regular_tv_appearance/seasons": [{
          id: "/en/lost_season_1",
          connect: "insert",
          type: [{id: "/tv/tv_series_season", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        },{
          id: "/en/lost_season_2",
          connect: "insert",
          type: [{id: "/tv/tv_series_season", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        },{
          id: null,
          name: {
            value: "New Lost Season",
            lang: "/lang/en"
          },
          connect: "insert",
          create: "unconditional",
          type: [{id: "/tv/tv_series_season", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);

    });

    test("non-unique-mediator-delete-replace-noop", function() {
      var context = $("#non-unique-mediator-delete-replace-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/tv/tv_program/regular_cast",
        expected_type: {id: "/tv/regular_tv_appearance", mediator:true},
        properties: [{
          id: "/tv/regular_tv_appearance/actor",
          unique: true,
          expected_type: {id: "/tv/tv_actor", included_types:["/people/person", "/common/topic"]}
        },{
          id: "/tv/regular_tv_appearance/character",
          unique: true,
          expected_type: {id: "/tv/tv_character", included_types:["/common/topic"]}
        },{
          id: "/tv/regular_tv_appearance/seasons",
          expected_type: {id: "/tv/tv_series_season", included_types:["/common/topic"]}
        }],
        values: [{
          id: "/m/mid123",
          property: {
            "/tv/regular_tv_appearance/actor": {
              values: [{
                id: "/en/matthew_fox"
              }]
            },
            "/tv/regular_tv_appearance/character": {
              values: [{
                id: "/en/jack_shephard"
              }]
            },
            "/tv/regular_tv_appearance/seasons": {
              values: [{
                id: "/en/lost_season_1"
              },{
                id: "/en/lost_season_2"
              },{
                id: "/en/lost_season_3"
              }]
            }
          }
        }]
      };
      same(ep.parse(structure, context), []);
      $(".fb-input:first", context).val("");
      fb_select($(".fb-input:last", context), "/en/lost_season_4");
      same(ep.parse(structure, context), [{
        id: "/m/mid123",
        "/tv/regular_tv_appearance/actor": [{
          id: "/en/matthew_fox",
          connect: "delete"
        }],
        "/tv/regular_tv_appearance/seasons": [{
          id: "/en/lost_season_3",
          connect:"delete"
        },{
          id: "/en/lost_season_4",
          connect:"insert",
          type: [{id: "/tv/tv_series_season", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);
      fb_select($(".fb-input:first", context), "/en/matthew_fox");
      fb_select($(".fb-input:eq(1)", context), "/en/john_locke");
      fb_select($(".fb-input:last", context), "/en/lost_season_2");
      same(ep.parse(structure, context), [{
        id: "/m/mid123",
        "/tv/regular_tv_appearance/character": [{
          id: "/en/john_locke",
          connect: "replace",
          type: [{id: "/tv/tv_character", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }],
        "/tv/regular_tv_appearance/seasons": [{
          id: "/en/lost_season_3",
          connect:"delete"
        }]
      }]);

      // create_new
      fb_select_new($(".fb-input:first", context), "Matthew Wolf");
      fb_select_new($(".fb-input:eq(2)", context), "Pilot Season");
      same(ep.parse(structure, context), [{
        id: "/m/mid123",
        "/tv/regular_tv_appearance/actor": [{
          id: null,
          name: {
            value: "Matthew Wolf",
            lang: "/lang/en"
          },
          connect: "replace",
          create: "unconditional",
          type: [{id: "/tv/tv_actor", connect:"insert"},{id:"/people/person", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }],
        "/tv/regular_tv_appearance/character": [{
          id: "/en/john_locke",
          connect: "replace",
          type: [{id: "/tv/tv_character", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }],
        "/tv/regular_tv_appearance/seasons": [{
          id: "/en/lost_season_1",
          connect: "delete"
        },{
          id: "/en/lost_season_3",
          connect: "delete"
        },{
          id: null,
          name: {
            value: "Pilot Season",
            lang: "/lang/en"
          },
          connect: "insert",
          create: "unconditional",
          type: [{id: "/tv/tv_series_season", connect:"insert"},{id:"/common/topic", connect:"insert"}]
        }]
      }]);
    });

    test("type-object-key-insert", function() {
        // /type/object/key
        var context = $("#type-object-key-insert");
        $(".data-input", context).data_input({lang:"/lang/en"});
        var structure = {
            id:"/type/object/key",
            expected_type: {id:"/type/key"},
            values: []
        };
        same(ep.parse(structure, context), []);
        $(".fb-input.key-value", context).val("bar");
        fb_select($(".fb-input.key-namespace", context), "/foo/ns");
        same(ep.parse(structure, context), [{value:"bar", namespace:"/foo/ns", connect:"insert"}]);
    });

    test("type-object-key-delete", function() {
        // /type/object/key
        var context = $("#type-object-key-delete");
        $(".data-input", context).data_input({lang:"/lang/en"});
        var structure = {
            id:"/type/object/key",
            expected_type: {id:"/type/key"},
            values: [{namespace:"/en", value:"bob_dylan"}]
        };
        same(ep.parse(structure, context), []);
        $(".fb-input.key-value", context).val("");
        $(".fb-input.key-namespace", context).val("");
        same(ep.parse(structure, context), [{value:"bob_dylan", namespace:"/en", connect:"delete"}]);
    });

    test("type-object-key-replace", function() {
        // /type/object/key
        var context = $("#type-object-key-replace");
        $(".data-input", context).data_input({lang:"/lang/en"});
        var structure = {
            id:"/type/object/key",
            expected_type: {id:"/type/key"},
            values: [{namespace:"/en", value:"bob_dylan"}]
        };
        same(ep.parse(structure, context), []);
        $(".fb-input.key-value", context).val("bobby_rullo");
        fb_select($(".fb-input.key-namespace", context), "/fr");
        same(ep.parse(structure, context), [{value:"bob_dylan", namespace:"/en", connect:"delete"},
                                            {value:"bobby_rullo", namespace:"/fr", connect:"insert"}]);
    });

    test("type-object-key-noop", function() {
        // /type/object/key
        var context = $("#type-object-key-noop");
        $(".data-input", context).data_input({lang:"/lang/en"});
        var structure = {
            id:"/type/object/key",
            expected_type: {id:"/type/key"},
            values: [{namespace:"/en", value:"bob_dylan"}]
        };
        same(ep.parse(structure, context), []);
        $(".fb-input.key-value", context).val("bob_dylan");
        same(ep.parse(structure, context), []);
    });

    test("freebase-type-hints-never-assert", function() {
        var context = $("#freebase-type-hints-never-assert");
         $(".data-input", context).data_input({lang:"/lang/en"});
         var structure = {
             id: "/dataworld/gardening_hint/replaced_by",
             expected_type: {id:"/common/topic", never_assert:true, included_types:["/type/inc_type"]},
             values: []
         };
         same(ep.parse(structure, context), []);
         fb_select($(".fb-input", context), "/m/bar");
         same(ep.parse(structure, context), [{id:"/m/bar", connect:"insert"}]);
    });

  };

  /**
   * Emulate an fb-select event from the suggest input
   */
  function fb_select(input, id) {
    var data = {id: id};
    input.data("data.suggest", data).trigger("fb-select", data);
  };

  /**
   * Emulate an fb-select event from the suggest input
   */
  function fb_select_new(input, name) {
    input.data("data.suggest", name).trigger("fb-select-new", name);
  };

  /**
   * Emulate a selecting an option whose value === id in an html <select> element
   */
  function enum_select(select, id) {
    if (id == null) {
      select[0].selectedIndex = 0;
      select.trigger("change");
    }
    else {
      $("option", select).each(function(i) {
        if (this.value === id) {
          select[0].selectedIndex = i;
          select.trigger("change");
          return false;
        }
      });
    }
  };

  $(function() {
    run_tests();
  });

})(jQuery, window.editparams);
