var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-3096233-1'],
          ["_setCustomVar", 2, "user_type", document.cookie.indexOf("metaweb-user-info") < 0 ? "anon" : "loggedin", 2]);
_gaq.push(["_trackPageview"]);

(function() {
    var ga = document.createElement('script');
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    ga.setAttribute('async', 'true');
    document.documentElement.firstChild.appendChild(ga);
})();
