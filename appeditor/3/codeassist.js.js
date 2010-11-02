function CodeAssist(container, editor, options) {
    this._container = container;
    this._editor = editor;
    this._options = options;
    this._assistKeyComboDetected = false;
    this._autoAssistTimerID = null;
    
    var self = this;
    try {
        $(editor.win.document).keyup(function(evt) {
            return self._onEditorKeyUp(evt);
        }).keydown(function(evt) {
            return self._onEditorKeyDown(evt);
        }).keypress(function(evt) {
            return self._onEditorKeyPress(evt);
        }).mousedown(function(evt) {
            return self._onEditorMouseDown(evt);
        });
    } catch (e) {
        alert("Unable to install keyup handler on codemirror window");
    }
}

CodeAssist.helperUrl = "http://acreassist.freebaseapps.com/";

CodeAssist.prototype.dispose = function() {
    this._cancelPopup();
    this._cancelAutoAssist();
};

CodeAssist.prototype.getSetting = function(name) {
    switch (name) {
    case "dotTrigger":
        return this._options.dotTrigger;
    }
    return null;
};

CodeAssist.prototype.putSetting = function(name, value) {
    switch (name) {
    case "dotTrigger":
        this._options.dotTrigger = value;
        break;
    }
};

CodeAssist.prototype._onEditorMouseDown = function(evt) {
    
};

CodeAssist.prototype._onEditorKeyDown = function(evt) {
    if (evt.keyCode == 32 && (evt.ctrlKey || evt.metaKey || evt.altKey)) { // space with modifier
        this._assistKeyComboDetected = true;
        evt.preventDefault();
        return false;
    } else if (evt.keyCode == 8) { // backspace
        this._cancelPopup(); // cancel any argument assist
    }
};

CodeAssist.prototype._onEditorKeyUp = function(evt) {
    if (this._assistKeyComboDetected) {
        this._assistKeyComboDetected = false;
        this.startAssistAtCursor("" /* no trigger */);
        
        evt.preventDefault();
        return false;
    }
};

CodeAssist.prototype._onEditorKeyPress = function(evt) {
    if ((!evt.shiftKey && evt.keyCode == 32) || evt.charCode == 32) { // space
        /*
            Don't cancel auto assist, because user typical types comma and then space,
            and expects to get function argument assist.
         */
        return;
    }

    this._cancelAutoAssist();
    if (!(evt.ctrlKey || evt.metaKey || evt.altKey)) { // no modifier key except maybe shift
        if (this._options.dotTrigger && ((!evt.shiftKey && evt.keyCode == 46) || evt.charCode == 46)) { // period, IE uses keyCode, FF uses charCode
            this._scheduleAutoAssist(".");
        } else if ((!evt.shiftKey && evt.keyCode == 188) || evt.charCode == 44) { // comma
            this._scheduleAutoAssist(",");
        } else if ((evt.shiftKey && evt.keyCode == 57) || evt.charCode == 40) { // open parenthesis
            this._scheduleAutoAssist("(");
        } else if ((evt.shiftKey && evt.keyCode == 48) || evt.charCode == 41) { // close parenthesis
            // Close argument assist, if open
            this._cancelPopup();
        } else if (
            evt.keyCode == 38 || // up arrow
            evt.keyCode == 40 || // down arrow
            evt.keyCode == 33 || // page up
            evt.keyCode == 34 || // page down
            evt.keyCode == 35 || // end
            evt.keyCode == 36    // home
        ) {
            // Close argument assist, if open
            this._cancelPopup();
        }
    }
};

CodeAssist.prototype._cancelAutoAssist = function() {
    if (this._autoAssistTimerID != null) {
        window.clearTimeout(this._autoAssistTimerID);
        this._autoAssistTimerID = null;
    }
};

CodeAssist.prototype._scheduleAutoAssist = function(trigger) {
    var self = this;
    this._autoAssistTimerID = window.setTimeout(function() {
        self._autoAssistTimerID = null;
        self.startAssistAtCursor(trigger);
    }, trigger == "." ? 1000 : 200);
};

CodeAssist.prototype._findCurrentNode = function(p, l, col, s) {
    var veryFirstContentNode = this._editor.win.document.body.firstChild;
    var previousNode = p.line || veryFirstContentNode;
    var node = previousNode.nextSibling;
    var c = col;
    while (c > 0 && 
        node != null && 
        (node.nodeType != 1 || node.tagName.toLowerCase() != "br") && 
        node.firstChild != null && 
        node.firstChild.nodeValue.length < c
    ) {
        c -= node.firstChild.nodeValue.length;
        
        previousNode = node;
        node = node.nextSibling;
    }
    
    var left, top, height;
    if (node == null || node.tagName.toLowerCase() == "br") {
        // Case: end of content or end of line
        if (node != null) {
            var offset = $(node).offset();
            if ($.browser.msie && previousNode != null && previousNode.tagName.toLowerCase() != "br") {
                left = previousNode.offsetWidth;
                height = previousNode.offsetHeight;
            } else {
                left = offset.left;
                height = node.offsetHeight;
            }
        } else {
            var offset = $(previousNode).offset();
            var charCount = previousNode.firstChild ? previousNode.firstChild.nodeValue.length : 0;
            left = offset.left + (charCount == 0 ? 0 : (c * previousNode.offsetWidth / charCount));
            height = previousNode.offsetHeight;
        }
        top = offset.top;
    } else {
        var offset = $(node).offset();
        var charCount = node.firstChild ? node.firstChild.nodeValue.length : 0;
        left    = offset.left + (charCount == 0 ? 0 : (c * node.offsetWidth / charCount));
        top     = offset.top;
        height  = node.offsetHeight;
    }
    
    var currentNode;
    var currentNodeOffset;
    if (node != null) {
        return {
            left: left,
            top: top,
            height: height,
            currentNode: node,
            currentNodeOffset: c
        };
    } else {
        return {
            left: left,
            top: top,
            height: height,
            currentNode: previousNode,
            currentNodeOffset: (previousNode != null && previousNode.firstChild != null) ? previousNode.firstChild.nodeValue.length : 0
        }
    }
};

CodeAssist.prototype.startAssistAtCursor = function(trigger) {
    this._cancelPopup();
    this._cancelAutoAssist();
    
    var p = this._editor.cursorPosition(false);
    var l = this._editor.lineNumber(p.line) - 1;
    var col = p.character;
    var s = this._editor.lineContent(p.line);
    
    var currentNodeInfo = this._findCurrentNode(p, l, col, s);
    var currentNode = currentNodeInfo.currentNode;
    var currentNodeOffset = currentNodeInfo.currentNodeOffset;
    if (currentNodeOffset == null) {
        return;
    }
    
    var text;
    var cursorOffset;
    if (currentNode.className.indexOf("xml-") == 0) {
        var checkEscape = false; // Whether to check for $ and ${ }
        if (currentNode.className == "xml-attribute") {
            var attributeName = "";
            var pnode = currentNode.previousSibling;
            while (pnode != null && pnode.className != "xml-tagname" && pnode.className != "xml-tagname-acre") {
                if (pnode.className == "xml-attname") {
                    attributeName = pnode.firstChild.nodeValue;
                    // don't break; we need to detect xml-tagname-acre
                }
                pnode = pnode.previousSibling;
            }
            
            text = currentNode.firstChild.nodeValue.replace(/^["']/, '').replace(/["']$/, '');
            cursorOffset = currentNodeOffset - 1; // exclude quote mark
            checkEscape = attributeName.indexOf("acre:") < 0 && (pnode == null || pnode.className != "xml-tagname-acre");
        } else if (currentNode.className == "xml-text") {
            text = currentNode.firstChild.nodeValue;
            cursorOffset = currentNodeOffset;
            checkEscape = true;
        } else {
            return;
        }
        
        var startCode = 0;
        if (checkEscape) {
            var text2 = text.substr(0, cursorOffset);
            var brace = text2.lastIndexOf("{");
            var closeBrace = text2.lastIndexOf("}");
            
            if (brace > 0 && text2.charAt(brace - 1) == "$" && closeBrace < brace) {
                startCode = brace + 1;
            } else {
                var dollar = text2.lastIndexOf("$");
                if (dollar >= 0 && closeBrace < dollar) {
                    startCode = dollar + 1;
                } else {
                    return;
                }
            }
        }
        
        text = text.substr(startCode);
        cursorOffset -= startCode;
    
    } else if (
            currentNode.tagName.toLowerCase() == "br" || 
            currentNode.className == "whitespace" || 
            (currentNode.className.indexOf("js-") == 0 && currentNode.className != "js-comment")) {
            
        /*
         *  Try to find real code if we hit whitespace inside mjt templates
         *  because it could just be xml whitespace, not js whitespace.
         */
        if ((currentNode.tagName.toLowerCase() == "br" || currentNode.className == "whitespace") && this._options.isMjt) {
            var pnode = currentNode.previousSibling;
            while (pnode != null && pnode.className.indexOf("xml-") < 0 && pnode.className.indexOf("js-") != 0) {
                pnode = pnode.previousSibling;
            }
            
            /*
             *  TODO: Right now if the cursor is immediately after <acre:script>
             *  (not counting whitespace), then we would fail to detect that we're
             *  in JS realm because we simply hit > without hitting anything js- first.
             */
            if (pnode == null) {
                return;
            } else if (pnode.className == "xml-punctuation" && pnode.firstChild.nodeValue == ">") {
                // The cursor might be after <acre:script> and we hit the >
                
                var pnode2 = pnode.previousSibling;
                if (pnode2 == null || 
                    pnode2.className != "xml-tagname-acre" || 
                    pnode2.firstChild.nodeValue != "acre:script") {
                    return;
                }
            } else if (pnode.className.indexOf("xml-") == 0) {
                return;
            }
        }
        
        text = s;
        cursorOffset = col;
        
        /*
         *  Try to find preceding code
         */
        var precedingCode = [];
        var pnode = currentNode.previousSibling;
        while (pnode != null && pnode.className.indexOf("xml-") < 0) {
            if (pnode.tagName.toLowerCase() == "br") {
                precedingCode.unshift("\n");
            } else {
                precedingCode.unshift(pnode.firstChild.nodeValue);
            }
            pnode = pnode.previousSibling;
        }
        
        precedingCode = precedingCode.join("");
        text = precedingCode + 
            (currentNode.firstChild != null ? 
                currentNode.firstChild.nodeValue.substr(0, currentNodeOffset) : "");
        cursorOffset = precedingCode.length + currentNodeOffset;
    } else {
        return;
    }
    
    if (trigger == "(" || trigger == ",") {
        this._internalStartFunctionArgumentAssist(
            { left: currentNodeInfo.left, top: currentNodeInfo.top, height: currentNodeInfo.height },
            l, 
            col, 
            text, 
            cursorOffset
        );
    } else {
        this._internalStartApiAssist(
            { left: currentNodeInfo.left, top: currentNodeInfo.top, height: currentNodeInfo.height },
            l, 
            col, 
            text, 
            cursorOffset
        );
    }
};

CodeAssist.prototype._cancelPopup = function() {
    if ("_popup" in this && this._popup != null) {
        this._popup.cancel();
        this._popup = null;
    }
};

CodeAssist.prototype._internalStartApiAssist = function(
    positioning,
    editorLine, 
    editorColumn, 
    code,
    codeOffset
) {
    var tokenizer = new CodeAssist.QueryTokenizer(code, 0, codeOffset);
    var tokens = [];
    var token;
    while ((token = tokenizer.token()) != null) {
        tokens.push(token);
        tokenizer.next();
    }
    
    if (tokens.length > 0 && tokens[tokens.length - 1].type == CodeAssist.Token.Types.numberLiteral) {
        /*
            This is for catching the case where the user types an integer and a period.
            Code assist is triggered, but because the integer and the period is
            parsed together into a single token, code assist thinks it's being invoked
            but on an empty string (such as by pressing ctrl-space or alt-space). If
            we don't catch it here, it'll show the search popup.
        */
        return;
    }
    
    var segments = [];
    for (var i = tokens.length - 1; i >= 0; i--) {
        var token = tokens[i];
        if (token.type == CodeAssist.Token.Types.identifier) {
            segments.unshift(token.content);
        } else if (token.type == CodeAssist.Token.Types.operator && token.content == ".") {
            segments.unshift(".");
        } else if (token.type == CodeAssist.Token.Types.error) {
            if (segments.length == 0) {
                return; // first preceding token is an error token, such as an unclosed string
            } else {
                break;
            }
        } else if (token.type != CodeAssist.Token.Types.whitespace) {
            break;
        }
    }
    
    segments = segments.join("");
    while (true) {
        var segments2 = segments.replace(/\.\./g, '.');
        if (segments != segments2) {
            segments = segments2;
        } else {
            break;
        }
    }
    
    var self = this;
    var offset = $(this._container).offset();
    offset.left -= this._editor.win.document.body.scrollLeft + document.body.scrollLeft;
    offset.top -= this._editor.win.document.body.scrollTop + document.body.scrollTop;
    
    var dot = segments.lastIndexOf(".");
    if (dot >= 0) {
        var prefix = segments.substr(dot + 1);
        segments = segments.substr(0, dot);
    } else {
        var prefix = segments;
        segments = "";
    }
    var replaceToken = function(text, onDone, offset, extent) {
        try {
            var line = self._editor.nthLine(editorLine + 1);
            var startCol = editorColumn - prefix.length;
            var endCol = editorColumn;
            
            self._editor.selectLines(line, startCol, line, endCol);
            self._editor.editor.replaceSelection(text); 
            // for IE, we need to call the codemirror's internal editor field's method.
            // otherwise, codemirror's own replaceSelection method will call focus(), which messes up the selection in IE.
        } catch (e) {}
        
        offset = offset || text.length;
        extent = extent || text.length;
        window.setTimeout(function() {
            self._editor.selectLines(line, startCol + offset, line, startCol + extent);
            self._editor.editor.highlightAtCursor();
            
            self._editor.focus();
            
            if (onDone) {
                onDone(startCol + extent);
            }
        }, 100);
    };
    
    var onCommit = function(entry) {
        self._cancelPopup();
        
        if (typeof entry == "string") {
            replaceToken(entry);
            
        } else if (entry.type == "module") {
            replaceToken(entry.label + ".", function() {
                self.startAssistAtCursor();
            });
        } else if (entry.type == "hash") {
            replaceToken(entry.label + "[");
        } else if (entry.type == "function") {
            var argCount = "paramInfo" in entry ? entry.paramInfo.length : entry.params.length;
            if (argCount > 0) {
                replaceToken(entry.label + "(", function(newColumn) {
                    var p = self._editor.cursorPosition(false);
                    var l = self._editor.lineNumber(p.line) - 1;
                    var col = p.character;
                    var s = self._editor.lineContent(p.line);
                    var currentNodeInfo = self._findCurrentNode(p, l, col, s);

                    self._showFunctionArgumentAssistance(entry, 0, currentNodeInfo);
                });
            } else {
                replaceToken(entry.label + "()");
            }
        } else {
            replaceToken(entry.label);
        }
    };
    var onKeyDown = function(evt, text) {
        if (editorColumn > 0 && evt.keyCode == 8 && text.length == 0) { // backspace
            self._cancelPopup();
            self._editor.focus();
            
            var line = self._editor.nthLine(editorLine + 1);
            self._editor.selectLines(line, editorColumn - 1, line, editorColumn);
            self._editor.editor.replaceSelection(""); 
            
        } else if (evt.keyCode == 190 || evt.charCode == 46) { // .
            replaceToken(text + ".", function() {
                self.startAssistAtCursor();
            });
        } else if (evt.keyCode == 57 || evt.charCode == 40) { // (
            replaceToken(text + "(", function() {
                self._scheduleAutoAssist("(");
            });
        } else {
            return;
        }
        
        evt.returnValue = false;
        evt.cancelBubble = true;
        if ("preventDefault" in evt) {
            evt.preventDefault();
        }
        return false;
    };

    var createPopup = function() {
        self._popup = new CueCard.Popup(
            Math.round(offset.left + positioning.left),
            Math.round(offset.top + positioning.top),
            Math.round(positioning.height),
            [ window, self._editor.win ],
            {
                onCancel: function(mode) {
                    if (mode == "key") {
                        self._editor.focus();
                    }
                }
            }
        );
        self._popup.elmt.html('<div></div>');
    };
    
    if (segments.length == 0) {
        createPopup();
        new CueCard.SuggestionController(
            self._popup, 
            self._popup.elmt[0].firstChild, 
            new CodeAssist.SearchSuggestor(this._getLocalVariables(), onCommit, onKeyDown),
            prefix
        );
    } else {
        var url = CodeAssist.helperUrl + "assist?segments=" + encodeURIComponent(segments);
        var onDone = function(o) {
            if (o.length > 0) {
                createPopup();
                new CueCard.SuggestionController(
                    self._popup, 
                    self._popup.elmt[0].firstChild, 
                    new CodeAssist.ScopedSuggestor(o, onCommit, onKeyDown),
                    prefix
                );
            }
        };
        var onError = function() {
        };
        
        CueCard.JsonpQueue.call(
            url,
            onDone,
            onError
        );
    }
};

CodeAssist.prototype._getLocalVariables = function() {
    var results = [];
    
    var trim = function(s) {
        return s.replace(/^\s+/, '').replace(/\s+$/, '');
    };
    
    var elmts = this._editor.win.document.getElementsByTagName("span");
    for (var i = 0; i < elmts.length; i++) {
        var variableElmt = elmts[i];
        if (variableElmt.className == "js-variable") {
            var pnode = variableElmt.previousSibling;
            var isDeclaration = false;
            var isFunction = false;
            while (pnode != null) {
                if (pnode.className == "js-keyword") {
                    var keyword = trim(pnode.firstChild.nodeValue);
                    if (keyword == "var") {
                        isDeclaration = true;
                    } else if (keyword == "function") {
                        isDeclaration = true;
                        isFunction = true;
                    }
                    break;
                } else if (pnode.className != "whitespace") {
                    break;
                }
                pnode = pnode.previousSibling;
            }
            
            if (isDeclaration) {
                var name = trim(variableElmt.firstChild.nodeValue);
                
                results.push({
                    label:          name,
                    type:           "var",
                    description:    isFunction ? "local function" : "local variable"
                });
            }
        } else if (variableElmt.className == "js-variabledef") {
            var name = trim(variableElmt.firstChild.nodeValue);
            
            results.push({
                label:         name,
                type:          "var",
                description:   "local variable or function argument"
            });
        }
    }
    
    return results;
};

CodeAssist.prototype._internalStartFunctionArgumentAssist = function(
    positioning,
    editorLine, 
    editorColumn, 
    code,
    codeOffset
) {
    var tokenizer = new CodeAssist.QueryTokenizer(code, 0, codeOffset);
    var tokens = [];
    var token;
    while (
        (token = tokenizer.token()) != null && 
        tokens.length < 1000 // in case the parser goes berserk?
    ) {
        tokens.push(token);
        tokenizer.next();
    }
    
    if (tokens.length == 0) {
        return;
    }
    
    var nestingLevel = 0;
    var argumentIndex = 0;
    for (var i = tokens.length - 1; i >= 0; i--) {
        var token = tokens[i];
        if (token.type == CodeAssist.Token.Types.delimiter) {
            if (token.content == "(" || token.content == "[" || token.content == "{") {
                if (nestingLevel == 0) {
                    i--;
                    break;
                } else {
                    nestingLevel--;
                }
            } else if (token.content == ")" || token.content == "]" || token.content == "}") {
                nestingLevel++;
            } else if (token.content == ",") {
                if (nestingLevel == 0) {
                    argumentIndex++;
                }
            }
        }
    }
    
    if (token == null || nestingLevel > 0) {
        // Something funny in the code: we got more ) than (.
        return;
    }
    
    var segments = [];
    for (; i >= 0; i--) {
        var token = tokens[i];
        if (token.type == CodeAssist.Token.Types.identifier) {
            segments.unshift(token.content);
        } else if (token.type == CodeAssist.Token.Types.operator && token.content == ".") {
            segments.unshift(".");
        } else if (token.type != CodeAssist.Token.Types.whitespace) {
            break;
        }
    }
    
    segments = segments.join("");
    while (true) {
        var segments2 = segments.replace(/\.\./g, '.');
        if (segments != segments2) {
            segments = segments2;
        } else {
            break;
        }
    }
    
    if (segments.length == 0) {
        // We might just be inside a subexpression (...)
        return;
    }
    
    var self = this;
    var createPopup = function() {
        var offset = $(self._container).offset();
        offset.left -= self._editor.win.document.body.scrollLeft + document.body.scrollLeft;
        offset.top -= self._editor.win.document.body.scrollTop + document.body.scrollTop;
        
        self._popup = new CueCard.Popup(
            Math.round(offset.left + positioning.left),
            Math.round(offset.top + positioning.top),
            Math.round(positioning.height),
            [ window, self._editor.win ],
            {}
        );
    };
    
    var url = CodeAssist.helperUrl + "assist_args?segments=" + encodeURIComponent(segments);
    var onDone = function(o) {
        if (o) {
            createPopup();
            self._showFunctionArgumentAssistance(o, argumentIndex, positioning);
        }
    };
    var onError = function() {
    };
    
    CueCard.JsonpQueue.call(
        url,
        onDone,
        onError
    );
};

CodeAssist.prototype._showFunctionArgumentAssistance = function(entry, argumentIndex, positioning) {
    var self = this;
    var offset = $(this._container).offset();
    offset.left -= this._editor.win.document.body.scrollLeft + document.body.scrollLeft;
    offset.top -= this._editor.win.document.body.scrollTop + document.body.scrollTop;
    
    if (this._popup == null) {
        this._popup = new CueCard.Popup(
            Math.round(offset.left + positioning.left),
            Math.round(offset.top + positioning.top),
            Math.round(positioning.height),
            [ window, this._editor.win ],
            {
                onCancel: function(mode) {
                    if (mode == "key") {
                        self._editor.focus();
                    }
                }
            }
        );
    } else {
        this._popup.elmt.empty();
    }
    
    var divLine = $('<div class="codeAssist-argumentAssist-singleLine"></div>').appendTo(this._popup.elmt);
    if ("paramInfo" in entry) {
        for (var i = 0; i < entry.paramInfo.length; i++) {
            var info = entry.paramInfo[i];
            
            if (i > 0) {
                $('<span>, </span>').appendTo(divLine);
            }
            
            if (i == argumentIndex) {
                $('<b>' + info.name + '</b>').appendTo(divLine);
                
                var details =
                    $('<div class="codeAssist-argumentAssist-details">' +
                        '<span class="codeAssist-argumentAssist-type">' + info.type + '</span>' +
                        ', <span class="codeAssist-argumentAssist-optional">' + (info.optional ? 'optional' : 'required') + '</span>' +
                        ': <span class="codeAssist-argumentAssist-description">' + info.description + '</span>' +
                      '</div>').appendTo(this._popup.elmt);
                      
                if ("structure" in info) {
                    var structureDiv = $('<div class="codeAssist-argumentAssist-structure">Keys:</div>').appendTo(details);
                    var structureList = $('<ul></ul>').appendTo(structureDiv);
                    
                    for (var j = 0; j < info.structure.length; j++) {
                        var field = info.structure[j];
                        $('<li>' + field.name + ' (' + field.type + '): ' + field.description + '</li>').appendTo(structureList);
                    }
                }
            } else {
                $('<span>' + info.name + '</span>').appendTo(divLine);
            }
        }
    } else {
        for (var i = 0; i < entry.params.length; i++) {
            if (i > 0) {
                $('<span>, </span>').appendTo(divLine);
            }
            
            if (i == argumentIndex) {
                $('<b>' + entry.params[i] + '</b>').appendTo(divLine);
            } else {
                $('<span>' + entry.params[i] + '</span>').appendTo(divLine);
            }
        }
    }
    this._popup.reposition();
};

CodeAssist.renderApiSuggestion = function(suggestion, prefix) {
    if ("type" in suggestion && suggestion.type == "function") {
        if ("paramInfo" in suggestion) {
            var params = [];
            $.each(suggestion.paramInfo, function() { params.push(this.name); });
            suggestion.hint = "(" + params.join(", ") + "): " + suggestion.description;
        } else {
            suggestion.hint = "(" + suggestion.params.join(", ") + "): " + suggestion.description;
        }
    } else if ("description" in suggestion) {
        suggestion.hint = suggestion.description;
    }

    var label = suggestion.label;
    if (prefix.length > 0) {
        var offset = label.toLowerCase().indexOf(prefix);
        label = label.substr(0, offset) + "<b>" + label.substr(offset, prefix.length) + "</b>" + label.substr(offset + prefix.length);
    }
    
    var className = "cuecard-suggestion-entry codeAssist-entry";
    var deprecation = "";
    if ("deprecated" in suggestion && suggestion.deprecated) {
        className += " codeAssist-deprecated";
        
        deprecation = '<div class="codeAssist-deprecation">Deprecated';
        if ("see" in suggestion) {
            deprecation += " - see " + (typeof suggestion.see == 'string' ? suggestion.see : suggestion.see.join(", "));
        }
        deprecation += "</div>";
    }

    suggestion.elmt = $('<a class="' + className + '" href="javascript:{}">' +
        '<span class="codeAssist-entry-title">' + label + '</span>' + deprecation +
        ("hint" in suggestion ? (' <span class="cuecard-suggestion-hint">' + suggestion.hint + '</span>') : '') + 
      '</a>');
};

/*----------------------------------------------------------------------
 *  ScopedSuggestor
 *----------------------------------------------------------------------
 */
 
CodeAssist.ScopedSuggestor = function(o, onCommit, onKeyDown) {
    this._suggestions = o;
    this._onCommit = onCommit;
    this.onKeyDown = onKeyDown;
    
    for (var i = 0; i < this._suggestions.length; i++) {
        var suggestion = this._suggestions[i];
        CodeAssist.renderApiSuggestion(suggestion, "");
    }
};

CodeAssist.ScopedSuggestor.prototype.getSuggestions = function(prefix, onDone) {
    var suggestions = [];
    for (var i = 0; i < this._suggestions.length; i++) {
        var suggestion = this._suggestions[i];
        if (prefix.length == 0 || suggestion.label.indexOf(prefix) >= 0) {
            suggestions.push(suggestion);
        }
    }
    onDone(suggestions);
};

CodeAssist.ScopedSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};

/*----------------------------------------------------------------------
 *  SearchSuggestor
 *----------------------------------------------------------------------
 */
 
CodeAssist.SearchSuggestor = function(localVariables, onCommit, onKeyDown) {
    this._localVariables = localVariables;
    this._onCommit = onCommit;
    this.onKeyDown = onKeyDown;
    
    for (var i = 0; i < localVariables.length; i++) {
        var suggestion = localVariables[i];
        CodeAssist.renderApiSuggestion(suggestion, "");
    }
};

CodeAssist.SearchSuggestor.prototype.getSuggestions = function(prefix, onDone) {
    var url = CodeAssist.helperUrl + 
        (prefix.length == 0 ? "assist?segments=" : ("search?q=" + encodeURIComponent(prefix)));
        
    var suggestions = [];
    for (var i = 0; i < this._localVariables.length; i++) {
        var localVariable = this._localVariables[i];
        if (prefix.length == 0 || localVariable.label.toLowerCase().indexOf(prefix) >= 0) {
            suggestions.push(localVariable);
        }
    }
    
    var onDone2 = function(o) {
        for (var i = 0; i < o.length; i++) {
            var suggestion = o[i];
            CodeAssist.renderApiSuggestion(suggestion, prefix);
            suggestions.push(suggestion);
        }
        onDone(suggestions);
    };
    var onError = function() {
        onDone(suggestions);
    };
    
    CueCard.JsonpQueue.call(
        url,
        onDone2,
        onError
    );
};

CodeAssist.SearchSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};

/*----------------------------------------------------------------------
 *  QueryTokenizer and token stuff
 *----------------------------------------------------------------------
 */
CodeAssist.QueryTokenizer = function(text, startIndex, endIndex) {
    this._text = text + " "; // make it easier to parse
    this._maxIndex = endIndex;
    this._index = startIndex;
    this._line = 0;
    this._col = 0;
    
    this.next();
};

CodeAssist.QueryTokenizer.prototype.token = function() {
    return this._token;
};

CodeAssist.QueryTokenizer.prototype.index = function() {
    return this._index;
};

CodeAssist.QueryTokenizer._whitespaces = " \t\r\n";

CodeAssist.QueryTokenizer.prototype.next = function() {
    this._token = null;
    
    if (this._index < this._maxIndex) {
        var c1 = this._text.charAt(this._index);
        var c2 = this._text.charAt(this._index + 1);
        var self = this;
        
        function advance() {
            self._index++;
            self._col++;
        }
        function makeCurrentPos() {
            return new CodeAssist.TokenPos(self._index, self._line, self._col);
        };
        function makeCurrentPosAndIncrement() {
            var pos = makeCurrentPos();
            advance();
            return pos;
        };
        function makeSimpleToken(type, startPos, text) {
            var endPos = makeCurrentPos();
            self._pos = endPos;
            self._token = new CodeAssist.Token(
                type, 
                text || self._text.substring(startPos.offset, endPos.offset),
                startPos,
                endPos
            );
        };
        
        function parseWhitespace() {
            var startPos = makeCurrentPos();
            while (self._index < self._maxIndex) {
                var c = self._text.charAt(self._index);
                if (CodeAssist.QueryTokenizer._whitespaces.indexOf(c) < 0) {
                    break;
                }
                
                if (c == "\n") {
                    self._line++;
                    self._col = 0;
                } else {
                    self._col++;
                }
                self._index++;
            }
            makeSimpleToken(CodeAssist.Token.Types.whitespace, startPos);
        };
        
        function parseString(opener) {
            var startPos = makeCurrentPos();
            advance();
            
            var text = "";
            var properlyClosed = false;
            while (self._index < self._maxIndex) {
                c1 = self._text.charAt(self._index);
                if (c1 == opener) {
                    advance();
                    properlyClosed = true;
                    break;
                } else if (c1 == '\r' || c1 == '\n') {
                    break;
                }
                
                if (c1 == "\\") {
                    advance();
                    text += self._text.charAt(self._index);
                } else {
                    text += c1;
                }
                advance();
            }
            
            makeSimpleToken(CodeAssist.Token.Types[properlyClosed ? "stringLiteral" : "error"], startPos, text);
        };
        
        function parseNumber() {
            var startPos = makeCurrentPos();
            
            var sign = 1;
            if (c1 == '+') {
                advance();
            } else if (c1 == '-') {
                advance();
                sign = -1;
            }
            
            while (self._index < self._maxIndex &&
                   CodeAssist.QueryTokenizer._isDigit(self._text.charAt(self._index))) {
                advance();
            }
            
            if (self._index < self._maxIndex &&
                self._text.charAt(self._index) == '.') {
                
                advance();
                
                while (self._index < self._maxIndex &&
                       CodeAssist.QueryTokenizer._isDigit(self._text.charAt(self._index))) {
                    advance();
                }
            }
            
            makeSimpleToken(CodeAssist.Token.Types.numberLiteral, startPos);
        };
        
        var keywords = {
            "function" : true,
            "return" : true,
            "if" : true,
            "else" : true,
            "for" : true,
            "while" : true,
            "do" : true,
            "break" : true,
            "break" : true,
            "switch" : true,
            "case" : true,
            "default" : true,
            "with" : true,
            "try" : true,
            "catch" : true,
            "finally" : true,
            "throw" : true,
            "instanceof" : true,
            "typeof" : true,
            "in" : true
        };
        function parseIdentifier() {
            var startPos = makeCurrentPos();
            while (self._index < self._maxIndex) {
                var c3 = self._text.charAt(self._index);
                if (CodeAssist.QueryTokenizer._identifierCharacters.indexOf(c3) >= 0 ||
                    CodeAssist.QueryTokenizer._identifierPrefix.indexOf(c3) >= 0) {
                    advance();
                } else {
                    break;
                }
            }
            
            var endPos = makeCurrentPos();
            var content = self._text.substring(startPos.offset, endPos.offset);
            self._pos = endPos;
            if (content in keywords) {
                self._token = new CodeAssist.Token(
                    CodeAssist.Token.Types.keyword, 
                    content,
                    startPos,
                    endPos
                );
            } else {
                self._token = new CodeAssist.Token(
                    CodeAssist.Token.Types.identifier, 
                    content,
                    startPos,
                    endPos
                );
            }
        };
        
        function parseLineComment() {
            var startPos = makeCurrentPos();
            
            // Swallow both slashes
            advance(); 
            advance();
            
            while (self._index < self._maxIndex && self._text.charAt(self._index) != "\n") {
                advance();
            }
            
            var endPos = makeCurrentPos();
            var content = self._text.substring(startPos.offset, endPos.offset);
            self._pos = endPos;
            self._token = new CodeAssist.Token(
                CodeAssist.Token.Types.endOfLineComment, 
                content,
                startPos,
                endPos
            );
        };
        
        function parseComment() {
            var startPos = makeCurrentPos();
            
            // Swallow /*
            advance(); 
            advance();
            
            var properlyClosed = false;
            while (self._index < self._maxIndex) {
                c1 = self._text.charAt(self._index);
                c2 = self._text.charAt(self._index + 1);
                
                if (c1 == "*" && c2 == "/") {
                    advance();
                    advance();
                    properlyClosed = true;
                    break;
                } else {
                    advance();
                }
            }
            
            var endPos = makeCurrentPos();
            var content = self._text.substring(startPos.offset, endPos.offset);
            self._pos = endPos;
            self._token = new CodeAssist.Token(
                CodeAssist.Token.Types[properlyClosed ? "comment" : "error"], 
                content,
                startPos,
                endPos
            );
        };
        
        function parseRegex() {
            var startPos = makeCurrentPos();
            
            // Swallow /
            advance(); 
            
            var properlyClosed = false;
            while (self._index < self._maxIndex) {
                c1 = self._text.charAt(self._index);
                
                advance();
                if (c1 == "/") {
                    properlyClosed = true;
                    break;
                } else if (c1 == "\\" && self._index < self._maxIndex) {
                    advance();
                }
            }
            
            if (self._index < self._maxIndex && "gi".indexOf(self._text.charAt(self._index)) >= 0) {
                advance();
            }
            
            var endPos = makeCurrentPos();
            var content = self._text.substring(startPos.offset, endPos.offset);
            self._pos = endPos;
            self._token = new CodeAssist.Token(
                CodeAssist.Token.Types[properlyClosed ? "regexLiteral" : "error"], 
                content,
                startPos,
                endPos
            );
        };
        
        function parseOperator() {
            makeSimpleToken(CodeAssist.Token.Types.operator, makeCurrentPosAndIncrement());
        };
        
        if (CodeAssist.QueryTokenizer._whitespaces.indexOf(c1) >= 0) {
            parseWhitespace();
        } else if (c1 == "/") {
            if (c2 == "/") {
                parseLineComment();
            } else if (c2 == "*") {
                parseComment();
            } else {
                /*
                 *  TODO: This could be a regex or just a divide operator.
                 *  Right now we just assume that if there's whitespace after / then
                 *  it's a divide operator. A fancier way would be to parse ahead
                 *  and roll back.
                 */
                
                if (CodeAssist.QueryTokenizer._whitespaces.indexOf(c2) >= 0) {
                    makeSimpleToken(CodeAssist.Token.Types.operator, makeCurrentPosAndIncrement());
                } else {
                    parseRegex();
                }
            }
        } else if ("[{()}],:;".indexOf(c1) >= 0) {
            makeSimpleToken(CodeAssist.Token.Types.delimiter, makeCurrentPosAndIncrement());
        } else if (c1 == '"' || c1 == "'") {
            parseString(c1);
        } else if (c1 == "-" || c1 == "+" || CodeAssist.QueryTokenizer._isDigit(c1)) {
            parseNumber();
        } else if ("<>=!+-*/?&.".indexOf(c1) >= 0) {
            parseOperator();
        } else if (CodeAssist.QueryTokenizer._identifierPrefix.indexOf(c1) >= 0) {
            parseIdentifier();
        } else {
            makeSimpleToken(CodeAssist.Token.Types.error, makeCurrentPosAndIncrement());
        }
    }
    
    return this._token;
};

CodeAssist.QueryTokenizer._isDigit = function(c) {
    return "0123456789".indexOf(c) >= 0;
};

CodeAssist.QueryTokenizer._identifierPrefix = "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$";
CodeAssist.QueryTokenizer._identifierCharacters = "0123456789";

CodeAssist.TokenPos = function(offset, line, col) {
    this.offset = offset;
    this.line = line;
    this.col = col;
}

CodeAssist.Token = function(type, content, start, end) {
    this.type = type;
    this.content = content;
    this.start = start;
    this.end = end;
};

CodeAssist.Token.Types = {
    error:              -1,
    whitespace:         0,
    operator:           1,
    delimiter:          2,  // including [{()}],:;
    numberLiteral:      3,
    stringLiteral:      4,
    booleanLiteral:     5,
    regexLiteral:       6,
    keyword:            7,
    identifier:         8,
    comment:            9,
    endOfLineComment:   10
};