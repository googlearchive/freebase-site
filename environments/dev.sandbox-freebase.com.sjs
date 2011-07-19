var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {

  "labs": "//labs",
  "tmt": "//tmt",
  "cubed": "//cubed",
  "parallax": "//parallax",
  "lib": "//22a.lib" + tags_codebase,
  "activity": "//10a.activity" + tags_codebase,
  "admin": "//9a.admin" + tags_codebase,
  "appeditor": "//11a.appeditor" + tags_codebase,
  "apps": "//13a.apps" + tags_codebase,
  "create": "//9a.create" + tags_codebase,
  "data": "//10a.data" + tags_codebase,
  "devdocs": "//12a.devdocs" + tags_codebase,
  "group": "//11a.group" + tags_codebase,
  "history": "//4a.history" + tags_codebase,
  "homepage": "//15a.homepage" + tags_codebase,
  "account": "//12a.account" + tags_codebase,
  "policies": "//13a.policies" + tags_codebase,
  "query": "//10a.query" + tags_codebase,
  "sameas": "//11a.sameas" + tags_codebase,
  "sample": "//10a.sample" + tags_codebase,
  "schema": "//16a.schema" + tags_codebase,
  "topic": "//16a.topic" + tags_codebase,
  "triples": "//12a.triples" + tags_codebase

};

var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);

