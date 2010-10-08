CueCard.Popup = function(left, top, height, windows, handlers) {
    this._left = left;
    this._top = top;
    this._height = height;
    this._windows = windows;
    this._handlers = handlers || {};
    
    this._pendingContinuations = [];
    
    this.elmt = $('<div class="cuecard-popup-container"></div>')
        .css("top", (this._top + this._height) + "px")
        .css("left", this._left + "px")
        .appendTo('body');
        
    this._addEventHandlers();
};

CueCard.Popup.prototype.addPendingContinuation = function(cont) {
    this._pendingContinuations.push(cont);
};

CueCard.Popup.prototype.reposition = function() {
    var ourHeight = this.elmt.height();
    var ourWidth = this.elmt.width();
    
    if (this._top + this._height + ourHeight >= $(window).height()) {
        this.elmt.css("top", (this._top - ourHeight - 5) + "px");
    } else {
        this.elmt.css("top", (this._top + this._height) + "px");
    }
    if (this._left + ourWidth >= $(window).width()) {
        this.elmt.css("left", ($(window).width() - ourWidth - 25) + "px");
    } else {
        this.elmt.css("left", (this._left) + "px");
    }
};

CueCard.Popup.prototype.close = function() {
    this._remove();
    this._pendingContinuations = null;
};

CueCard.Popup.prototype.cancel = function() {
    if (this.elmt != null) {
        this._remove();
        this._cancelPendingContinuations();
        this._pendingContinuations = null;
    }
};

CueCard.Popup.prototype._remove = function() {
    this._removeEventHandlers();
    
    this.elmt.remove();
    this.elmt = null;
};

CueCard.Popup.prototype._cancelPendingContinuations = function() {
    for (var i = 0; i < this._pendingContinuations.length; i++) {
        try {
            this._pendingContinuations[i].cancel();
        } catch (e) {
            //console.log(e);
        }
    }
    this._pendingContinuations = [];
};

CueCard.Popup.prototype._addEventHandlers = function() {
    var self = this;
    this._handleKeyDown = function(evt) {
        return self._onKeyDown(evt);
    };
    this._handleMouseDown = function(evt) {
        return self._onMouseDown(evt);
    };
    
    for (var i = 0; i < this._windows.length; i++) {
        var win = this._windows[i];
        try {
            $(win.document).keydown(this._handleKeyDown).mousedown(this._handleMouseDown);
        } catch (e) {
            alert("Unable to install keyup handler on codemirror window");
        }
    }
};

CueCard.Popup.prototype._removeEventHandlers = function() {
    var self = this;
    for (var i = 0; i < this._windows.length; i++) {
        var win = this._windows[i];
        try {
            $(win.document).unbind("keydown", this._handleKeyDown).unbind("mousedown", this._handleMouseDown);
        } catch (e) {
            alert("Unable to install keyup handler on codemirror window");
        }
    }
};

CueCard.Popup.prototype._onKeyDown = function(evt) {
    if (evt.keyCode == 27) { // esc
        this.cancel();
        if ("onCancel" in this._handlers) {
            this._handlers["onCancel"]("key");
        }
    }
};

CueCard.Popup.prototype._onMouseDown = function(evt) {
    if (this.mouseEventOutsidePopup(evt)) {
        this.cancel();
        if ("onCancel" in this._handlers) {
            this._handlers["onCancel"]("mouse");
        }
    }
};

CueCard.Popup.prototype.mouseEventOutsidePopup = function(evt) {
    if (evt.currentTarget != this.elmt[0].ownerDocument) {
        return true;
    } else {
        var offset = this.elmt.offset();
        if (evt.pageX < offset.left || evt.pageX > offset.left + this.elmt.width() ||
            evt.pageY < offset.top || evt.pageY > offset.top + this.elmt.height()) {
            return true;
        }
    }
    return false;
};