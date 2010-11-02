/*global mjt $ */

// util.js is for utilitiy functions which have no dependancies on App Editor


////////////////////
//                //
//     Assert     //
//                //
////////////////////

var assert = {};

/**
  * assert.critical(cond,message) - if (!cond) show the message and provide a link to report_problem
  *    For situations where continuing is only going to make things worse.
  *    The critical error dialog box is displayed without dependancies on mjt or jQuery
  *    Only one critical error is shown at a time (futher errors sent to mjt.error if possible)
**/
assert.critical = function(cond,message) {
    if (cond) { return; }
    // else

    // https://bugs.webkit.org/show_bug.cgi?id=20141 breaks the following code on Safari
    //   var error_func = ((window.mjt || {}).error)  ||  ((window.console || {}).error)  ||  (function() {});
    // so we have to do it the ugly way:
    if (typeof mjt !== "undefined" && mjt.error) {
        mjt.error('Internal Error: '+message);
    } else {
        if (typeof console !== "undefined" && console.error) {
            console.error('Internal Error: '+message);
        }
    }
    if (document.getElementById('error-dialog')) { return; } // only show one dialog box
    var html = '';
    html += '<div style="font-weight:bold;">Internal Error</div>';
    html += message;
    html += '<div style="padding-top: 5px";><a href="http://www.metaweb.com/error-acre.html" target="_blank">Please report this error!</a></div>';
    assert.error_dialog(html);
    //TODO: maybe this is too brutal? perhaps the user can continue?
    //throw 'assert.critical failed: '+message;
    
};

//Make the error box appear in the center of the page
assert.error_dialog = function(message_html) {
    var close_html = '<div id="error-dialog" style="float:right; color: #1170a3; margin: -10px -5px 0 0; cursor: pointer;" onclick="document.body.removeChild(this.parentNode);">x</div>';
    var div = document.createElement('div');
    div.style.cssText = 'position: absolute; top: 30px; left: 50%; width: 350px; margin: 0 0 0 -175px; padding: 15px; background-color: #fce2db; border: 1px solid #f3c5ac; color: #676767; font-size: 12px; z-index: 100;';
    div.innerHTML = close_html + message_html;
    document.body.appendChild(div);
};


////////////////////////
//                    //
//   Unicode output   //
//                    //
////////////////////////

var unicode = {};

unicode.escape_char = function(aChar) {
    var hex = aChar.charCodeAt(0).toString(16).toUpperCase();
    if (hex.length===1) { return "\\u000"+hex; }
    if (hex.length===2) { return "\\u00" +hex; }
    if (hex.length===3) { return "\\u0"  +hex; }
    if (hex.length===4) { return "\\u"   +hex; }
    return null;
};

// Escape everything outside of Basic Latin + the control chars 0 - 1f
// http://www.fileformat.info/info/unicode/block/basic_latin/list.htm
unicode.escape_str = function(str) {
    return str.replace( /[^\u0020-\u007F]/g, unicode.escape_char ); // from SPACE to ~ is OK
};



////////////////////////
//                    //
//  Local Storage     //
//                    //
////////////////////////


/**
* Generic local storage
* uses cookies or window.globalStorage, depending on the
* capabilities of your browser. Why? To avoid sending cookie values
* back and forth in the HTTP request
*
* The nice thing about using $.localStore is that you can set and get
* native values and dictionaries:
*
* $.localStore("mydict", {x:1,y:2});
* $.localStore("mybool", true);
* $.localStore("mynum", 123);
* var o = $.localStore("mydict");
* alert(o.x); // prints 1
*/

(function() {

    var COOKIE_OPTS = {
        expires: 30                             // App Editor preferences are stored in cookies for 30 days
    };

    var _localStore_cache = {};  

    $.extend({   
       localStore: function(key, val, use_cookie) {

           var hostname = document.location.hostname;

           // http: or https: - make sure to keep the keys bucketed
           // differently, because firefox flags keys written from an
           // https: page as secure, inaccessible by http:
           var prefix = document.location.protocol;
           if (typeof val !== "undefined") {
               //
               // set key val
               //
               var valstr = JSON.stringify(val);
               if (!use_cookie && window.globalStorage) {
                   if (val === null) {
                       delete window.globalStorage[hostname][prefix+key];
                   } else {
                       window.globalStorage[hostname][prefix+key] = valstr;                       
                   }
               } else if (!use_cookie && window.localStorage && window.localStorage.setItem) {
                   if (val === null) {
                       window.localStorage.removeItem(prefix+key);
                   } else {
                       window.localStorage.setItem(prefix+key, valstr);                       
                   }
               } else if (use_cookie !== false){
                   if (val === null) {
                       $.cookie(key, null, COOKIE_OPTS);
                   } else {
                       $.cookie(key, valstr, COOKIE_OPTS);
                   }
               } else {
                   if (val === null) {
                       delete _localStore_cache[key];
                   } else {
                       _localStore_cache[key] = valstr;
                   }
               }
               return val;
           }
           else {
               //
               // get key value
               //
               if (!use_cookie && window.globalStorage) {
                   if (window.globalStorage[hostname][prefix+key]) {
                       val = window.globalStorage[hostname][prefix+key].value;
                   }
               } else if (!use_cookie && window.localStorage) {
                   val = window.localStorage.getItem(prefix+key);
               } else if(use_cookie !== false) {
                   val = $.cookie(key);
               } else {
                   val = _localStore_cache[key];
               }
               if (val != "" && val !== null && val !== undefined) {
                   return JSON.parse(val, null);
              }
           }
           return null;
       }
    });

})();
