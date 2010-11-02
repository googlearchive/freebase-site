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
