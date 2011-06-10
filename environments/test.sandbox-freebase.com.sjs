// Shared base urls
var codebase = ".www.trunk.svn.freebase-site.googlecode.dev";
var tags_codebase = ".www.tags.svn.freebase-site.googlecode.dev";

var labels = {
  "lib":        "//14c.lib" + tags_codebase,
  "topic":      "//9a.topic" + tags_codebase,
  "schema":     "//9a.schema" + tags_codebase,
  "activity":   "//3a.activity" + tags_codebase,
  "triples":    "//5a.triples" + tags_codebase,
  "group":      "//4b.group" + tags_codebase,
  "sameas":     "//4a.sameas" + tags_codebase,
  "homepage":   "//8a.homepage" + tags_codebase,
  "data":       "//3a.data" + tags_codebase,
  "apps":       "//6a.apps" + tags_codebase,
  "appeditor":  "//4a.appeditor" + tags_codebase,
  "docs":       "//5a.devdocs" + tags_codebase,
  "policies":   "//6a.policies" + tags_codebase,
  "query":      "//3a.query" + tags_codebase,
  "sample":     "//3a.sample" + tags_codebase,
  "account":    "//3b.account" + tags_codebase,
  "admin":      "//2a.admin" + tags_codebase,
  "create":     "//2a.create" + tags_codebase,

  "cubed":      "//cubed",
  "parallax":   "//parallax",
  "labs":       "//labs",
  "tmt":        "//tmt"
};

// environment-specific overrides to the default routing rules in lib/routing
var rules = {};

acre.require(labels.lib + "/routing/router.sjs").route(labels, rules, this);
