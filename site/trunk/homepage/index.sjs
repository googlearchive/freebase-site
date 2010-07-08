var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");

var p_categories = queries.categories();
/*
// Don't preload the first category. A fast page load it better.
var p_loaded = p_categories.then(function(categories) {
  var first_category_id = categories[0].id;
  return queries.domains_for_category(first_category_id).then(function(domains) {
    var loaded = {};
    loaded[first_category_id] = domains;
    return loaded;
  });
});*/

var data = {
  "categories": p_categories,
  "grouped_domains": queries.alphabetically_grouped_commons_domains(),
  "blog": queries.blog_entries(),
  "wiki": queries.wiki_entries()
  //"loaded_categories": p_loaded
};

mf.require("template", "renderer").render_page(
  data,
  mf.require("index_template")
);
