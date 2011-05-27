// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {
  "lib":        "//12a.lib" + tags_codebase,
  "topic":      "//7a.topic" + tags_codebase,
  "schema":     "//7a.schema" + tags_codebase,
  "activity":   "//1a.activity" + tags_codebase,
  "triples":    "//3a.triples" + tags_codebase,
  "group":      "//2a.group" + tags_codebase,
  "sameas":     "//2a.sameas" + tags_codebase,
  "homepage":   "//6a.homepage" + tags_codebase,
  "data":       "//1a.data" + tags_codebase,
  "apps":       "//4a.apps" + tags_codebase,
  "appeditor":  "//2a.appeditor" + tags_codebase,
  "docs":       "//3a.devdocs" + tags_codebase,
  "policies":   "//4a.policies" + tags_codebase,
  "query":      "//1a.query" + tags_codebase,
  "sample":     "//sample" + tags_codebase,
  "account":    "//1a.account" + tags_codebase,
  "admin":      "//admin" + tags_codebase,
  "cubed":      "//cubed",
  "parallax":   "//parallax",
  "labs":       "//labs",
  "tmt":        "//tmt"
};

// environment-specific overrides to the default routing rules in lib/routing
var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);
