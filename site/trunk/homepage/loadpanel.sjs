var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");

var category = acre.request.params.id;
var p_domains = queries.domains_for_category(category);

mf.require("template", "renderer").render_def(
  null,
  mf.require("templates"),
  "category_panel",
  p_domains
);
