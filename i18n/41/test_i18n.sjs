acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");
var i18n = mf.require("i18n");

test("i18n", function() {
  ok(i18n.lang, i18n.lang);   // must have a preferred lang
});

test("i18n.mql.langs", function() {
  var langs = i18n.mql.langs();
  var map = h.map_array(langs, "id");
  var q = [{
    id: null,
    "id|=": [lang.id for each (lang in langs)],
    type: "/type/lang"
  }];
  var mql_langs = acre.freebase.mqlread(q).result;
  equal(mql_langs.length, langs.length);
});

test("i18n.mql.query.text", function() {
  var langs = [i18n.lang];
  if (i18n.lang !== "/lang/en") {
    langs.push("/lang/en");
  }
  [i18n.mql.query.text, i18n.mql.query.name].forEach(function(fn) {
    var clause = fn.call();
    ok(clause instanceof Array);
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
  ok(clause instanceof Array);
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
