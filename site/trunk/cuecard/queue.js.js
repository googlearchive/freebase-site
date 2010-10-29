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

CueCard.JsonpQueue = {
    pendingCallIDs: {},
    callInProgress: 0
};

CueCard.JsonpQueue.cancelAll = function() {
    CueCard.JsonpQueue.pendingCallIDs = {};
};

CueCard.JsonpQueue.call = function(url, onDone, onError, debug) {
    if (CueCard.JsonpQueue.callInProgress == 0) {
        document.body.style.cursor = "progress";
    }
    CueCard.JsonpQueue.callInProgress++;
    
    var callbackID = new Date().getTime() + "x" + Math.floor(Math.random() * 1000);
    var script = document.createElement("script");
    script.setAttribute('onerror', 'err' + callbackID + '();');
    
    url += (url.indexOf("?") < 0 ? "?" : "&") + "callback=cb" + callbackID;
    script.setAttribute('src', url);
    
    var cleanup = function() {
        CueCard.JsonpQueue.callInProgress--;
        if (CueCard.JsonpQueue.callInProgress == 0) {
            document.body.style.cursor = "auto";
        }
        
        if (!(debug)) {
            script.parentNode.removeChild(script);
        }
        
        try {
            delete window["cb" + callbackID];
            delete window["err" + callbackID];
        } catch (e) {
            // IE doesn't seem to allow calling delete on window
            window["cb" + callbackID] = undefined;
            window["err" + callbackID] = undefined;
        }
        
        if (callbackID in CueCard.JsonpQueue.pendingCallIDs) {
            delete CueCard.JsonpQueue.pendingCallIDs[callbackID];
            return true;
        } else {
            return false;
        }
    };
    
    var callback = function(o) {
        if (cleanup()) {
            try {
                onDone(o);
            } catch (e) {
                //console.log(e);
            }
        }
    };
    var error = function() {
        if (cleanup()) {
            if (typeof onError == "function") {
                try {
                    onError(url);
                } catch (e) {
                    //console.log(e);
                }
            }
        }
    };
    
    window["cb" + callbackID] = callback;
    window["err" + callbackID] = error;
    
    CueCard.JsonpQueue.pendingCallIDs[callbackID] = true;
    document.getElementsByTagName("head")[0].appendChild(script);
};

CueCard.JsonpQueue.queryOne = function(query, onDone, onError, debug) {
    CueCard.JsonpQueue.queryOneEnvelope({ "query" : query }, onDone, onError, debug);
};

CueCard.JsonpQueue.queryOneEnvelope = function(queryEnvelope, onDone, onError, debug) {
    var q = CueCard.jsonize({ "q1" : queryEnvelope }, { breakLines: false });
    var url = CueCard.freebaseServiceUrl + 'api/service/mqlread?queries=' + encodeURIComponent(q);
    var onDone2 = function(o) {
        if (o.q1.code == "/api/status/error") {
            if (typeof onError == "function") {
                onError(o.q1);
            }
        } else {
            onDone(o.q1);
        }
    };
    var onError2 = function() {
        if (typeof onError == "function") {
            onError("Unknown");
        }
    }
    CueCard.JsonpQueue.call(url, onDone2, onError2, debug);
};
