
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {

  "lib": "//9a.lib" + tags_codebase,
  "activity": "//4b.activity" + tags_codebase,
  "admin": "//3a.admin" + tags_codebase,
  "appeditor": "//5b.appeditor" + tags_codebase,
  "apps": "//7a.apps" + tags_codebase,
  "create": "//3a.create" + tags_codebase,
  "data": "//4a.data" + tags_codebase,
  "devdocs": "//6a.devdocs" + tags_codebase,
  "group": "//5a.group" + tags_codebase,
  "homepage": "//9a.homepage" + tags_codebase,
  "account": "//4a.account" + tags_codebase,
  "policies": "//7a.policies" + tags_codebase,
  "query": "//4a.query" + tags_codebase,
  "sameas": "//5a.sameas" + tags_codebase,
  "sample": "//4a.sample" + tags_codebase,
  "schema": "//9b.schema" + tags_codebase,
  "topic": "//9b.topic" + tags_codebase,
  "triples": "//6a.triples" + tags_codebase,

  "cubed":      "//cubed",
  "parallax":   "//parallax",
  "labs":       "//labs",
  "tmt":        "//tmt"
};

};

var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);

