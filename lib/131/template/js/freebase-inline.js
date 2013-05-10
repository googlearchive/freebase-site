// as early as possible, redirect if PAGE_LASTWRITEIME < mwLastWriteTime
;(function(SERVER) {

  // Since we need to parse cookies in the HEAD, we need to load this before jQuery
  // freebase.js copies this over to jQuery later
  SERVER.cookie = function(name, value, options) {
      if (typeof value != 'undefined') { // name and value given, set cookie
          options = options || {};
          if (value === null) {
              value = '';
              options.expires = -1;
          }
          var expires = '';
          if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
              var date;
              if (typeof options.expires == 'number') {
                  date = new Date();
                  date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
              } else {
                  date = options.expires;
              }
              expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
          }
          var path = options.path ? '; path=' + (options.path) : '';
          var domain = options.domain ? '; domain=' + (options.domain) : '';
          var secure = options.secure ? '; secure' : '';
          document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
      } else { // only name given, get cookie
          var cookieValue = null;
          if (document.cookie && document.cookie != '') {
              var cookies = document.cookie.split(';');
              for (var i = 0; i < cookies.length; i++) {
                  var cookie = cookies[i].trim();
                  // Does this cookie string begin with the name we want?
                  if (cookie.substring(0, name.length + 1) == (name + '=')) {
                      cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                      break;
                  }
              }
          }
          return cookieValue;
      }
  };

  // Get last guid from cookie string
  function getGuidFromDateline(dateline) {
    // Find trailing alphanumeric string
    var str = dateline.match(/\w+$/g);
    return str ? str[0] : '';
  }

  // Returns true if first param cookie is newer than second one.
  // Example of a Cookie string:
  //    "v1sandbox=1362184156000,9202a8c04000641f800000002e3e12db"
  function isCookieNewer(cookie, serverCookie) {
    if (!cookie || !serverCookie) { return; }
    // Trim leading and trailing quote
    cookie.replace(/^"|"$/g, '');
    // Compare strings
    return getGuidFromDateline(cookie) > getGuidFromDateline(serverCookie);
  }

  // fb-dateline-reload is reset after a page load, to avoid a refresh
  // loop. More or less: only reload any given page once, but allow
  // future reloads. See the fb-dateline-reload reference later
  if (SERVER.cookie("fb-dateline-reload")) {
    // clear the cookie, so that we can autorefresh again
    SERVER.cookie("fb-dateline-reload", null, {path: "/"});
    return;
  }

  // Check if dateline is greater
  if (isCookieNewer(SERVER.cookie("fb-dateline"), SERVER["dateline"])) {
    // be sure to set the cookie so that the reloaded page knows it
    // came in as the result of a reload
    SERVER.cookie("fb-dateline-reload", "true", { path: "/" });
    SERVER.datelineReloading = true;
    window.location.reload(true);
  }

})(window.SERVER);
