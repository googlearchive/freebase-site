
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {

  "labs": "//labs",
  "tmt": "//tmt",
  "cubed": "//cubed",
  "parallax": "//parallax",
  "lib": "//20a.lib" + tags_codebase,
  "activity": "//8a.activity" + tags_codebase,
  "admin": "//7a.admin" + tags_codebase,
  "appeditor": "//9a.appeditor" + tags_codebase,
  "apps": "//11a.apps" + tags_codebase,
  "create": "//7a.create" + tags_codebase,
  "data": "//8a.data" + tags_codebase,
  "devdocs": "//10a.devdocs" + tags_codebase,
  "group": "//9a.group" + tags_codebase,
  "history": "//2a.history" + tags_codebase,
  "homepage": "//13a.homepage" + tags_codebase,
  "account": "//10a.account" + tags_codebase,
  "policies": "//11a.policies" + tags_codebase,
  "query": "//8a.query" + tags_codebase,
  "sameas": "//9a.sameas" + tags_codebase,
  "sample": "//8a.sample" + tags_codebase,
  "schema": "//14a.schema" + tags_codebase,
  "topic": "//14a.topic" + tags_codebase,
  "triples": "//10a.triples" + tags_codebase

};

var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);

