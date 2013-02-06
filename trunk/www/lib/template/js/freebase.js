/*
 * Copyright 2012, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * everything should go under the freebase namespace.
 */
;(function($) {
  window.freebase = window.fb = {mwLWTReloading: false};
  if (window.SERVER && typeof window.SERVER === "object") {
    $.extend(window.freebase, window.SERVER);
  }

  // copy over our inlined cookie function
  $.cookie = window.freebase.cookie;
})(jQuery);

(function($, fb) {

  // Use traditional param
  $.ajaxSettings.traditional = true;

  if (fb.datelineReloading) {
    // we're in the process of reloading because of a
    // dateline change don't perform any inits
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
        cache: true,
        beforeSend: function() {
          cached.state = 1;
        },
        success: function() {
          cached.state = 4;
          $.each(cached.callbacks, function(i,callback) {
            callback();
          });
        },
        error: function(xhr, status, error) {
          cached.state = -1;
          console.error("fb.get_script error", arguments);
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
       //console.log("fb.user.signedin", user.id);
       fb.user = user;
       // signed in
       var u = $("#nav-username");
       if (u.length) {
         // update username
         $("> a", u).text(user.name);

         //console.log(fb.user, fb.user.id, fb.user.name);
         u[0].href += fb.user.id.substring(1);
         var MAX_SIZE = 40;
         var MODE = "fillcropmid";
         var params = {
           maxwidth: MAX_SIZE,
           maxheight: MAX_SIZE,
           mode: MODE
         };
         var image_api = fb.h.image_url(user.id, params);
         var user_image = $('<a class="user-thumb" href="' + user.id + '"><img src="' + image_api + '" /></a>');
         u.prepend(user_image);
       }
       $("#signedin").show();
       $(".signedin").show();
     })
     .bind("fb.user.signedout", function(e) {
       //console.log("fb.user.signedout");
       // signed out
       $("#signedout").show();
       $(".signedout").show();
     })
     .bind("fb.user.unauthorized", function() {
       // TODO: invoke fb.login_popup() without the popup blocker
       // for now, go directly to signin page
       window.location.href = fb.h.fb_url("/account/signin", {onsignin:window.location.href});
     })
     .bind("fb.user.feedback", function(e, data) {
       if (confirm("Uh oh! Something went wrong. Please report this using our feedback tool.")) {
         try {
           userfeedback.api.startFeedback({
             productId: '68931',
             disableScrolling: false
           }, data);
           return false;
         }
         catch(e) {
         }
       }
     });

  // get user info from cookie:
  var account_name = $.cookie("fb-account-name");
  if (account_name) {
    var user = {
      id: '/user/'+account_name,
      name: account_name
    };
    setTimeout(function() {
      $(window).trigger("fb.user.signedin", user);

      // Automatically refresh oauth2 credentials when on the same page for a long time;
      // Because of redirects, etc., this only works with an iframe rather than ajax
      var rc_url = fb.h.ajax_url("lib/template/refresh_credentials");
      var rc_iframe = $("<iframe name='rc'></iframe>")
        .attr("src", rc_url).hide().appendTo("body")
        .load(function() {
          var expires = parseInt($("body", window.rc.document).text(), 10);
          var timeout = expires - new Date().getTime();
          if (timeout && timeout > 0) {
            setTimeout(function() {
              $(rc_iframe).attr("src", rc_url);
            }, timeout);
          }
        });

    }, 0);
  }
  else {
    setTimeout(function() {
      $(window).trigger("fb.user.signedout");
    }, 0);
  }


  fb.window_position = function() {
    var position = {};

    if (typeof(window.innerWidth) == 'number' ) {
      //Non-IE
      position['width'] = window.outerWidth;
      position['height'] = window.outerHeight;
      position['top'] = window.screenY;
      position['left'] = window.screenX;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
      //IE 6+ in 'standards compliant mode'
      position['width'] = document.body.clientWidth;
      position['height'] = document.body.clientHeight;
      position['top'] = window.screenTop;
      position['left'] = window.screenLeft;
    }

    return position;
  };

  fb.status = (function(){
      var SECONDS = 1000;
      var LOG_TYPES = ['notice', 'info', 'warning', 'success', 'error'];
      var page_state = null;
      var status_msg = null;
      var close = null;
      var timer = null;
      var last_level = null;
                   
      function _hide() {
          if (page_state) {
              page_state.slideUp(300);
          }
          last_level = null;
          return false;
      };

      function _show(log_type, str, duration, sticky) {
          if (page_state === null) {
              page_state = $('#page-state');
              status_msg = $(".status-msg", page_state);
              close = $(".close-msg", page_state);
              close.click(_hide);
          }
          if (last_level === 'error') {
              // If we already displaying an error then don't display any more messages
              // (The previous error should have terminated all tasks, so we shouldn't get here)
              console.warn('MessagePanel: Already displaying error. Ignoring: ', log_type, str);
          }
          else {
              page_state.hide();
              $.each(LOG_TYPES, function(i, t) {
                  page_state.removeClass(t);
              });
              page_state.addClass(log_type);
              status_msg.text(str);                  
              last_level = log_type;
              window.clearTimeout(timer);
              if (sticky) {
                  close.show();
                  page_state.slideDown(300);
              }
              else {
                  close.hide();
                  page_state.slideDown(300);
                  timer = window.setTimeout(_hide, duration);
              }
          }
          return false;
      };

      function _clear() {
          window.clearTimeout(timer);
          if (last_level === 'error') {
              console.warn('MessagePanel: Displaying error. Ignoring clearing status.');
          }
          else {
              _hide();
          }
      };

      return {
          doing: function(str) {
              // doing() is for tasks that take time.
              // The message should be cancelled with clear().
              return _show('notice', str, 2000 * SECONDS, false);
          },
          info: function(str, sticky) {
              return _show('info', str, 4 * SECONDS, sticky);
          },
          warning: function(str, sticky) {
              return _show('warning', str, 4 * SECONDS, sticky);
          },
          success: function(str, sticky) {
              return _show('success', str, 6 * SECONDS, sticky);
          },
          error: function(str, sticky) {
              return _show('error', str, 6 * SECONDS, sticky);
          },
          /**
           * A safe way to include <a> links into the status message:
           * 
           * fb.status.sprintf('warning', 'click on %s or %s', 'me1', me1_click_handler, 'me2', me2_click_handler);
           */
          sprintf: function(logtype, str/**, a1, a1_onclick, a2, a2_onclick, ... */) {
              var args = Array.prototype.slice.call(arguments).slice(2);
              var parts = str.split("%s");
              if (parts.length > 1 && args.length > 1 && args.length % 2 == 0) {
                  var msg = $("<span>");
                  for (var i=0,l=parts.length; i<l; i++) {
                      msg.append(document.createTextNode(parts[i]));
                      var a = $('<a href="#">');
                      a.text(args.shift());
                      var onclick = args.shift();
                      if ($.type(onclick) === "function") {
                          a.click(onclick);
                      }
                      msg.append(a);
                  }
                  var s = _show(logtype, "", null, true);
                  status_msg.empty().append(msg);                  
                  return s;
              }
              else {
                  return _show(logtype, str, null, true);
              }
          },
          clear : _clear
      };
  })();

  fb.popup = function(url, width, height, windowname) {
    width = width || 300;
    height = height || 300;

    var pos = fb.window_position();
    var left = Math.floor((pos['width']-width)/2) + pos['left'];
    var top = Math.floor((pos['height']-height)/2) + pos['top'];

    // Chrome might fix this bug, but until then add some padding
    //  to the height of the popup for the urlbar
    var is_chrome = /chrome/.test(navigator.userAgent.toLowerCase());
    if (is_chrome) {
        height += 50;
    }

    var params = {
      width: width,
      height: height,
      top: top,
      left: left,
      directories: 'no',
      location: 'no',
      menubar: 'no',
      resizable: 'no',
      scrollbars: 'yes',
      status: 'no',
      toolbar: 'no'
    };

    var params_list = [];
    for (var key in params) {
      params_list.push(key+"="+params[key]);
    }
    return window.open(url, windowname || "", params_list.join());
  };

  fb.login_popup = function(success) {
    var width = 900;
    var height = 600;

    if (!success) {
      success = function(data) {
        window.location.reload();
      };
    }

    var newwin = fb.popup("/account/signin", width, height, "Freebase");

    if (newwin.opener == null) newwin.opener = self;
    window.onsignin = success;
    if (window.focus) {
      newwin.focus();
    }
    return false;
  };

  fb.logout_popup = function(success) {
    var width = 900;
    var height = 600;

    if (!success) {
      success = function(data) {
        window.location.reload();
      };
    }

    var newwin = fb.popup("/account/signout", width, height, "Freebase");

    if (newwin.opener == null) newwin.opener = self;
    window.onsignout = success;
    if (window.focus) {
      newwin.focus();
    }
    return false;
  };

  /**
   * init universal language picker
   */

  $(function() {
    var $picker = $("#header > #nav-utilities > .language-picker");
    var $label = $(".current-lang", $picker);
    var $dropdown = $("select", $picker).bind("change", function(e){
      var $selected = $(this).find(":selected").text();
      $label.text($selected);
    });
  });

  /**
   * Add all suggest options helpers here
   */
  $(function() {
    /**
     * fb.suggest_options now serve as an interface (as well as actual implementation)
     * for various components (i.e., propbox - jquery.data_input.js).
     */

    // current langs supported by search
    fb.suggest_lang = {
      SUPPORTED: {
        en:1, es:1, fr:1, de:1, it:1, pt:1, zh:1, ja:1, ko:1,
        ru:1, sv:1, fi:1, da:1, nl:1, el:1, ro:1, tr:1, hu:1
      },

      lang: function(lang) {
        lang = fb.h.lang_code(lang || fb.lang || "/lang/en");
        if (fb.suggest_lang.SUPPORTED[lang]) {
          if (lang !== "en") {
            // en is the fallback language
            return lang += ",en";
          }
        }
        return "en";
      }
    };

    fb.suggest_options = {

      service_defaults: {
        status: ["", "Searching...", "Select an item from the list:"],
        service_url: fb.h.fb_googleapis_url(),
        key: fb.acre.freebase.api_key,
        lang: fb.suggest_lang.lang()
      },

      /**
       * suggest filter operators: operator, any, all, should
       *
       * These filter operators return a valid filter value for search
       */
      filter: {

        operator: function(/** any|all|should, filter_1, filter_2, ..., filter_N **/) {
          var args = Array.prototype.slice.call(arguments);
          var op = args.shift();
          // assert op is any|all|should
          if (! (op === "any" || op === "all" || op === "should")) {
            throw "Invalid search operator: " + op;
          }
          var filters = [op];
          if (op === "should" && args.length > 1) {
            // "should" only takes one argument. Wrap all filters inside "any"
            var should_args = ["any"].concat(args);
            filters.push(fb.suggest_options.filter.operator.apply(null, should_args));
          }
          else {
            filters = filters.concat(args);
          }
          return "(" + filters.join(" ") + ")";
        },

        any: function(/** filter_1, filter_2, ..., filter_N **/) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift("any");
          return fb.suggest_options.filter.operator.apply(null, args);
        },

        all: function(/** filter_1, filter_2, ..., filter_N **/) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift("all");
          return fb.suggest_options.filter.operator.apply(null, args);
        },

        should: function(/** filter_1, filter_2, ..., filter_N **/) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift("should");
          return fb.suggest_options.filter.operator.apply(null, args);
        }
      },

      /**
       * These convenience methods (any, all, should), return full suggest options
       */
      any: function(/** filter_1, filter_2, ..., filter_N **/) {
        var o = $.extend({}, fb.suggest_options.service_defaults);
        o.filter = fb.suggest_options.filter.any.apply(null, arguments);
        return o;
      },
      all: function(/** filter_1, filter_2, ..., filter_N **/) {
        var o = $.extend({}, fb.suggest_options.service_defaults);
        o.filter = fb.suggest_options.filter.all.apply(null, arguments);
        return o;
      },
      should: function(/** filter_1, filter_2, ..., filter_N **/) {
        var o = $.extend({}, fb.suggest_options.service_defaults);
        o.filter = fb.suggest_options.filter.should.apply(null, arguments);
        return o;
      },

      /**
       *  suggest option for site search
       */
      search: function() {
        var o = $.extend({}, fb.suggest_options.service_defaults, {
          status: null,
          parent: "#site-search-box",
          align: "right",
          filter: '(not type:/common/document)',
          soft: true
        });
        return o;
      },

      /**
       * Used when linking to an existing topic
       */
      instance: function(type, create_new, lang) {
        var filters = [
          "type:" + type
        ];
        // If freebase profile type (i.e. /freebase/[user|domain|type]_profile),
        // also look for their corresponding cotypes (i.e., /type/[user|domain|type]
        $.each(["user", "domain", "type"], function(i, t) {
          if (type === "/freebase/" + t + "_profile") {
            filters.push("type:/type/" + t);
            return false;
          }
        });
        if (type === "/book/book_subject") {
          // If looking for /book/book_subject, also look for /base/skosbase/skos_concept
          filters.push("type:/base/skosbase/skos_concept");
        }

        // is this metaweb system type?
        var is_system_type = fb.h.is_metaweb_system_type(type);

        var o = null;
        if (is_system_type) {
          // use "any" for metaweb system types
          o = fb.suggest_options.any.apply(null, filters);
        }
        else {
          o = fb.suggest_options.should.apply(null, filters);
          if (create_new) {
            // only "Create new" for non metaweb system types
            o.suggest_new = "Create new";
          }
        }

        // different lang than the default?
        if (lang) {
          o.lang = fb.suggest_lang.lang(lang);
        }

        // only get /m mids (no /g mids)
        o.filter = [o.filter, '(all namespace:/m)'];

        return o;
      },

      /**
       * Add a type to (cotype) a topic.
       */
      cotype: function() {
        var filters = [
          // everything should be of /type/type
          "type:/type/type",

          // only /m mids (no /g mids)
          'namespace:/m',

          // can't cotype things in /type and /freebase
          "(not namespace:/type)",
          "(not namespace:/freebase)",

          // you can only cotype /common/topic, /common/uri_template, /common/uri_property in /common
          "(any (not namespace:/common) (any mid:/m/01c5 mid:/m/02_1_m4 mid:/m/03hc3d_))"

          // TODO: without cvt and enum. not yet supported by search
        ];
        return $.extend({scoring:"schema"}, fb.suggest_options.all.apply(null, filters));
      },

      /*
       * Add /freebase/type_hints/included_type to a type.
       * Same as cotype.
       */
      included_type: function() {
        return fb.suggest_options.cotype();
      },

      /**
       * Add /type/property/expected_type to a property
       */
      expected_type: function() {
        var filters = [
          "type:/type/type",

          // only /m mids (no /g mids)
          'namespace:/m'
        ];
        return $.extend({scoring:"schema"}, fb.suggest_options.all.apply(null, filters));
      },

      /**
       * Delegate a property
       */
      delegate_property: function() {
        var filters = [
          "type:/type/property",

          // can't delegate to properties in /type/object
          "(not namespace:/type/object)",

          // only /m mids (no /g mids)
          'namespace:/m'
        ];
        return $.extend({scoring:"schema"}, fb.suggest_options.all.apply(null, filters));
      }
    };
  });

  /**
   * init freebase site header search box (suggest)
   */
  $(function() {
    var search = $("#SearchBox .SearchBox-input,#fb-search-input");
    var search_container = $("#fb-search");
    var root = fb.acre.freebase.site_host;
    // Get rid of devel and port to use the legacy python client in development

    search.suggest(fb.suggest_options.search());

    var search_label = $("#site-search-label"),
    search_suggest = $("#site-search-box .fbs-pane");

    search
      .bind("fb-select", function(e, data) {
        // gather all input=hidden parameters
        var params = {};
        $(this).siblings("input[type=hidden]").each(function() {
            params[this.name] = this.value;
        });
        window.location = fb.h.fb_url(data.id, params);
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
          search_container.addClass("active");
        }
      })
      .blur(function(e) {
        if (!search_suggest.is(":visible") && search_label.is(":visible")) {
          $('#site-search-label').slideUp("fast");
          search_container.removeClass("active");
        }
      });

      $('.SearchBox-form').submit(function(e) {
        /* Do not allow form to be submitted without content */
        if ($.trim($("#fb-search-input").val()).length == 0){
          return false;
        }
        else{
          return true;
        }
      });
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
     if (lang === "/lang/en") {
       // remove lang input from form
       $(this).removeAttr("name");
       if (!$(":input[name]", this.form).length) {
         window.location = $(this.form).attr("action");
         return;
       }
     }
     this.form.submit();
   };

   fb.devbar = {
     div: $("#devbar"),

     touch: function() {
       if (/\.(freebase|sandbox\-freebase)\.com$/.test(fb.acre.request.server_name)) {
         $.ajax({
           url:  fb.acre.freebase.googleapis_url ? fb.h.fb_googleapis_url("/touch") : fb.h.fb_api_url("/api/service/touch"),
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
       $nav_user_controls = $(".nav-user-controls");
       $user_controls = $("#user-controls");
       $("#signedin .trigger").click(
         function() {
           if($user_controls.is(":hidden")) {
             $user_controls.fadeIn();
             $nav_user_controls.addClass("active");
             return false;
           }
           else {
             $user_controls.fadeOut();
             $nav_user_controls.removeClass("active");
             return false;
           }
         }
       );
       $('html').click(function() {
         if($user_controls.is(":visible")) {
           $user_controls.fadeOut();
           $nav_user_controls.removeClass("active");
         }
       });
       $user_controls.click(function(e) {
         e.stopPropagation();
       });
       $("#devbar-touch > a").click(fb.devbar.touch);
       if (fb.tid) {
         fb.devbar.txn_ids.push(fb.tid);
       }
       $("#devbar-txn > a").click(fb.devbar.txn);
       $.ajaxSetup({
         complete: function() {
           fb.devbar.ajaxComplete.apply(null, arguments);
         },
         error: function(xhr) {
           var ajax_options = this;
           var data = {};
           $.each(["url", "data", "dataType", "type"], function(i,k) {
             data[k] = ajax_options[k];
           });
           $.each(["status", "statusText", "responseText"], function(i,k) {
             data[k] = xhr[k];
           });
           data.responseHeaders = xhr.getAllResponseHeaders();
           //$(window).trigger("fb.user.feedback", data);
         }
       });
     }
   };
   fb.devbar.init();


   fb.mqlread = function(query, success, error) {
     var url;
     var data;
     if (fb.acre.freebase.googleapis_url) {
       url = fb.h.fb_googleapis_url("/mqlread");
       // new googleapis mqlread does not need the outer "query" envelope
       data = {
           query:JSON.stringify(query),
           key: fb.acre.freebase.api_key
       };
     }
     else {
       url = fb.h.fb_api_url("/api/service/mqlread");
       data = {query:JSON.stringify({query:query})};
     }
     var mqlread_options = {
       url: url,
       data: data,
       dataType: "jsonp",
       success: function(data) {
         if (success) {
           success.apply(this, [data.result]);
         }
       },
       error: function() {
         if (error) {
           error.apply(this, arguments);
         }
       }
     };
     return $.ajax(mqlread_options);
   };


  /**
   * init topic link hover
   */
  $(function() {

    fb.hover = {

      pane: "#fb-topic-hover-pane",

      current_target: null,

      cache: {},

      search_url: fb.h.fb_googleapis_url() + 
          "/search?filter=(all mid:${id})&" +
          "output=(notable:/client/summary description type)&key=" + 
          fb.acre.freebase.api_key + 
          "&lang=" + fb.suggest_lang.lang(),

      image_url: fb.h.fb_googleapis_url() + 
        "/image${id}?maxwidth=75&errorid=/freebase/no_image_png&key=" +
        fb.acre.freebase.api_key,

      show: function() {
        var topic_link = this;
        var id = $(topic_link).attr("data-id");
        if (!id) return;

        fb.hover.current_target = topic_link;

        // remove default hover
        $(topic_link).removeAttr("title");

        if (fb.hover.cache[id]) {
          _show();
        }
        else {
          $.ajax({
            url: fb.hover.search_url.replace(/\$\{id\}/g, id),
            success: function(data) {
              if (data['result'] && data['result'].length) {
                var html = $.suggest.suggest.create_flyout(
                    data['result'][0], fb.hover.image_url);
                fb.hover.cache[id] = html;
                _show();
              }
            },
            dataType: "jsonp",
            cache: true
          });
        }

        function _show() {
          // if target changed while fetching, bail
          if (topic_link !== fb.hover.current_target) return;

          $(fb.hover.pane).html(fb.hover.cache[id]);
          var hover_height = $(fb.hover.pane).height();
          var link_height = $(topic_link).height();

          // position above or below depending on where link is in viewport
          var offset = $(topic_link).offset();
          var left = offset.left;
          var top = offset.top;
          if ((top - $(document).scrollTop() + hover_height) < $(window).height()) {
            top = top + link_height;
          } else {
            top = top - hover_height - link_height;
          }

          $(fb.hover.pane).css({top:top, left:left}).show();
        }
      },

      hide: function() {
        fb.hover.current_target = null;
        $(fb.hover.pane).hide();
      }

    };

    fb.keyboard_shortcut = {
      cache_: { },

      /**
       * Add a keyboard shortcut to the current document
       * @param {string} character The character for the shortcut. Please
       *   be careful of existing native browser shortcut commands.
       * @param {Function} callback The callback function when the keyboard
       *   shortcut character is detected.
       */
      add: function(character, callback) {
        var code = character.charCodeAt(0);
        if (code in fb.keyboard_shortcut.cache_) {
          console.warn('Overriding keyboard shortcut', character);
        }
        fb.keyboard_shortcut.cache_[code] = callback;
      }
    };

    /**
     * Conveniently select the entire mid for easy copy/paste on dblclick.
     */
    fb.on_mid_dblclick = function(e) {
      var text = e.target;
      if (document.body.createTextRange) { //msie
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
      } else if (window.getSelection) { //all others
        var selection = window.getSelection();        
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    };

    /**
     * document keypress => keyboard shortcut handlers
     */
    $(document).keypress(function(e) {
      var code = e.charCode;
      var target = e.target;
      if (fb.keyboard_shortcut.cache_[code] &&
          (target == document.body ||
           target == document ||
           target == window ||
           target == $("html")[0])) {
        fb.keyboard_shortcut.cache_[code]();
        return false;
      }
    });

    $("#page-content")
      .on("mouseover", "a.property-value", fb.hover.show)
      .on("mouseout", "a.property-value", fb.hover.hide);

    $(document.body)
      .on("dblclick", ".mid", fb.on_mid_dblclick)
      .on("click", ".mid", fb.on_mid_dblclick);

  });

})(jQuery, window.freebase);
