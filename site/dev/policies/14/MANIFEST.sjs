var MF = {
  "apps": {
      "core": "//14.core.site.freebase.dev",
      "template": "//14.template.site.freebase.dev",
      "jquerytools": "//14.jquerytools.site.freebase.dev",
      "domain": "//14.domain.site.freebase.dev",

      // external apps
      "jquery": "//release.jquery.libs.freebase.dev"
  },
  "stylesheet": {
    "policies.mf.css": [
      ["template", "freebase.mf.css"],
      "css-policies.css"
    ]
  },
  "javascript": {
    "policies.mf.js": [
      ["template", "freebase.mf.js"]
    ]
  },
};

if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
  MF.apps.core = "//core.site.freebase.dev";
}
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/policies/7b28c52e386c9d033e5b0303f73b7d9a", "static_base_url": "http://freebaselibs.com/static/freebase_site/policies/7b28c52e386c9d033e5b0303f73b7d9a"});
