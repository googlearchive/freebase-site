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

CueCard.UI = {};

CueCard.UI.reportError = function(msg) {
    try {
        console.log(msg);
    } catch (e) {
        alert(msg);
    }
};

CueCard.UI.createBlockingContinuations = function(onDone, onError) {
    return new CueCard.UI.Cont(onDone, onError);
};

CueCard.UI.Cont = function(onDone, onError) {
    var self = this;
    
    this._onDone = onDone;
    this._onError = onError || CueCard.UI.reportError;
    this._progressUI = null;
    
    this._canceled = false;
    this._cleanedUp = false;
    
    this.cleanUp = function() {
        if (!self._cleanedUp) {
            self._cleanedUp = true;
            if (self._progressUI != null) {
                self._progressUI.remove();
                self._progressUI = null;
            }
        }
    };
    this.cancel = function() {
        if (!self._canceled) {
            self._canceled = true;
            self.cleanUp();
        }
    };
    this.onError = function() {
        self.cleanUp();
        self._onError();
    };
    this.onDone = function() {
        var delayCleanUp = false;
        if (!self._canceled) {
            var args = [ self ];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            delayCleanUp = self._onDone.apply(null, args);
        }
        
        if (!(delayCleanUp)) {
            self.cleanUp();
        }
    };
    
    window.setTimeout(function() {
        if (!self._cleanedUp) {
            self._progressUI = $('<div class="cuecard-progress">Working...</div>').appendTo($(document.body));
        }
    }, 300);
};

CueCard.UI.Cont.prototype.isCanceled = function() {
    return this._canceled;
};

CueCard.UI.Cont.prototype.extend = function(onDone, onError) {
    this._onDone = onDone;
    this._onError = onError || this._onError;
    return this;
};
