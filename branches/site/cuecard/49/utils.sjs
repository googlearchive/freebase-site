function getBaseURL() {
  var url = acre.environ.request_url;
  
  var q = url.indexOf("?");
  if (q > 0) {
    url = url.substr(0, q);
  }
  var hash = url.indexOf("#");
  if (hash > 0) {
    url = url.substr(0, hash);
  }
  
  var x = url.lastIndexOf(acre.environ.script_name);
  if (x > 0) {
    baseURL = url.substr(0, x);
  } else {
    baseURL = url + (url.endsWith("/") ? "" : "/");
  }
  
  return baseURL;
}