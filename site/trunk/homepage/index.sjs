var main = function(scope) {
  var mf = acre.require("MANIFEST").MF;
  var queries = mf.require("queries");
  
  var p_categories = queries.domain_categories();
  var p_domains = queries.alphabetically_grouped_commons_domains();
  
  var queries = {
    categories: p_categories,
    domains: p_domains
  };
  
  mf.require("/freebase/site/template/renderer").render_page(
    queries,
    mf.require("index_template")
  );
};

if (acre.current_script == acre.request.script) {
  main(this);
}
