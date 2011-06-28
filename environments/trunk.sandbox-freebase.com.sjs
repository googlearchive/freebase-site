// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {
  "account":    "//account" + codebase,
  "activity":   "//activity" + codebase,
  "admin":      "//admin" + codebase,
  "appeditor":  "//appeditor" + codebase,
  "apps":       "//apps" + codebase,
  "create":     "//create" + codebase,
  "cubed":      "//cubed",
  "data":       "//data" + codebase,
  "devdocs":    "//devdocs" + codebase,
  "group":      "//group" + codebase,
  "homepage":   "//homepage" + codebase,
  "labs":       "//labs",
  "lib":        "//lib" + codebase,
  "parallax":   "//parallax",
  "policies":   "//policies" + codebase,
  "query":      "//query" + codebase,
  "sameas":     "//sameas" + codebase,
  "sample":     "//sample" + codebase,
  "schema":     "//schema" + codebase,
  "tmt":        "//tmt",
  "topic":      "//topic" + codebase,
  "triples":    "//triples" + codebase
};


var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);
