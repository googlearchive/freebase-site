/**
 *  In Acre, the app metadata of the top-level request script determines 
 *  the keystore binding (project) and oauth providers that will be used 
 *  for the entire request, so we need to set those here
**/

var host = acre.request.server_name;
var host_frags = host.split(".");
var env = host_frags[host_frags.length - 2];

var sandbox = {
  "name": "freebase",
  "domain": "www.googleapis.com",
  "service_url_prefix": "/freebase/v1-sandbox",
  "access_token_URL": "https://sandbox.google.com/o/oauth2/token",
  "refresh_token_URL": "https://sandbox.google.com/o/oauth2/token",
  "user_authorization_URL": "https://sandbox.google.com/o/oauth2/auth",
  "redirect_URL": "https://" + host + "/account/redirect"
};

var otg = {
  "name": "freebase",
  "domain": "www.googleapis.com",
  "service_url_prefix": "/freebase/v1",
  "redirect_URL": "https://" + host + "/account/redirect"
}

var METADATA = {
  "project": "freebase-site.googlecode.dev",
  "oauth_providers": {
    "freebase" : (env === "sandbox-freebase" ? sandbox : otg)
  }
};
