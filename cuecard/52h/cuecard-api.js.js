if (!("CueCard" in window)) {
    (function() {

        var acreAppUrl = "http://www.freebase.com/cuecard/";
        
        window.CueCard = {
            loaded:                 false,
            version:                "trunk",
            loadingScriptsCount:    0,
            error:                  null,
            helper: acreAppUrl,
            apiProxy: {
                base : acreAppUrl,
                read:  "mqlread?",
                write: "mqlwrite?"
            },
            freebaseServiceUrl:     "http://www.freebase.com/",
            params:                 { bundle: true, externals: true }
        };
        
        var getHead = function(doc) {
            return doc.getElementsByTagName("head")[0];
        };
        CueCard.findScript = function(doc, substring) {
            var heads = doc.documentElement.getElementsByTagName("head");
            for (var h = 0; h < heads.length; h++) {
                var node = heads[h].firstChild;
                while (node != null) {
                    if (node.nodeType == 1 && node.tagName.toLowerCase() == "script") {
                        var url = node.src;
                        var i = url.indexOf(substring);
                        if (i >= 0) {
                            return url;
                        }
                    }
                    node = node.nextSibling;
                }
            }
            return null;
        };
        CueCard.parseURLParameters = function(url, to, types) {
            to = to || {};
            types = types || {};
            
            if (typeof url == "undefined") {
                url = location.href;
            }
            var q = url.indexOf("?");
            if (q < 0) {
                return to;
            }
            url = (url+"#").slice(q+1, url.indexOf("#")); // toss the URL fragment
            
            var params = url.split("&"), param, parsed = {};
            var decode = window.decodeURIComponent || unescape;
            for (var i = 0; param = params[i]; i++) {
                var eq = param.indexOf("=");
                var name = decode(param.slice(0,eq).replace(/\+/g, ' '));
                var old = parsed[name];
                if (typeof old == "undefined") {
                    old = [];
                } else if (!(old instanceof Array)) {
                    old = [old];
                }
                parsed[name] = old.concat(decode(param.slice(eq+1).replace(/\+/g, ' ')));
            }
            for (var i in parsed) {
                if (!parsed.hasOwnProperty(i)) continue;
                var type = types[i] || String;
                var data = parsed[i];
                if (!(data instanceof Array)) {
                    data = [data];
                }
                if (type === Boolean && data[0] == "false") {
                    to[i] = false; // because Boolean("false") === true
                } else {
                    to[i] = type.apply(this, data);
                }
            }
            return to;
        };
        
        if (typeof CueCard_urlPrefix == "string") {
            CueCard.urlPrefix = CueCard_urlPrefix;
        } else {
            var url = CueCard.findScript(document, "cuecard-api.js");
            if (url == null) {
                CueCard.error = new Error("Failed to derive URL prefix for CueCard API code files");
                return;
            }

            CueCard.urlPrefix = url.substr(0, url.indexOf("cuecard-api.js"));
        }

        CueCard.parseURLParameters(url, CueCard.params, {bundle:Boolean, externals:Boolean});
        
        CueCard.loaded = true;
    })();
}