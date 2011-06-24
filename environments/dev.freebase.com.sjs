
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {

  "labs": "//labs",
  "tmt": "//tmt",
  "cubed": "//cubed",
  "parallax": "//parallax",
  "lib": "//19a.lib" + tags_codebase,
  "activity": "//7a.activity" + tags_codebase,
  "admin": "//6a.admin" + tags_codebase,
  "appeditor": "//8a.appeditor" + tags_codebase,
  "apps": "//10a.apps" + tags_codebase,
  "create": "//6a.create" + tags_codebase,
  "data": "//7a.data" + tags_codebase,
  "devdocs": "//9a.devdocs" + tags_codebase,
  "group": "//8a.group" + tags_codebase,
  "history": "//1a.history" + tags_codebase,
  "homepage": "//12a.homepage" + tags_codebase,
  "account": "//9a.account" + tags_codebase,
  "policies": "//10a.policies" + tags_codebase,
  "query": "//7a.query" + tags_codebase,
  "sameas": "//8a.sameas" + tags_codebase,
  "sample": "//7a.sample" + tags_codebase,
  "schema": "//13a.schema" + tags_codebase,
  "topic": "//13a.topic" + tags_codebase,
  "triples": "//9a.triples" + tags_codebase

};

var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);

