// as early as possible, redirect if PAGE_LASTWRITEIME < mwLastWriteTime
;(function() {
  
  var cookie = function(name, value, options) {
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
  
  // mwLWTReloaded is reset after a page load, to avoid a refresh
  // loop. More or less: only reload any given page once, but allow
  // future reloads. See the mwLWTReload reference later
  if (cookie("mwLWTReloaded")) {
    // clear the cookie, so that we can autorefresh again
    cookie("mwLWTReloaded", null, {path: "/"});
    return;
  }

  var cookie_lwt = cookie("mwLastWriteTime");
  var page_lwt = SERVER["mwLastWriteTime"]; // written into the page server-side (acre.request.cookies.mwLastWriteTime)

  // now parse to integers - note that empty/undefined parses to NaN,
  // which behaves really strangely. For our own sanity, we'll convert
  // that to -1, since that always means "as old as possible"
  var cookie_lwt_v = cookie_lwt ? parseInt(cookie_lwt, 10) : -1;
  var page_lwt_v   = page_lwt   ? parseInt(page_lwt,   10) : -1;

  //console.log("cookie_lwt", cookie_lwt_v, "page_lwt", page_lwt_v);

  if (page_lwt_v < cookie_lwt_v) {
    // be sure to set the cookie so that the reloaded page knows it
    // came in as the result of a reload
    cookie("mwLWTReloaded", "true", { path: "/" });
    SERVER.mwLWTReloading = true;
    window.location.reload(true);
  }
})();