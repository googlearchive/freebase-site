// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {
  "lib":        "//13a.lib" + tags_codebase,
  "topic":      "//8a.topic" + tags_codebase,
  "schema":     "//8a.schema" + tags_codebase,
  "activity":   "//2a.activity" + tags_codebase,
  "triples":    "//4a.triples" + tags_codebase,
  "group":      "//3a.group" + tags_codebase,
  "sameas":     "//3a.sameas" + tags_codebase,
  "homepage":   "//7a.homepage" + tags_codebase,
  "data":       "//2a.data" + tags_codebase,
  "apps":       "//5a.apps" + tags_codebase,
  "appeditor":  "//3a.appeditor" + tags_codebase,
  "docs":       "//4a.devdocs" + tags_codebase,
  "policies":   "//5a.policies" + tags_codebase,
  "query":      "//2a.query" + tags_codebase,
  "sample":     "//sample" + tags_codebase,
  "account":    "//2a.account" + tags_codebase,
  "admin":      "//1a.admin" + tags_codebase,
  "create":     "//1a.create" + tags_codebase,

  "cubed":      "//cubed",
  "parallax":   "//parallax",
  "labs":       "//labs",
  "tmt":        "//tmt"
};

// environment-specific overrides to the default routing rules in lib/routing
var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);
