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

acre.require('/test/lib').enable(this);

acre.require("test/mock").playback(this, "i18n/test/playback_test_i18n.json");

var h = acre.require("helper/helpers.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var freebase = acre.require("promise/apis").freebase;

test("i18n", function() {
  ok(i18n.lang, "lang: " + i18n.lang);   // must have a preferred lang
});

test("i18n.mql.langs", function() {
  var langs = i18n.mql.langs();
  var lang_ids = langs.map(function(l) {return l.id;});
  var result;
  // ensure we have lang codes in freebase
  freebase.mqlread([{
    id: null,
    "id|=": lang_ids,
    type: "/type/lang"
  }])
  .then(function(env) {
    result = env.result;
  });
  acre.async.wait_on_results();
  var mql_langs = {};
  result.forEach(function(l) {
       mql_langs[l.id] = l;
  });
  lang_ids.forEach(function(id) {
      if (!mql_langs[id]) {
          ok(false, "Expected lang from MQL: " + id);
      }
  });
  equal(langs.length, result.length);
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


test("nomalize_lang", function() {

  var tests = [
    "/lang/iw", "/lang/iw",
    "/lang/he", "/lang/iw",
    "/lang/pt-br", "/lang/pt-br",
    "/lang/pt", "/lang/pt-br",
    "/lang/zh", "/lang/zh",
    "/lang/zh-cn", "/lang/zh",
    "/lang/zh-hans", "/lang/zh",
    "/lang/zh-hant", "/lang/zh-hant",
    "/lang/zh-tw", "/lang/zh-hant",
    "/lang/et", "/lang/et"
  ];

  for (var i=0,l=tests.length; i<l; i+=2) {
    equal(i18n.normalize_lang(tests[i]), tests[i+1]);
  }

});

acre.test.report();

