(function(){
   if (!('freebase' in window)) window.freebase = {};
   
   var get_cookie = function(cookie_name) {
     var begin = document.cookie.indexOf(cookie_name); 
     if (begin < 0){
       return null;
     }
     var c = document.cookie.substring(begin);
     var end = c.indexOf(";");
     if (end >= 0){
       c = c.substring(0, end);
     }
     c = c.split("=");
     return c.length == 2 ? c[1] : null;
   };
   
   var c = get_cookie("metaweb-user-info");
   if (c) {
     var ui = window.freebase.user_info = {};
     var arr = c.split('|');
     for (var x=0; x < arr.length; x++) {
       var s = arr[x];
       ui[s.substring(0,1)] = s.substring(2);
     }
   }
  
  c = get_cookie("metaweb_tid");
  window.freebase.COOKIE_TID = unescape(c);
})();