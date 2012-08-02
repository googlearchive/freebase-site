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
 * Generic local storage
 * uses cookies or window.globalStorage, depending on the
 * capabilities of your browser. Why? To avoid sending cookie values
 * back and forth in the HTTP request
 *
 * The nice thing about using $.localStore is that you can set and get
 * native values and dictionaries:
 *
 * $.localstore("mydict", {x:1,y:2});
 * $.localstore("mybool", true);
 * $.localstore("mynum", 123);
 * var o = $.localstore("mydict");
 * alert(o.x); // prints 1
 */

(function() {

  var _localStore_cache = {};  

  $.extend({   
    localstore: function(key, val, use_cookie, cookie_options) {

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
          var cookie_settings = {};
          cookie_settings['domain'] = fb.get_cookie_domain();
          if (val === null) {
            $.cookie(key, null, cookie_settings);
          } else {
            $.cookie(key, valstr, $.extend(cookie_settings, cookie_options || {expires:14, path:"/"}));
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
