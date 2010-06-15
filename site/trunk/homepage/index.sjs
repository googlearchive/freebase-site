var main = function(scope) {
  var mf = acre.require("MANIFEST").MF;
  var queries = mf.require("queries");
  var index_template = mf.require("index_template");
  
  var p_categories = queries.domain_categories();
  var queries = {
    categories: p_categories,
  };
  
  mf.require("/freebase/site/template/renderer").render_page(queries, index_template);
};

if (acre.current_script == acre.request.script) {
  main(this);
}
