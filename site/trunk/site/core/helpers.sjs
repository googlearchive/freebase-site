

function account_url(kind, return_url) {
  var is_client    = /^https?:\/\/(www\.)?(freebase|sandbox\-freebase|branch\.qa\.freebase|trunk\.qa\.freebase)\.com\//.test(acre.request.base_url);

  var client_base  = acre.freebase.site_host;
  var sclient_base = acre.freebase.site_host.replace(/^http/,"https");
  if (return_url) { return_url = encodeURIComponent(return_url); }

  var url;
  switch (kind) {
    case "signin" :
      if (is_client) {
        url = sclient_base +  "/signin/login?mw_cookie_scope=domain";
        if (return_url) { url += "&onsignin=" + return_url; }
      } else {
        url = "/acre/account/signin";
        if (return_url) { url += "?onsucceed=" + return_url; }
      }
      break;
    case "signout" :
      if (is_client) {
        url = sclient_base  + "/api/account/logout?mw_cookie_scope=domain";
        if (return_url) { url += "&onsucceed=" + return_url; }
      } else {
        url = "/acre/account/signout";
        if (return_url) { url += "?onsucceed=" + return_url; }
      }
      break;
    case "register" :
      url = client_base + "/signin/register";
      break;
    case "settings" :
      url = client_base + "/user/account?mw_cookie_scope=domain";
      if (return_url) { url += "&done=" + return_url; }
      break;
    default :
      url = client_base;
      break;
  }
  return url;
};

function total_topics(type) {
  var type_id = type ? type : "/common/topic";
  var d = new Date();
  var t = acre.freebase.date_to_iso(d).substring(0,10);
  var q = {
    'id' : type_id,
    '/freebase/type_profile/instance_count' : null
  };
  var r = acre.freebase.mqlread(q, { 'as_of_time' : t }).result;
  if (r['/freebase/type_profile/instance_count']) {
    return r['/freebase/type_profile/instance_count'];
  }
  return 0;
}

function sitewide_topic_count() {
  var count = total_topics();
  return Math.round(count/1000000) + " million";
}
