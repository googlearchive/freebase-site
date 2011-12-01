/**
 *  In Acre, the app metadata of the top-level request script determines 
 *  the keystore binding (project) and oauth providers that will be used 
 *  for the entire request, so we need to set those here
**/

var METADATA = {
  "project": "freebase-site.googlecode.dev",
  "oauth_providers": {
    "freebase" : {
      "redirect_URL": "https://" + acre.request.server_name + "/account/redirect"
    },
    "freebase_writeuser" : {
      "redirect_URL": "https://" + acre.request.server_name + "/account/redirect"
    }
  }
};
