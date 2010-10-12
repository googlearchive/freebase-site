/**
 * everything should go under the freebase namespace.
 */
window.freebase = window.fb = {mwLWTReloading: false};
if (typeof SERVER === "object" && SERVER.acre) {
	window.fb.acre = SERVER.acre;
}

// as early as possible, redirect if PAGE_LASTWRITEIME < mwLastWriteTime
(function($,fb) {

  // mwLWTReloaded is reset after a page load, to avoid a refresh
  // loop. More or less: only reload any given page once, but allow
  // future reloads. See the mwLWTReload reference later

  if ($.cookie("mwLWTReloaded")) {
    // clear the cookie, so that we can autorefresh again
    $.cookie("mwLWTReloaded", null, {path: "/"});
    return;
  }

  // the logic here is tricky. We want to refresh when:
  // - both values exist, and PAGE_LASTWRITEIME < mwLastWriteTime
  //   (means user has done a write since the page was generated, and
  //    needs to see a fresher version)

  // first look up string values - empty/undefined means there's no
  // such value
  var cookieName = "mwLastWriteTime";
  var cookie_lwt = 0;
  var page_lwt = 0;
  // in acre, PAGE_LASTWRITEIME is acre.request.cookies.mwLastWriteTime
  if (typeof fb.acre === "object" && fb.acre && fb.acre[cookieName]) {
    page_lwt = fb.acre[cookieName] || 0;
  }
  if (document.cookie && document.cookie != '') {
    var cookies = document.cookie.split(';');
    var cookieNameEqual = cookieName + "=";
    var cookieNameEqualLength = cookieNameEqual.length;
    for (var i = 0,l=cookies.length; i < l; i++) {
      var cookie = $.trim(cookies[i]);
      if (cookie.indexOf(cookieNameEqual) === 0) {
        var cookieValue = decodeURIComponent(cookie.substring(cookieNameEqualLength));
        var cookie_parts = cookieValue.split('|');
        if (cookie_parts.length) {
          cookie_lwt = cookie_parts[0];
        }
      }
    }
  }
  // now parse to integers - note that empty/undefined parses to NaN,
  // which behaves really strangely. For our own sanity, we'll convert
  // that to -1, since that always means "as old as possible"
  var cookie_lwt_v = cookie_lwt ? parseInt(cookie_lwt, 10) : -1;
  var page_lwt_v   = page_lwt   ? parseInt(page_lwt,   10) : -1;

  //console.log("cookie_lwt", cookie_lwt_v, "page_lwt", page_lwt_v);

  // the logic here may seem redundant, but getting this wrong means
  // the user gets stuck in an endless reload loop. Yikes.
  if (cookie_lwt && page_lwt && (page_lwt_v < cookie_lwt_v)) {
    // be sure to set the cookie so that the reloaded page knows it
    // came in as the result of a reload
    $.cookie("mwLWTReloaded", "true", { path: "/" });
    fb.mwLWTReloading = true;
    window.location.reload(true);
  }
})(jQuery, window.freebase);


(function($, fb) {

  if (fb.mwLWTReloading) {
    // we're in the process of reloading because of mwLastWriteTime
    // don't perform any inits
    return;
  }

  if (!window.console) {
    window.console = {
      log: $.noop,
      info: $.noop,
      debug: $.noop,
      warn: $.noop,
      error: $.noop
    };
  }

  /**
   * simple event dispatcher
   */
  fb.dispatch = function(event, fn, args, thisArg) {
    if (typeof fn !== "function") {
      return false;
    }
    event = $.event.fix(event || window.event);
    if (!args) {
      args = [];
    }
    if (!thisArg) {
      thisArg = this;
    }
    return fn.apply(thisArg, [event].concat(args));
  };

  /**
   * simple dynamic javascript loader which caches the script_url,
   * so that it does not do multiple gets and executions.
   */
  fb.get_script = function(script_url, callback) {
    var cache = fb.get_script.cache;
    // check_cache
    var cached = cache[script_url];
    if (cached) {
      if (cached.state === 1) {  // requesting
        // add to the list of callbacks
        cached.callbacks.push(callback);
      }
      else if (cached.state === 4) { // already loaded
        // immediately callback
        callback();
      }
    }
    else {
      // not yet requested
      cached = cache[script_url] = {
        state: 0, // initialized
        callbacks: [callback]
      };
      $.ajax({
        url: script_url,
        dataType: 'script',
        beforeSend: function() {
          cached.state = 1;
        },
        success: function() {
          cached.state = 4;
          $.each(cached.callbacks, function(i,callback) {
            callback();
          });
        },
        error: function() {
          // TODO: handle error
          cached.state = -1;
        }
      });
    }
  };
  fb.get_script.cache = {};

  /**
   * init user signed-in state
   *
   * 1. mw_user cookie
   * 2. set a fb.user object: {id:String, guid:String: name:String}
   * 3. update signin/out state
   */
   $(window)
     .bind("fb.user.signedin", function(e, user) {
       console.log("fb.user.signnedin");
       fb.user = user;
       // signed in
       var u = $("#nav-username a:first");
       if (u.length) {
         u[0].href += fb.user.id;
         u.text(fb.user.name);
       }
       $("#signedin").show();
     })
     .bind("fb.user.signedout", function(e) {
       console.log("fb.user.signedout");
       // signed out
       $("#signedout").show();
     });

  /**
   *  If metaweb client url? use metaweb-user-info cookie info
   */
  if (/^https?\:\/\/((www|devel)\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(fb.acre.request.app_url)) {
    /*
     * Returns a single item 'i' from a Metaweb cookie 'c'
     * Item codes: u=username, d=display name, g=guid, p=path
     */
    function cookieItem(c, i) {
      var s = c.indexOf('|'+i+'_');
      if (s != -1){
        s = s + 2 + i.length;
        var e = c.indexOf('|',s);
        if (e != -1) return decodeURIComponent(c.substr(s,e-s));
      }
      return null;
    };

    // get user info from cookie:
    var cookieInfo = $.cookie("metaweb-user-info");
    if (cookieInfo) {
      // 'g' = User GUID, 'u' = user account name, 'p' = path name of user obj
      var guid = cookieItem(cookieInfo, 'g');
      var name = cookieItem(cookieInfo, 'u');
      var id = cookieItem(cookieInfo, 'p');
      if (!id) {
        id = '/user/' + this.name;
      }
      setTimeout(function() {
        $(window).trigger("fb.user.signedin", {guid: guid, name: name, id: id});
      }, 0);
    }
    else {
      setTimeout(function() {
        $(window).trigger("fb.user.signedout");
      }, 0);
    }
  }
  else {
    $.ajax({
      url: "/acre/account/user_info",
      dataType: "json",
      success: function(data) {
        if (data && data.code === "/api/status/ok") {
          $(window).trigger("fb.user.signedin", {id: data.id, guid: data.guid, name: data.username});
        }
        else {
          $(window).trigger("fb.user.signedout");
        }
      },
      error: function() {
        $(window).trigger("fb.user.signedout");
      }
    });
  }

  /**
   * init freebase site header search box (suggest)
   */
  $(function() {
    var search = $("#SearchBox .SearchBox-input,#global-search-input");
    var root = fb.acre.freebase.site_host;

    search.suggest({
      service_url:root,
      soft:true,
      category: "object",
      parent: "#site-search-box",
      align: "right",
      status: null
    });
    var search_label = $("#site-search-label"),
    search_suggest = $("#site-search-box .fbs-pane");

    search
      .bind("fb-select", function(e, data) {
         window.location = root + "/view" + data.id;
        return false;
      })
      .bind("fb-pane-show", function(e, data) {
        search_label.html("<span>Select an item from the list</span>").removeClass("loading");
      })
      .bind("fb-textchange", function (e, data) {
        if ($.trim(search.val()) === "") {
          search_label.html("<span>Start typing to get some suggestions</span>").removeClass("loading");
        }
        else {
          search_label.html("<span>Searching...</span>").addClass("loading");
        }
      })
      .bind("fb-error", function() {
        search_label.html("<span>Sorry, something went wrong. Please try again later</span>").removeClass("loading");
      })
      .focus(function(e) {
        if (!search_label.is(":visible")) {
          $('#site-search-label').slideDown("fast");
        }
      })
      .blur(function(e) {
        if (!search_suggest.is(":visible") && search_label.is(":visible")) {
          $('#site-search-label').slideUp("fast");
        }
      });

      $('.SearchBox-form').submit(function(e) {
        /* Do not allow form to be submitted without content */
        if ($.trim($("#global-search-input").val()).length == 0){
          return false;
        }
        else{
          return true;
        }
      });

      $('input, textarea').textPlaceholder();
    });

  /**
   * enable/disable and html element
   */
   fb.disable = function(elt) {
     $(elt).attr("disabled", "disabled").addClass("disabled");
   };

   fb.enable = function(elt) {
     $(elt).removeAttr("disabled").removeClass("disabled");
   };

   fb.lang_select = function(e, lang) {
     setTimeout(function() {
       $(window).trigger("fb.lang.select", lang);
     }, 0);
   };

   fb.devbar = {
     div: $("#devbar"),

     keydown: function(e) {
       // check for f8 key:119, f12:123 + ctrl or shift modifiers
       // or just in case those don't work,
       // check for ctrl+shift+d
       if (e.keyCode == 119 || e.keyCode == 123 ||
           (e.keyCode == 68 && e.shiftKey && e.ctrlKey))
         fb.devbar.toggle();
       return true;
     },

     toggle: function() {
       if (fb.devbar.div.is(":visible")) {
         fb.devbar.div.hide();
         $.localstore("devbar2", false);
       }
       else {
         fb.devbar.div.show();
         $.localstore("devbar2", true);
       }
       return false;
     },

     touch: function() {
       if (/^https?\:\/\/((www|devel)\.)?(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(fb.acre.request.app_url)) {
         $.ajax({
           url: fb.acre.freebase.service_url + "/api/service/touch",
           dataType: "jsonp"
         });
       }
       else {
         $.ajax({url: "/acre/touch"});
       }
       return false;
     },

     txn_ids: [],
     txn: function(e) {
       return fb.devbar.view_txn(this.href, fb.devbar.txn_ids);
     },

     view_txn: function(base_url, ids) {
       if (ids && ids.length) {
         window.location = base_url + "?" + $.param({tid:ids}, true);
       }
       return false;
     },

     ajaxComplete: function(xhr, status) {
       if (xhr && xhr.readyState === 4) {
         var tid = xhr.getResponseHeader("x-metaweb-tid");
         if (tid) {
           fb.devbar.txn_ids.push(tid);
         }
       }
     },

     init: function() {
       $.localstore("devbar2") ? fb.devbar.div.show() : fb.devbar.div.hide();
       $(document).keydown(fb.devbar.keydown);
       $("#devbar-toggle > a").click(fb.devbar.toggle);
       $("#devbar-touch > a").click(fb.devbar.touch);
       if (fb.acre.tid) {
         fb.devbar.txn_ids.push(fb.acre.tid);
       }
       $("#devbar-txn > a").click(fb.devbar.txn);
       $.ajaxSetup({complete:fb.devbar.ajaxComplete});
     }
   };
   fb.devbar.init();

})(jQuery, window.freebase);
