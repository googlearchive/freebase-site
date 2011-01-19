/*
 * Copyright 2010, Google Inc.
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