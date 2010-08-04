/**
 * everything should go under the freebase namespace.
 */
window.freebase = window.fb = {};
if (!window.console) {
  window.console = {
    log: function() {}, info: function() {}, debug:function() {},
    warn:function() {}, error:function() {}
  };
}

/**
 * simple event dispatcher
 */
(function($, fb) {
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
})(jQuery, window.freebase);

/**
 * simple dynamic javascript loader which caches the script_url,
 * so that it does not do multiple gets and executions.
 */
(function($, fb) {
  var cache = {};    
  fb.get_script = function(script_url, callback) {
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
})(jQuery, window.freebase);


/**
 * init user signed-in state
 */
(function($, fb) {
  /**
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
  if (/^https?\:\/\/devel\.(freebase|sandbox\-freebase|branch\.qa\.metaweb|trunk\.qa\.metaweb)\.com(\:\d+)?/.test(acre.request.app_url)) {
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
      $(window).trigger("fb.user.signedin", {guid: guid, name: name, id: id});
    }
    else {
      $(window).trigger("fb.user.signedout");
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
})(jQuery, window.freebase);


/**
 * init freebase site header search box (suggest)
 */
(function($, fb){
  $(function() {
    var search = $("#SearchBox .SearchBox-input,#global-search-input");
    var root = acre.freebase.site_host;

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
})(jQuery, window.freebase);
