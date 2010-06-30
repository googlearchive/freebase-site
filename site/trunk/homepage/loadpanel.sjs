var main = function(scope) {
  var mf = acre.require("MANIFEST").MF;
  var queries = mf.require("queries");
  
  var category = acre.request.params.id;
  var p_domains = queries.domains_for_category(category);
  
  mf.require("template", "renderer").render_def(
    null,
    mf.require("templates"),
    "explorer_panel",
    p_domains
  );
};

if (acre.current_script == acre.request.script) {
  main(this);
}
