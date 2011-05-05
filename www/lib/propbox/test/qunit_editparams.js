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

;(function($, dojo, ep) {

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
           [{id:"hello", connect:"insert"}]);

      same(ep.diff(structure,
                   [{id:"foo"}, {id:"bar"}, {id:"baz"}],
                   [{id:"foo"}, {id:"baz"}, {id:"hello"}]),
           [{id:"bar", connect:"delete"}, {id:"hello", connect:"insert"}]);
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
            {value:4, connect:"insert"}, {value:5, connect:"insert"}, {value:6, connect:"insert"}]);

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

    test("parse unique-text-insert", function() {
      var context = $("#unique-text-insert");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      // add new data-input value: bar
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
      var context = $("#unique-text-replace");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      // change data-input value: foo => bar
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
      // remove data-input
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
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"}]
      };
      same(ep.parse(structure, context), []);
      // empty data-input should be ignored
      data_input.find(".fb-input").val("");
      same(ep.parse(structure, context), []);
    });

    test("parse unique-text-langs-insert", function() {
      var context = $("#unique-text-langs-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      // add new data-input (value:baz, lang:/lang/zh)
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
      $(".data-input", context).data_input({lang:"/lang/en"});
      // replace korean input value: bar => baz
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
      // remove data-inputs
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
      // ignore empty values
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      // empty data-input should be ignored
      data_input.find(".fb-input").val("");
      same(ep.parse(structure, context), []);
    });

    test("parse non-unique-text-insert", function() {
      var context = $("#non-unique-text-insert");
      $(".data-input", context).data_input({lang:"/lang/ja"});
      $(".data-input:last", context).find(".fb-input").val("baz");
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), [{value:"baz", lang:"/lang/ja", connect:"insert"}]);
    });

    test("parse non-unique-text-replace", function() {
      var context = $("#non-unique-text-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      $(".data-input:first", context).find(".fb-input").val("baz");
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), [
        {value:"foo", lang:"/lang/en", connect:"delete"},
        {value:"baz", lang:"/lang/en", connect:"insert"}
      ]);
    });

    test("parse non-unique-text-delete", function() {
      var context = $("#non-unique-text-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      $(".data-input:last", context).remove();
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), [
        {value:"bar", lang:"/lang/ko", connect:"delete"}
      ]);
    });

    test("parse non-unique-text-noop", function() {
      var context = $("#non-unique-text-noop");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id: "/type/text"},
        values: [{value:"foo", lang:"/lang/en"},{value:"bar", lang:"/lang/ko"}]
      };
      same(ep.parse(structure, context), []);
      // empty data-input should be ignored
      data_input.find(".fb-input").val("");
      same(ep.parse(structure, context), []);
    });

    test("parse unique-datetime-insert", function() {
      var context = $("#unique-datetime-insert");
      $(".data-input", context).data_input({lang:"/lang/en"}).find(".fb-input").val("Dec 2009");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/type/datetime"},
        values: []
      };
      same(ep.parse(structure, context), [{value:"2009-12", connect:"replace"}]);
    });

    test("parse unique-float-replace", function() {
      var context = $("#unique-float-replace");
      $(".data-input", context).data_input({lang:"/lang/fr"}).find(".fb-input").val("4,56");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/type/float"},
        values: [{value:1.23}]
      };
      same(ep.parse(structure, context), [{value:4.56, connect:"replace"}]);
    });

    test("parse unique-int-delete", function() {
      var context = $("#unique-int-delete");
      $(".data-input", context).remove();
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/type/int"},
        values: [{value:0}]
      };
      same(ep.parse(structure, context), [{value:0, connect:"delete"}]);
    });

    test("parse unique-boolean-noop", function() {
      var context = $("#unique-boolean-noop");
      var data_input = $(".data-input", context).data_input({lang:"/lang/fr"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/type/boolean"},
        values: [{value:false}]
      };
      same(ep.parse(structure, context), []);
      // same value be ignored
      data_input.find(".fb-input:last").click();
      same(ep.parse(structure, context), []);
    });

    test("parse non-unique-uri-insert", function() {
      var context = $("#non-unique-uri-insert");
      $(".data-input", context).data_input({lang:"/lang/fr"});
      $(".data-input:last", context).find(".fb-input").val("http://www.google.com");
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/type/uri"},
        values: [{value:"http://www.freebase.com"},{value:"http://www.metaweb.com"}]
      };
      same(ep.parse(structure, context), [{value:"http://www.google.com", connect:"insert"}]);
    });

    test("parse non-unique-int-delete", function() {
      var context = $("#non-unique-int-delete");
      $(".data-input", context).data_input({lang:"/lang/ko"});
      $(".data-input:first", context).remove();
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/type/int"},
        values: [{value:-1},{value:0}]
      };
      same(ep.parse(structure, context), [{value:-1, connect:"delete"}]);
    });

    test("parse non-unique-datetime-replace", function() {
      var context = $("#non-unique-datetime-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      $(".data-input:first", context).find(".fb-input").val("");
      $(".data-input:last", context).find(".fb-input").val("2011-05-05");
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/type/datetime"},
        values: [{value:"2009-12"},{value:"2011-05-02"}]
      };
      same(ep.parse(structure, context), [{value:"2011-05-02", connect:"delete"}, {value:"2011-05-05", connect:"insert"}]);
    });

    test("parse non-unique-float-noop", function() {
      var context = $("#non-unique-float-noop");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/type/datetime"},
        values: [{value:-1.23},{value:.98}]
      };
      same(ep.parse(structure, context), []);
      // empty values should be ignored
      data_input.find(".fb-input").val("");
      same(ep.parse(structure, context), []);
    });

    test("parse unique-topic-insert", function() {
      var context = $("#unique-topic-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      fb_select($(".fb-input", context), "/en/bob_dylan");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/person"},
        values: []
      };
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"replace"}]);
    });

    test("parse unique-topic-delete", function() {
      var context = $("#unique-topic-delete");
      $(".data-input", context).remove();
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/person"},
        values: [{id:"/en/bob_dylan"}]
      };
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"delete"}]);
    });

    test("parse unique-topic-replace", function() {
      var context = $("#unique-topic-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      fb_select($(".fb-input", context), "/en/foo");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/person"},
        values: [{id:"/en/bob_dylan"}]
      };
      same(ep.parse(structure, context), [{id:"/en/foo", connect:"replace"}]);
    });

    test("parse unique-topic-noop", function() {
      var context = $("#unique-topic-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/person"},
        values: [{id:"/en/bob_dylan"}]
      };
      same(ep.parse(structure, context), []);
      // empty values are ignored
      $(".data-input", context).find(".fb-input").val("");
      same(ep.parse(structure, context), []);
    });

    test("parse non-unique-topic-insert", function() {
      var context = $("#non-unique-topic-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/person"},
        values: [{id:"/en/bob_dylan"},{id:"/en/lady_gaga"}]
      };
      fb_select($(".fb-input:last", context), "/en/jack_kerouac");
      same(ep.parse(structure, context), [{id:"/en/jack_kerouac", connect:"insert"}]);
    });

    test("parse non-unique-topic-delete", function() {
      var context = $("#non-unique-topic-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/person"},
        values: [{id:"/en/bob_dylan"},{id:"/en/lady_gaga"}]
      };
      $(".data-input:first", context).remove();
      same(ep.parse(structure, context), [{id:"/en/bob_dylan", connect:"delete"}]);
    });

    test("parse non-unique-topic-replace", function() {
      var context = $("#non-unique-topic-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/person"},
        values: [{id:"/en/bob_dylan"},{id:"/en/lady_gaga"}]
      };
      fb_select($(".fb-input:last", context), "/en/jack_kerouac");
      same(ep.parse(structure, context), [{id:"/en/lady_gaga", connect:"delete"}, {id:"/en/jack_kerouac", connect:"insert"}]);
    });

    test("parse non-unique-topic-noop", function() {
      var context = $("#non-unique-topic-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/person"},
        values: [{id:"/en/bob_dylan"},{id:"/en/lady_gaga"}]
      };
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:first", context), "/en/bob_dylan");
      same(ep.parse(structure, context), []);
      $(".fb-input", context).val("");
      same(ep.parse(structure, context), []);
      fb_select($(".fb-input:last", context), "/en/lady_gaga");
      same(ep.parse(structure, context), []);
    });

    test("parse unique-enumerated-insert", function() {
      var context = $("#unique-enumerated-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      enum_select($("select", context), "/en/female");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/gender"},
        values: []
      };
      same(ep.parse(structure, context), [{id:"/en/female", connect:"replace"}]);
    });

    test("parse unique-enumerated-delete", function() {
      var context = $("#unique-enumerated-delete");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      enum_select($("select", context), "/en/female");
      data_input.remove();
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/gender"},
        values: [{id:"/en/female"}]
      };
      same(ep.parse(structure, context), [{id:"/en/female", connect:"delete"}]);
    });

    test("parse unique-enumerated-replace", function() {
      var context = $("#unique-enumerated-replace");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      enum_select($("select", context), "/en/male");
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/gender"},
        values: [{id:"/en/female"}]
      };
      same(ep.parse(structure, context), [{id:"/en/male", connect:"replace"}]);
    });

    test("parse unique-enumerated-noop", function() {
      var context = $("#unique-enumerated-noop");
      var data_input = $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        unique: true,
        expected_type: {id:"/people/gender"},
        values: [{id:"/en/male"}]
      };
      same(ep.parse(structure, context), []);
      enum_select($("select", context), "/en/male");
      same(ep.parse(structure, context), []);
      enum_select($("select", context), "/en/female");
      enum_select($("select", context), null);  // 0-index is "Select..." option
      same(ep.parse(structure, context), []);
    });

    test("parse non-unique-enumerated-insert", function() {
      var context = $("#non-unique-enumerated-insert");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/gender"},
        values: [{id:"/en/male"}]
      };

      enum_select($("select:last", context), "/en/female");
      same(ep.parse(structure, context), [{id:"/en/female", connect:"insert"}]);
    });

    test("parse non-unique-enumerated-delete", function() {
      var context = $("#non-unique-enumerated-delete");
      $(".data-input", context).data_input({lang:"/lang/en"});
      $(".data-input:first", context).remove();
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/gender"},
        values: [{id:"/en/male"},{id:"/en/female"}]
      };
      same(ep.parse(structure, context), [{id:"/en/male", connect:"delete"}]);
      $(".data-input", context).remove();
      same(ep.parse(structure, context), [{id:"/en/male", connect:"delete"},{id:"/en/female", connect:"delete"}]);
    });

    test("parse non-unique-enumerated-replace", function() {
      var context = $("#non-unique-enumerated-replace");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/gender"},
        values: [{id:"/en/female"}]
      };
      enum_select($("select", context), "/en/male");
      same(ep.parse(structure, context), [{id:"/en/female", connect:"delete"},{id:"/en/male", connect:"insert"}]);
    });

    test("parse non-unique-enumerated-noop", function() {
      var context = $("#non-unique-enumerated-noop");
      $(".data-input", context).data_input({lang:"/lang/en"});
      var structure = {
        id: "/prop/id",
        expected_type: {id:"/people/gender"},
        values: [{id:"/en/male"},{id:"/en/female"}]
      };
      enum_select($("select:first", context), "/en/male");
      same(ep.parse(structure, context), []);
      enum_select($("select:last", context), "/en/female");
      same(ep.parse(structure, context), []);
      enum_select($("select:first", context), null);
      same(ep.parse(structure, context), []);
      enum_select($("select:last", context), null);
      same(ep.parse(structure, context), []);
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

  stop();
  dojo.ready(function() {
    start();
    run_tests();
  });

})(jQuery, dojo, window.editparams);
