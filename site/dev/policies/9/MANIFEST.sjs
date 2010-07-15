var MF = {
  "apps": {
      "core": "//8.core.site.freebase.dev",
      "template": "//8.template.site.freebase.dev",
      "jquerytools": "//8.jquerytools.site.freebase.dev",
      "domain": "//8.domain.site.freebase.dev",

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
acre.require(MF.apps.core + "/MANIFEST").init(MF, this, {"image_base_url": "http://freebaselibs.com/static/freebase_site/policies/61a0e9224bf620eba06bccf25bdbc498", "static_base_url": "http://freebaselibs.com/static/freebase_site/policies/61a0e9224bf620eba06bccf25bdbc498"});
