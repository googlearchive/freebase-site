var mf = acre.require("MANIFEST").MF;
var queries = mf.require("queries");

var loggedin_user = acre.freebase.get_user_info();
if (acre.request.params.id) {
  user_id = acre.request.params.id;
} else if (loggedin_user){
  user_id = loggedin_user.id;
} else {
  // If the user is not logged-in then redirect to the logged-out homepage
  acre.response.status = 302;
  acre.response.set_header("Location", "/");
  acre.exit();
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
