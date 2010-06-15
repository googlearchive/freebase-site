var mf = acre.require("MANIFEST").MF;
var controller = mf.require("/freebase/site/core/controller");
var queries = mf.require("queries");
var index_template = mf.require("index_template");

function main(scope) {
  var p_categories = queries.domain_categories();
  
  controller.render_page(index_template, {
    categories: p_categories,
  });
};

if (acre.current_script == acre.request.script) {
  main(this);
}
