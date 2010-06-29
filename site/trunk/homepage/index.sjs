var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");

var queries = {
  "categories": queries.categories(),
  "grouped_domains": queries.alphabetically_grouped_commons_domains()
};

mf.require("template", "renderer").render_page(
  queries,
  mf.require("index_template")
);
