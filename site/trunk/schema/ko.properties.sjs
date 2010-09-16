var bundle = {
  "Schema": "스키마",
  "Search": "검색",
  "Domains": "도메인",
  "All Domains": "모든 도메인"
};

if (acre.current_script === acre.request.script) {
  var mf = acre.require("MANIFEST").mf;
  mf.require("service", "lib").GetService(function() {
    return bundle;
  }, this);
}
