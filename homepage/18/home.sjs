var mf = acre.require("MANIFEST").mf;
var queries = mf.require("queries");
var h = mf.require("helpers");


var loggedin_user = acre.freebase.get_user_info();
if (acre.request.params.id) {
  user_id = acre.request.params.id;
} else if (loggedin_user){
  user_id = loggedin_user.id;
} else {
  // If the user is not logged-in then redirect to the logged-out homepage
  acre.response.status = 302;
  var logout_url = h.account_url("signout", h.url_for("homepage", "index"));
  acre.response.set_header("Location", logout_url);
  acre.exit();
}

var data = {
  "categories": queries.categories(),
  "blog": queries.blog_entries(),
  "wiki": queries.wiki_entries(),
  "user": queries.user_info(user_id),
  "has_membership": queries.has_membership(user_id)
};

mf.require("template", "renderer").render_page(
  data,
  mf.require("home_template")
);

mf.require("core", "cache").set_cache_policy("nocache");