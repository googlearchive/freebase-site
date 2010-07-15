var MF = {
  "apps": {
      "core": "//9.core.site.freebase.dev",
      "template": "//9.template.site.freebase.dev",
      "jquerytools": "//9.jquerytools.site.freebase.dev",
      "domain": "//9.domain.site.freebase.dev",

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
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/policies/5f7b8c402921214a8678a511c99f3d45", "static_base_url": "http://freebaselibs.com/static/freebase_site/policies/5f7b8c402921214a8678a511c99f3d45"});
