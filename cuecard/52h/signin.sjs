var env = acre.environ;

if (env.path_info == '/login') {
  acre.oauth.get_authorization();
} else if (env.path_info == '/signout') {
  acre.oauth.remove_credentials();  
}

// hack until we get http headers set better
acre.freebase.touch();

var redirect_url = env.params.onsignin || '/';
acre.start_response(303, {
    Location: redirect_url
})