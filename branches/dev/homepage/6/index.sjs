var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");
var cache = mf.require("core", "cache");

var data = {
  "categories": queries.categories(),
  "blog": queries.blog_entries(),
  "wiki": queries.wiki_entries()
};

cache.set_cache_header("public");

mf.require("template", "renderer").render_page(
  data,
  mf.require("index_template")
);
