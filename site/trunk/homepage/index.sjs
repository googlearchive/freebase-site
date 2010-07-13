var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");

var data = {
  "categories": queries.categories(),
  "grouped_domains": queries.alphabetically_grouped_commons_domains(),
  "blog": queries.blog_entries(),
  "wiki": queries.wiki_entries(),
  "loaded_categories": queries.categories()
};

mf.require("template", "renderer").render_page(
  data,
  mf.require("index_template")
);
