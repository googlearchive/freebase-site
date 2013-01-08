/**
 *  In Acre, the app metadata of the top-level request script determines
 *  the keystore binding (project) and oauth providers that will be used
 *  for the entire request, so we need to set those here
**/

var METADATA = {
  "project": "freebase-site.googlecode.dev",
  "owners": [
    "jasondouglas@google.com",
    "masouras@google.com",
    "bneutra@google.com",
    "daepark@google.com",
    "kconragan@google.com",
    "pmikota@google.com"
  ],
  "oauth_providers": {
    "freebase" : {
      "redirect_URL": "https://" + acre.request.server_name + "/account/signedin"
    },
    "freebase_writeuser" : {
      "redirect_URL": "https://" + acre.request.server_name + "/account/signedin"
    }
  }
};
