var callback = acre.request.params["callback"];

acre.response.status = 200;
if (callback) {
  acre.write(callback + "(");
}

var response;
var error = null;
var url;
var clientIP = acre.request.headers["x-client-ip"] || "";

function endsWith(s1, s2) {
  return s1.length >= s2.length && s1.substring(s1.length - s2.length) == s2;
}

try {
  var query = acre.request.params["query"];
  if (query == null || query.length == 0) {
    query = acre.request.body_params["query"];
  }
  
  if (acre.request.params["emql"] == 1) {
    var o = JSON.parse(query);
    url = "http://search.labs.freebase.com/api/service/emql?query=" + encodeURIComponent(JSON.stringify(o.query)) + "&indent=1";
    if ("debug" in acre.request.params) {
      url += "&debug=" + acre.request.params.debug;
    }
    response = acre.urlfetch(url);
  } else {
    var url = acre.freebase.service_url + "/api/service/mqlread";
    if ("service" in acre.request.params) {
      url = acre.request.params["service"];
      if (url.indexOf("/") < 0) {
        url = "http://" + url + "/api/service/mqlread";
      }
    }
    
    var form = { query: query };
    if (acre.request.params["extended"] == 1) {
      form.extended = 1;
    }
    
    var payload = acre.form.encode(form);
    var headers = {
      'User-Agent' : 'Freebase ACRE',
      'Content-type' : 'application/x-www-form-urlencoded',
      'X-Client-IP' : clientIP
    };
    
    response = acre.urlfetch(url, "POST", headers, payload);
  }
} catch (e) {
  error = e;
  response = e.response;
}

acre.write('{ "headers": ');
acre.write((response != null && "headers" in response) ? JSON.stringify(response.headers) : {});
acre.write(', "serviceUrl": '); acre.write("\"" + url + "\"");
acre.write(', "clientIP": '); acre.write("\"" + clientIP + "\"");
acre.write(', "body": ');
if (response != null && "body" in response) {
  while (true) {
    try {
      o = JSON.parse(response.body); // just try to parse the JSON
      if (o != undefined && o != null) {
        acre.write(JSON.stringify(o));
        break;
      }
    } catch (e) {
    }
    acre.write("{ \"error\" : \"Bad JSON stream\" }");
    break;
  }
} else {
  acre.write("{}");
}
if (error != null) {
  acre.write(", error: " + JSON.stringify(error.message));
}
acre.write(" }");

if (callback) {
  acre.write(")");
}