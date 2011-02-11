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

 acre.require("test/mock").playback(this, "i18n/test/playback_test_i18n.json");

var h = acre.require("helper/helpers.sjs");
var i18n = acre.require("i18n/i18n");
var freebase = acre.require("promise/apis").freebase;

test("i18n", function() {
  ok(i18n.lang, "lang: " + i18n.lang);   // must have a preferred lang
});

test("i18n.mql.langs", function() {
  var langs = i18n.mql.langs();
  var map = h.map_array(langs, "id");
  var result;
  // ensure we have lang codes in freebase
  freebase.mqlread([{
    id: null,
    "id|=": [lang.id for each (lang in langs)],
    type: "/type/lang"
  }])
  .then(function(env) {
    result = env.result;
  });
  acre.async.wait_on_results();
  equal(langs.length, result.length);
});

test("i18n.datejs", function() {
  var langs = i18n.mql.langs();
  var map = h.map_array(langs, "id");

  // ensure datejs file for each lang
  var lib_files = acre.get_metadata().files;
  for (var i=0,l=langs.length; i<l; i++) {
    var code = langs[i].code;
    if (!h.isArray(code)) {
      code = [code];
    }
    // ensure in datejs/*.sjs
    var found = false;
    code.every(function(c) {
      var filename = h.sprintf("datejs/date-%s.sjs", c);
      if (lib_files[filename]) {
        found = filename;
        return false;
      }
      return true;
    });
    ok(found, found);

    //acre.write(h.sprintf("cp src/date-%s.js date-%s.sjs </br>", code, code));
  };

  ok(typeof i18n.datejs !== "undefined", "locale datejs initialized");
  ok(i18n.datejs.CultureInfo, "datejs CultureInfo found");
  equal(i18n.datejs.CultureInfo.name, map[i18n.lang].code);
  same(i18n.format.date, i18n.datejs.CultureInfo.formatPatterns, "CultureInfo.formatPatterns loaded");
});

test("i18n.mql.query.text", function() {
  var langs = [i18n.lang];
  if (i18n.lang !== "/lang/en") {
    langs.push("/lang/en");
  }
  [i18n.mql.query.text, i18n.mql.query.name].forEach(function(fn) {
    var clause = fn.call();
    ok(h.isArray(clause));
    ok(clause.length === 1);
    deepEqual(clause, [{
      optional: true,
      value: null,
      lang: null,
      "lang|=":langs
    }]);
  });
});

test("i18n.mql.query.article", function() {
  var langs = [i18n.lang];
  if (i18n.lang !== "/lang/en") {
    langs.push("/lang/en");
  }
  var clause = i18n.mql.query.article();
  ok(h.isArray(clause));
  ok(clause.length === 1);
  deepEqual(clause, [{
    optional:   true,
    id:         null,
    timestamp:  null,
    type:       "/common/document",
    source_uri: null,
    "nolang:content": {
      optional: true,
      id:       null,
      type:     "/type/content",
      language: {
        id: null,
        optional: "forbidden"
      }
    },
    "lang:content": {
      optional: true,
      id:       null,
      type:     "/type/content",
      language: {
        id: null,
        "id|=": langs
      }
    }
  }]);
});

test("i18n.mql.get_text", function() {
  strictEqual(i18n.mql.get_text("/lang/ko", []), null);
  strictEqual(i18n.mql.get_text("/lang/en", []), null);
  var result = [{
    lang: "/lang/ko",
    value: "korean"
  },{
    lang: "/lang/en",
    value: "english"
  }];
  equal(i18n.mql.get_text("/lang/ko", result).value, "korean");
  equal(i18n.mql.get_text("/lang/en", result).value, "english");
  equal(i18n.mql.get_text("/lang/ja", result).value, "english");
});

test("i18n.mql.get_article", function() {
  strictEqual(i18n.mql.get_article("/lang/ko", []), null);
  strictEqual(i18n.mql.get_article("/lang/en", []), null);

  var result = [{
    id: "wp_0",
    timestamp: 0,
    source_uri: "http://wp/en/foo"
  },{
    id: "wp_1",
    timestamp: 1,
    source_uri: "http://wp/ko/foo"
  }];
  equal(i18n.mql.get_article("/lang/ko", result).id, "wp_1");
  equal(i18n.mql.get_article("/lang/en", result).id, "wp_0");
  equal(i18n.mql.get_article("/lang/ja", result).id, "wp_0");

  result = result.concat([{
    id: "wp_2",
    timestamp: 2,
    source_uri: "http://wp/en/foo"
  },{
    id: "wp_3",
    timestamp: 3,
    source_uri: "http://wp/ko/foo"
  }]);
  equal(i18n.mql.get_article("/lang/ko", result).id, "wp_3");
  equal(i18n.mql.get_article("/lang/en", result).id, "wp_2");
  equal(i18n.mql.get_article("/lang/ja", result).id, "wp_2");

  result = result.concat([{
    id: "nolang_0",
    timestamp: 0,
    "nolang:content": {}
  },{
    id: "nolang_1",
    timestamp: 1,
    "nolang:content": {}
  }]);
  equal(i18n.mql.get_article("/lang/ko", result).id, "wp_3");
  equal(i18n.mql.get_article("/lang/en", result).id, "nolang_1");
  equal(i18n.mql.get_article("/lang/ja", result).id, "nolang_1");

  result = result.concat([{
    id: "lang_0",
    timestamp: 0,
    "lang:content": {language: {id:"/lang/ko"}}
  }]);
  equal(i18n.mql.get_article("/lang/ko", result).id, "lang_0");
  equal(i18n.mql.get_article("/lang/en", result).id, "nolang_1");
  equal(i18n.mql.get_article("/lang/ja", result).id, "nolang_1");

  result = result.concat([{
    id: "lang_1",
    timestamp: 1,
    "lang:content": {language: {id:"/lang/en"}}
  },{
    id: "lang_2",
    timestamp: 2,
    "lang:content": {language: {id:"/lang/ko"}}
  },{
    id: "lang_3",
    timestamp: 3,
    "lang:content": {language: {id:"/lang/en"}}
  }]);
  strictEqual(i18n.mql.get_article("/lang/ko", result).id, "lang_2");
  strictEqual(i18n.mql.get_article("/lang/en", result).id, "lang_3");
  strictEqual(i18n.mql.get_article("/lang/ja", result).id, "lang_3");
});



test("display_name", function() {
  var topic = {
    id: "foo",
    name: [{
      value: "bar",
      lang: i18n.lang
    }]
  };
  equal(i18n.display_name(topic), "bar");

  topic = {
    id: "foo"
  };
  equal(i18n.display_name(topic), "foo");

  topic = {
    id: "foo",
    "/type/object/name": [{
      value: "bar",
      lang: i18n.lang
    }]
  };
  equal(i18n.display_name(topic, null, "/type/object/name"), "bar");

  topic = {
    id: "foo",
    name: []
  };
  equal(i18n.display_name(topic, "bar"), "bar");
});


test("display_article", function() {
  var topic = {
    id: "foo",
    "/common/topic/article": [{
      "source_uri": "http://wp/en/foo",
      "blob": "source_uri_blob",
      "blurb": "source_uri_blurb"
    },{
      "lang:content": {
        language: {id: i18n.lang}
      },
      "blob": "lang_blob",
      "blurb": "lang_blurb"
    }]
  };
  var blurb = i18n.display_article(topic, "blurb");
  equal(blurb, "lang_blurb");

  var [blob] = i18n.display_article(topic, ["blob"]);
  equal(blob, "lang_blob");

  var [blurb, blob] = i18n.display_article(topic, ["blurb", "blob"]);
  equal(blurb, "lang_blurb");
  equal(blob, "lang_blob");
});

acre.test.report();
