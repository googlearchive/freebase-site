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

CueCard.SuggestionController = function(popup, parent, suggestor, text) {
    this._popup = popup;
    this._suggestor = suggestor;
    this._lastText = text;
    this._selectedIndex = -1;
    this._suggestions = [];
    
    this._input = $('<input value="' + text + '" />');
    this._suggestionContainer = $('<div class="cuecard-suggestion-container"></div>');
    
    $(parent)
        .append($('<div class="cuecard-suggestion-input-container"></div>').append(this._input))
        .append(this._suggestionContainer);
        
    var self = this;
    this._onKeyUp = function(evt) {
        if (!evt.shiftKey && !evt.metaKey && !evt.ctrlKey) {
            if (evt.keyCode == 36 || evt.keyCode == 38 || evt.keyCode == 40) { // up down arrow movements
                return self._cancelEvent(evt);
            }
            
            var newText = self._input[0].value;
            if (newText != self._lastText) {
                self._lastText = newText;
                self._updateSuggestions();
            }
        }
    };
    this._onKeyDown = function(evt) {
        while (!evt.shiftKey && !evt.metaKey && !evt.ctrlKey) {
            if (evt.keyCode == 13 || evt.keyCode == 9) { // enter or tab
                self._commitSelectedSuggestion();
            } else if (evt.keyCode == 36) { // home
                if (self._suggestions.length > 0) {
                    self._selectSuggestion(0, true);
                }
            } else if (evt.keyCode == 38) { // arrow up
                if (self._selectedIndex > 0) {
                    self._selectSuggestion(self._selectedIndex - 1, true);
                }
            } else if (evt.keyCode == 40) { // arrow down
                if (self._selectedIndex < self._suggestions.length - 1) {
                    self._selectSuggestion(self._selectedIndex + 1, true);
                }
            } else {
                break; // skip the remaining code in the loop
            }
            return self._cancelEvent(evt);
        }
        
        if ("onKeyDown" in self._suggestor) {
            return self._suggestor.onKeyDown(evt, self._input[0].value);
        }
    };
    
    this._input.keyup(this._onKeyUp).keydown(this._onKeyDown);
    
    var input = this._input[0];
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(text.length, text.length);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', text.length);
        range.moveStart('character', text.length);
        range.select();
    }
    this._input[0].focus();
    
    this._updateSuggestions();
};

CueCard.SuggestionController.prototype._updateSuggestions = function() {
    this._suggestionContainer.empty();
    this._suggestionContainer.html('<div class="cuecard-suggestion-progress">Please wait...</div>');
    this._selectedIndex = -1;
    this._suggestions.length = 0;
    
    var self = this;
    this._suggestor.getSuggestions(this._lastText, function(suggestions) {
        self._renderSuggestions(suggestions, self._lastText);
    });
};

CueCard.SuggestionController.prototype._renderSuggestions = function(suggestions, text) {
    var container = this._suggestionContainer;
    container.empty();
    
    var self = this;
    var addSuggestionEntry = function(entry, index) {
        var elmt = "elmt" in entry ? entry.elmt : 
            $('<a class="cuecard-suggestion-entry" href="javascript:{}">' + entry.label + 
                ("hint" in entry ? (' <span class="cuecard-suggestion-hint">' + entry.hint + '</span>') : '') + 
              '</a>');
            
        elmt
            .mouseover(function(evt) { self._selectSuggestion(index, false); })
            .click(function(evt) { self._commitSelectedSuggestion(); })
            .appendTo(container);
    };
    
    this._suggestions = suggestions;
    for (var i = 0; i < suggestions.length; i++) {
        addSuggestionEntry(suggestions[i], i);
    }
    
    if (this._suggestions.length > 0) {
        this._selectSuggestion(0, false);
    } else {
        $('<div class="cuecard-suggestion-noEntryMessage">No suggestion available.<br/>Press Enter to keep what you have typed,<br/>ESC to discard it.</div>').appendTo(container);
    }
    
    this._popup.reposition();
};

CueCard.SuggestionController.prototype._selectSuggestion = function(index, byKey) {
    var container = this._suggestionContainer;
    
    if (this._selectedIndex >= 0) {
        this._getSuggestion(this._selectedIndex).removeClass("cuecard-suggestion-selected");
    }
    
    this._selectedIndex = index;
    this._getSuggestion(this._selectedIndex).addClass("cuecard-suggestion-selected");
    if (byKey) {
        this._getSuggestion(this._selectedIndex)[0].scrollIntoView(false);
    }
};

CueCard.SuggestionController.prototype._commitSelectedSuggestion = function() {
    if (this._selectedIndex >= 0) {
        this._suggestor.commit(this._suggestions[this._selectedIndex]);
    } else {
        this._suggestor.commit(this._input[0].value);
    }
};

CueCard.SuggestionController.prototype._getSuggestion = function(index) {
    return $(this._suggestionContainer.children()[index]);
};

CueCard.SuggestionController.prototype._cancelEvent = function(evt) {
    evt.returnValue = false;
    evt.cancelBubble = true;
    if ("preventDefault" in evt) {
        evt.preventDefault();
    }
    return false;
}
