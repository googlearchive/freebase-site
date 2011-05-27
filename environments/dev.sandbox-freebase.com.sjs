// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {
  "lib":        "//lib" + codebase,
  "topic":      "//topic" + codebase,
  "schema":     "//schema" + codebase,
  "activity":   "//activity" + codebase,
  "triples":    "//triples" + codebase,
  "group":      "//group" + codebase,
  "sameas":     "//sameas" + codebase,
  "homepage":   "//homepage" + codebase,
  "data":       "//data" + codebase,
  "apps":       "//apps" + codebase,
  "appeditor":  "//appeditor" + codebase,
  "docs":       "//devdocs" + codebase,
  "policies":   "//policies" + codebase,
  "query":      "//query" + codebase,
  "sample":     "//sample" + codebase,
  "account":    "//account" + codebase,
  "admin":      "//admin" + codebase,
  "cubed":      "//cubed",
  "parallax":   "//parallax",
  "labs":       "//labs",
  "tmt":        "//tmt"
};

// environment-specific overrides to the default routing rules in lib/routing
var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);
