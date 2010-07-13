var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");

var user_id;
if (acre.request.params.id) {
  user_id = acre.request.params.id;
} else {
  user_id = acre.freebase.get_user_info();
}

var data = {
  "categories": queries.categories(),
  "grouped_domains": queries.alphabetically_grouped_commons_domains(),
  "blog": queries.blog_entries(),
  "wiki": queries.wiki_entries(),
  "user": queries.user_info(user_id)
};

mf.require("template", "renderer").render_page(
  data,
  mf.require("home_template")
);
