/**
 * everything should go under the freebase namespace.
 */
window.freebase = window.fb = {};


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
 * init user signed-in state
 */
(function($, fb) {
  /**
   * 1. mw_user cookie
   * 2. set a fb.user object: {id:String, guid:String: name:String}
   * 3. update signin/out state
   */

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
    fb.user = {
      guid: guid,
      name: name,
      id: id
    };
  }

  if (fb.user) {
    // signed in
    var u = $("#nav-username a:first");
    if (u.length) {
      u[0].href += fb.user.id;
      u.text(fb.user.name);
    }
    $("#signedin").show();
  }
  else {
    // signed out
    $("#signedout").show();
  }
})(jQuery, window.freebase);


/**
 * init freebase site header search box (suggest)
 */
(function($, fb){
  $(function() {
    var search = $("#SearchBox .SearchBox-input,#global-search-input");
    var root =  document.location.protocol + "//www.freebase.com";

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

    });
})(jQuery, window.freebase);

(function($, fb) {
  var tb = fb.toolbox = {
    toggle: function(event, url) {
      if (!fb.user) {
        // not signed-in, navigate to landing page
        return true;
      }

      var a = event.target;
      var expanded = $(a).hasClass("collapse");

      console.log("popup expanded", expanded);

      // hide all toolboxes
      tb.hide_all();

      // if expanded, nothing else to do
      if (expanded) {
        return false;
      }

      // if popup panel already exists, just show it
      var popup = $(a).data("popup");
      if (popup) {
        popup.slideDown(function() {
          $(a).removeClass("expand").addClass("collapse");
        });
        return false;
      }

      // dynamically create a new popup panel
      popup = $('<div class="popup popup-loading toolbox-popup" style="display:none;position:absolute;">');
      $(document.body).append(popup);
      $(a).data("popup", popup);

      // get contents of popup
      $.ajax({
        url: url,
        dataType: "jsonp",
        data: {
          id: fb.user.id
        },
        success: function(data) {
          popup.html(data.result.html);
          popup.removeClass("popup-loading");
        }
      });

      // show popup
      popup.position({
        of: $(a).parent("li"),
        my: "left top",
        at: "left bottom"
      });

      popup.slideDown(function() {
        $(a).removeClass("expand").addClass("collapse");
      });

      return false;
    },

    hide_all: function() {
      $(".nav-global-menu > a").each(function() {
        var a = this;
        var popup = $(this).data("popup");
        if (popup) {
          popup.slideUp(function() {
            $(a).removeClass("collapse").addClass("expand");
          });
        }
      });
    }
  };

  // if fb.user, show expand for all toolboxes
  if (fb.user) {
    $(".nav-global-menu > a").addClass("expand");
  }
})(jQuery, window.freebase);

