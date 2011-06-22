
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {

  "labs": "//labs",
  "tmt": "//tmt",
  "cubed": "//cubed",
  "parallax": "//parallax",
  "lib": "//18a.lib" + tags_codebase,
  "activity": "//6a.activity" + tags_codebase,
  "admin": "//5a.admin" + tags_codebase,
  "appeditor": "//7a.appeditor" + tags_codebase,
  "apps": "//9a.apps" + tags_codebase,
  "create": "//5b.create" + tags_codebase,
  "data": "//6b.data" + tags_codebase,
  "devdocs": "//8a.devdocs" + tags_codebase,
  "group": "//7a.group" + tags_codebase,
  "homepage": "//11a.homepage" + tags_codebase,
  "account": "//8b.account" + tags_codebase,
  "policies": "//9a.policies" + tags_codebase,
  "query": "//6a.query" + tags_codebase,
  "sameas": "//7a.sameas" + tags_codebase,
  "sample": "//6a.sample" + tags_codebase,
  "schema": "//12a.schema" + tags_codebase,
  "topic": "//12a.topic" + tags_codebase,
  "triples": "//8a.triples" + tags_codebase

};

var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);

