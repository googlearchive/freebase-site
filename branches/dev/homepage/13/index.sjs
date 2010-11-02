var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");

var data = {
  "categories": queries.categories(),
  "blog": queries.blog_entries(),
  "wiki": queries.wiki_entries(),
  "reg_off": queries.is_registration_off()
};

mf.require("template", "renderer").render_page(
  data,
  mf.require("index_template")
);

mf.require("core", "cache").set_cache_policy("public");