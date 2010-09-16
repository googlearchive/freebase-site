acre.require('/test/lib').enable(this);

var mf = acre.require("MANIFEST").mf;
var i18n = mf.require("i18n");

test("i18n", function() {
  ok(i18n.lang, i18n.lang);   // must have a preferred lang
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




acre.test.report();
