
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {

  "labs": "//labs",
  "tmt": "//tmt",
  "cubed": "//cubed",
  "parallax": "//parallax",
  "lib": "//17a.lib" + tags_codebase,
  "activity": "//5a.activity" + tags_codebase,
  "admin": "//4a.admin" + tags_codebase,
  "appeditor": "//6a.appeditor" + tags_codebase,
  "apps": "//8a.apps" + tags_codebase,
  "create": "//4b.create" + tags_codebase,
  "data": "//5a.data" + tags_codebase,
  "devdocs": "//7a.devdocs" + tags_codebase,
  "group": "//6a.group" + tags_codebase,
  "homepage": "//10b.homepage" + tags_codebase,
  "account": "//7a.account" + tags_codebase,
  "policies": "//8a.policies" + tags_codebase,
  "query": "//5b.query" + tags_codebase,
  "sameas": "//6a.sameas" + tags_codebase,
  "sample": "//5a.sample" + tags_codebase,
  "schema": "//11a.schema" + tags_codebase,
  "topic": "//11e.topic" + tags_codebase,
  "triples": "//7a.triples" + tags_codebase

};

var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);

