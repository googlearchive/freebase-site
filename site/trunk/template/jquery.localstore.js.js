/** @license
 * Generic local storage
 * uses cookies or window.globalStorage, depending on the
 * capabilities of your browser. Why? To avoid sending cookie values
 * back and forth in the HTTP request
 *
 * The nice thing about using $.localstore is that you can set and get
 * native values and dictionaries:
 *
 * $.localstore("mydict", {x:1,y:2});
 * $.localstore("mybool", true);
 * $.localstore("mynum", 123);
 * var o = $.localstore("mydict");
 * alert(o.x); // prints 1
 */
(function($) {
   $.extend({
     localstore: function(key, val, use_cookie, cookie_options) {
       var hostname = document.location.hostname;

       // http: or https: - make sure to keep the keys bucketed
       // differently, because firefox flags keys written from an
       // https: page as secure, inaccessible by http:
       var prefix = document.location.protocol;
       if (typeof val != "undefined") {
         //
         // set key val
         //
         var valstr = JSON.stringify(val);
         //console.log("$.localstore set", key, valstr);
         if (!use_cookie && window.globalStorage) {
           //console.log("SET using window.globalStorage");
           window.globalStorage[hostname][prefix+key] = valstr;
         }
         else {
           //console.log("SET using document.cookie", document.cookie);
           if (val === null) {
             var cookie_settings = {};
             if (COOKIE_DOMAIN) {
               cookie_settings['domain'] = COOKIE_DOMAIN;
             }
             else {
               cookie_settings['domain'] = fb.get_cookie_domain();
             }
             $.cookie(key, null, cookie_settings);
           } else {
             $.cookie(key, valstr, $.extend(cookie_settings, {expires:14, path:"/"}));
           }
         }
         return val;
       }
       else {
         //
         // get key value
         //
         if (!use_cookie && window.globalStorage) {
           //console.log("GET using window.globalStorage");
           if (window.globalStorage[hostname][prefix+key])
             val = window.globalStorage[hostname][prefix+key].value;
         }
         else {
           //console.log("GET using document.cookie", document.cookie);
           val = $.cookie(key);
         }
         if (val != null) {
           return JSON.parse(val, null);
         }
       }
       return null;
     }
   });
 })(jQuery);
