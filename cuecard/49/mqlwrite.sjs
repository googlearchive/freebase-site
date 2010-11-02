function process() {
  var user = acre.freebase.get_user_info();
  if (user) {
    var queryString = acre.environ.params["query"];
    if (queryString == null || queryStringlength == 0) {
      queryString = acre.environ.body_params["query"];
    }
    
    var queryEnvelope = JSON.parse(queryString);
    
    var response;
    var error = null;
    var query = queryEnvelope.query;
    delete queryEnvelope.query;
     
    if ("service" in acre.request.params) {
      var serviceHost = acre.request.params["service"];
      var provider = {
        domain                 : serviceHost,
        request_token_URL      : "https://" + serviceHost + "/api/oauth/request_token",
        access_token_URL       : "https://" + serviceHost + "/api/oauth/access_token",
        user_authorization_URL : "https://" + serviceHost + "/signin/app"
      };
      acre.oauth.providers.freebase = provider;
      acre.oauth.get_authorization();
    }
      
    try {
      response = acre.freebase.mqlwrite(query, queryEnvelope);
    } catch (e) {
      error = e;
      response = e.response || e;
    }
    acre.write('{ "headers": ');
    acre.write("headers" in response ? JSON.stringify(response.headers) : "{}");
    acre.write(', "body": ');
    acre.write("body" in response ? response.body : JSON.stringify(response));
    if (error != null) {
      acre.write(', "error": ' + JSON.stringify(error.message));
    }
    acre.write(" }");
  } else {
    acre.write('{ "error": "unauthorized" }');
  }
}

if (acre.environ.request_method != "POST") {
  acre.start_response(500);
  acre.write(JSON.stringify({ "status" : 500, "error" : "HTTP GET not supported." }));
} else {
  var callback = acre.environ.params["callback"];
  acre.start_response(200);
  if (callback) {
    acre.write(callback + "(");
  }
  process();
  if (callback) {
    acre.write(")");
  }
}