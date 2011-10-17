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

CueCard.QueryEditor = function(elmt, options) {
    this._container = elmt;
    this._options = options;
    this._outputPane = null;
    this._controlPane = null;
    this._warnWrites = false;
    
    this._assistKeyComboDetected = false;
    this._popup = null;
    
    var self = this;
            
    var content = "[{\n  \n}]";
    var selectLine = 1;
    var selectCol = 2;
    if ("content" in options) {
        content = options.content;
        selectLine = 0;
        selectCol = 0;
    }
    
    var codeMirrorOptions = {
        basefiles           : [],
        parserfile          : [fb.acre.libs.codemirror],     // see index.sjs
        stylesheet          : [fb.acre.libs.codemirror_css], // see index.sjs
        parserConfig:       {json: true}, 
        height:             "100%",
        autoMatchParens:    true,
        textWrapping:       false,
        highlightActiveLine : true,
        readOnly:           "readOnly" in options ? options.readOnly : false,
        content:            content,
        passDelay           : 100,     // gap between highlighting runs (each run lasts 50ms - see passTime in codemirror.js)
        undoDelay           : 250,     // min time between onChange notifications (and undo history commit)
        initCallback: function(codeMirror) {
            self._onReady();
            
            try {
                var handle = self._editor.nthLine(selectLine + 1);
                self._editor.selectLines(handle, selectCol, handle, selectCol);
            } catch (e) {}
            
            if ("onReady" in options) {
                options["onReady"]();
            }
            if (options["focusOnReady"]) {
                self.focus();
            }
        }
    };
    
    if ("onChange" in options) {
        codeMirrorOptions.onChange = options.onChange;
    }
    if (options.codeMirror) {
        $.extend(codeMirrorOptions, options.codeMirror);
    }
    
    this._overflowInput = $('<input></input>')
        .css("position", "absolute")
        .css("left", "-500px")
        .css("top", "0px")
        .appendTo(document.body);
        
    $(this._container).acre(fb.acre.apps.cuecard + "/query-editor", "query_editor", [this, codeMirrorOptions]);
};

CueCard.QueryEditor.nativeTypes = {
    '/type/int': true,
    '/type/float': true,
    '/type/boolean': true,
    '/type/rawstring': true,
    '/type/uri': true,
    '/type/datetime': true,
    '/type/bytestring': true,
    //'/type/key': true,
    '/type/value': true,
    '/type/text': true,
    '/type/enumeration':true
};

CueCard.QueryEditor.prototype.dispose = function() {
    this._cancelPopup();
    
    $(this._editor._top_element).remove();
    
    this._overflowInput.remove();
    this._controlTopContainer.remove();
    this._controlBottomContainer.remove();
    this._iframeContainer.remove();
    
    this._editor = null;
    this._overflowInput = null;
    this._controlTopContainer = null;
    this._controlBottomContainer = null;
    this._iframeContainer = null;
};

CueCard.QueryEditor.prototype._addCodemirror = function(el, options) {
    this._editor = new CodeMirror(
        function(iframe) {
            el.append(iframe);
        },
        options
    );
};

CueCard.QueryEditor.prototype.setOutputPane = function(outputPane) {
    this._outputPane = outputPane;
};

CueCard.QueryEditor.prototype.getOutputPane = function() {
    return this._outputPane;
};

CueCard.QueryEditor.prototype.setControlPane = function(controlPane) {
    this._controlPane = controlPane;
};

CueCard.QueryEditor.prototype.getControlPane = function() {
    return this._controlPane;
};

CueCard.QueryEditor.prototype.focus = function() {
    this._editor.focus();
    return this;
};

CueCard.QueryEditor.prototype.content = function(content) {
    if (content == undefined) {
        return this._editor.getCode();
    } else {
        var oldContent = this._editor.getCode();
        if (oldContent != content) {
            var editor = this._editor.editor;
            editor.history.push(
                null, 
                null, 
                this._editor.win.fixSpaces(content.replace(/\t/g, "  ").replace(/\u00a0/g, " ")).replace(/\r\n?/g, "\n").split("\n")
            );
            editor.addDirtyNode();
            editor.scheduleHighlight();
            if (editor.history.onChange) {
                editor.history.onChange();
            }
        }
        
        // We don't use this._editor.setCode() here because it resets the undo/redo history.
        return this;
    }
};

CueCard.QueryEditor.prototype.getUnresolvedQuery = function() {
    var m = this.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    
    return CueCard.jsonize(q, this.getJsonizingSettings({ 
        breakLines: false, 
        omitWhitespace: true, 
        variables: this._getVariables(), 
        resolveVariables: false 
    }));
};

CueCard.QueryEditor.prototype.getResolvedQueryEnvelope = function(options) {
    return this._getResolvedQueryEnvelope(false, options);
};

CueCard.QueryEditor.prototype.getJsonizingSettings = function(o) {
    if (this._controlPane) {
        return this._controlPane.getJsonizingSettings(o);
    } else {
        o = o || {};
        if (!("indentCount" in o)) {
            o.indentCount = 2;
        }
        return o;
    }
};

CueCard.QueryEditor.prototype._getVariables = function() {
    if (this._controlPane) {
        return this._controlPane.getVariables();
    } else {
        return {};
    }
};

CueCard.QueryEditor.prototype._getQueryEnvelope = function() {
    if (this._controlPane) {
        return this._controlPane.getQueryEnvelope();
    } else {
        return {};
    }
};

CueCard.QueryEditor.prototype._getResolvedQueryEnvelope = function(cleanUp, options) {
    options = options || {};
    
    var m = this.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    options.isWriteQuery = this._isWriteQuery(q);
    
    var envelope = this._getQueryEnvelope();
    var variables = this._getVariables();
    
    if (cleanUp) {
        this.content(CueCard.jsonize(q, this.getJsonizingSettings({ variables: variables, resolveVariables: false })));
        
        try {
            // Parse it again and try to put the cursor where it logically was
            var m2 = this.getQueryModelAndContext();
            var newPos = m2.model.getCursorFromContext(m.context);
            var handle = this._editor.nthLine(newPos.line + 1);
            this._editor.selectLines(handle, newPos.col);
        } catch (e) {
        }
    }
    
    envelope.query = q;
    
    return CueCard.jsonize(envelope, this.getJsonizingSettings({ breakLines: false, variables: variables, resolveVariables: true }));
};

CueCard.QueryEditor.prototype._isWriteQuery = function(q) {
    var f = function(o) {
        if (o == null) {
            return false;
        } else if (o instanceof Array) {
            if (o.length > 0 && typeof o[0] == "object") {
                for (var i = 0; i < o.length; i++) {
                    if (f(o[i])) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        } else if (typeof o == "object") {
            for (var n in o) {
                if (n == "connect" || n == "create" || f(o[n])) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    };
    return f(q);
};

CueCard.QueryEditor.prototype._confirmWriteQuery = function(options) {
    return (options.isWriteQuery && !this._warnWrites && CueCard.apiProxy.base.indexOf("sandbox") < 0);
};

CueCard.QueryEditor.prototype.getMqlReadURL = function() {
    var options = {};
    var q = this.getResolvedQueryEnvelope(options);
    
    var serviceUrl = CueCard.freebaseServiceUrl + 'api/service/' + (options.isWriteQuery ? 'mqlwrite' : 'mqlread');
    if ("service" in this._options && this._options.service != null) {
        serviceUrl = this._options.service;
    }
    
    return serviceUrl + '?query=' + encodeURIComponent(q);
};

CueCard.QueryEditor.prototype.run = function(forceCleanUp) {
    if (this._outputPane != null) {
        var options = {};
        var q = this._getResolvedQueryEnvelope(forceCleanUp || (this._controlPane && this._controlPane.getSetting("cleanup")), options);
        
        if (this._confirmWriteQuery(options)) {
            if (window.confirm("Your query will write data into Freebase.\nAre you sure you want to do that?")) {
                this._warnWrites = true;
            } else {
                return;
            }
        }
        
        /*
         *  A small hack to let Andi debug uMql, and for Warren to debug his new mql.
         */
        var url = CueCard.apiProxy.base + CueCard.apiProxy[options.isWriteQuery ? 'write' : 'read'] +
            ("emql" in this._options && this._options.emql ? "emql=1&" : "") +
            ("debug" in this._options ? ("debug=" + this._options.debug + "&") : "") +
            ("service" in this._options && this._options.service != null ? ("service=" + encodeURIComponent(this._options.service) + "&") : "");
        
        var self = this;
        var onDone = function(o) {
            if (o["error"] == "unauthorized") {
                self._outputPane.setStatus("Query editor is not authorized to write on your behalf.");
                self._options.onUnauthorizedMqlWrite();
            } else {
                self._outputPane.renderResponseHeaders(o.headers);
              
                var options = {};
                if (self._controlPane != null && self._controlPane.getSetting("multilineErrorMessages") && 
                    "code" in o.body && o.body.code == "/api/status/error" && "messages" in o.body && o.body.messages != null) {
                    options["encodeJavascriptString"] = function(x) { return x; };
                }
                self._outputPane.setJSONContent(o.body, self.getJsonizingSettings(options));
            }
        };
        var onError = function(msg) {
            alert(msg);
        }
        
        this._outputPane.setStatus("Querying...");
        if (options.isWriteQuery || q.length > 1024) {
            $.post(url, { "query" : q }, onDone, "json");
        } else {
            CueCard.JsonpQueue.call(url + "query=" + encodeURIComponent(q), onDone, onError);
        }
    }
    if ("onRun" in this._options) {
        this._options["onRun"]();
    }
};

CueCard.QueryEditor.prototype.getQueryModelAndContext = function() {
    var pos = this._editor.cursorPosition(false);
    var lineNo = this._editor.lineNumber(pos.line) - 1;
    var colNo = pos.character;
    
    return CueCard.QueryParser.parseForContext(this._editor.getCode(), 0, lineNo, colNo);
};

CueCard.QueryEditor.prototype._onReady = function() {
    var self = this;
    try {
        $(this._editor.win.document).keyup(function(evt) {
            return self._onEditorKeyUp(evt);
        }).keydown(function(evt) {
            return self._onEditorKeyDown(evt);
        }).mousedown(function(evt) {
            return self._onEditorMouseDown(evt);
        });
    } catch (e) {
        alert("Unable to install keyup handler on codemirror window");
    }
    
    if ("cleanUp" in this._options && this._options.cleanUp) {
        this._editor.getCode();     // XXX fulhack... seem to run into timing issues on startup without this
        this._onCleanUp();
    }
};

CueCard.QueryEditor.prototype._onRun = function(forceCleanUp) {
    this.run(forceCleanUp);
};

CueCard.QueryEditor.prototype._onCleanUp = function() {
    var m = this.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    var variables = this._getVariables();
    this.content(CueCard.jsonize(q, this.getJsonizingSettings({ variables: variables, resolveVariables: false })));
};

CueCard.QueryEditor.prototype._onEditorMouseDown = function(evt) {
    
};

CueCard.QueryEditor.prototype._onEditorKeyDown = function(evt) {
    if (evt.keyCode == 9 || // tab
        (evt.keyCode == 32 && (evt.ctrlKey || evt.metaKey || evt.altKey)) // space with modifier
        ) {
        this._assistKeyComboDetected = true;
        evt.preventDefault();
        return false;
    } else {
        this._assistKeyComboDetected = false;
        
        if ((evt.metaKey || evt.ctrlKey) && evt.keyCode == 13) { // meta or ctrl-enter
            this._onRun(evt.shiftKey);
        }
    }
};

CueCard.QueryEditor.prototype._onEditorKeyUp = function(evt) {
    if (this._assistKeyComboDetected) {
        this._assistKeyComboDetected = false;
        this.startAssistAtCursor();
        
        evt.preventDefault();
        return false;
    }
};

CueCard.QueryEditor.prototype.startAssistAtCursor = function() {
    var p = this._editor.cursorPosition(false);
    var l = this._editor.lineNumber(p.line) - 1;
    var col = p.character;
    var s = this._editor.lineContent(p.line);
    
    var veryFirstContentNode = this._editor.win.document.body.firstChild;
    var previousNode = p.line || veryFirstContentNode;
    var node = previousNode.nextSibling;
    var c = col;
    while (c > 0 && 
        node != null && 
        node.tagName.toLowerCase() != "br" && 
        node.firstChild != null && 
        node.firstChild.nodeValue.length >= c
    ) {
        c -= node.firstChild.nodeValue.length;
        
        previousNode = node;
        node = node.nextSibling;
    }
    
    if (node == null || node.tagName.toLowerCase() == "br") {
        // Case: end of content or end of line
        if (node != null) {
            var offset = $(node).offset();
            if ($.browser.msie && previousNode != null && previousNode.tagName.toLowerCase() != "br") {
                var left = previousNode.offsetWidth;
                var height = previousNode.offsetHeight;
            } else {
                var left = offset.left;
                var height = node.offsetHeight;
            }
        } else {
            var offset = $(previousNode).offset();
            var charCount = previousNode.firstChild ? previousNode.firstChild.nodeValue.length : 0;
            var left = offset.left + (charCount == 0 ? 0 : (c * previousNode.offsetWidth / charCount));
            var height = previousNode.offsetHeight;
        }
        this._startAssist(l, col, {
            left:   left,
            top:    offset.top,
            height: height
        });
    } else {
        var offset = $(node).offset();
        var charCount = node.firstChild ? node.firstChild.nodeValue.length : 0;
        this._startAssist(l, col, {
            left:   offset.left + (charCount == 0 ? 0 : (c * node.offsetWidth / charCount)), 
            top:    offset.top,
            height: node.offsetHeight
        });
    }
};

CueCard.QueryEditor.prototype._startAssist = function(lineNo, columnNo, positioning) {
    this._cancelPopup();
    
    if (positioning != null) {
        var offset = $(this._iframeContainer).offset();
        offset.left -= this._editor.win.document.body.scrollLeft + document.body.scrollLeft;
        offset.top -= this._editor.win.document.body.scrollTop + document.body.scrollTop;
        
        var self = this;
        this._popup = new CueCard.Popup(
            Math.round(offset.left + positioning.left),
            Math.round(offset.top + positioning.top),
            Math.round(positioning.height),
            [ window, this._editor.win ],
            {
                onCancel: function(mode) {
                    if (mode == "key") {
                        self.focus();
                    }
                }
            }
        );
        this._popup.elmt.html('<div class="cuecard-popup-message">Please wait...</div>');
        
        var mc = this.getQueryModelAndContext();
        if (mc.context.length > 0) {
            var contextNode = mc.context[mc.context.length - 1];
            if ("relative" in contextNode) {
                if (contextNode.node.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
                    if (contextNode.relative == "path" || 
                        contextNode.relative == "before") {
                        
                        this._startSuggestProperties(lineNo, columnNo, mc, contextNode);
                        return;
                        
                    } else if (contextNode.relative == "space") {
                        /*
                         *  The cursor is where a value node should be. We need the
                         *  corresponding link to know what to suggest.
                         */
                        var link = contextNode.node.links[contextNode.child];
                        
                        this._startSuggestValues(lineNo, columnNo, mc, contextNode, link);
                        return;
                    }
                } else if (contextNode.node.type == CueCard.QueryNode.TYPE_TERMINAL) {
                    /*
                     *  Go up the context chain to find the link, which gives us hints
                     *  at what the values can be (topic types, number, boolean, etc.).
                     */
                    var link = null;
                    if (mc.context.length > 1) {
                        var outerContextNode = mc.context[mc.context.length - 2];
                        link = outerContextNode.node.links[outerContextNode.child];
                    }
                    this._startSuggestValues(lineNo, columnNo, mc, contextNode, link);
                    return;
                }
            } else {
                // This is the case of the bare token.
                
                /*
                 *  Go up the context chain to find the link, which gives us hints
                 *  at what the values can be (topic types, number, boolean, etc.).
                 */
                var link = null;
                if (mc.context.length > 1) {
                    var outerContextNode = mc.context[mc.context.length - 2];
                    if (outerContextNode.node.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
                        link = outerContextNode.node.links[outerContextNode.child];
                    } else if (mc.context.length > 2) {
                        outerContextNode = mc.context[mc.context.length - 3];
                        link = outerContextNode.node.links[outerContextNode.child];
                    }
                }
                
                this._startSuggestValues(lineNo, columnNo, mc, contextNode, link);
                return;
            }
        }
    }
    this._popup.elmt.html(
        '<div class="cuecard-popup-message">' + 
            'Sorry, we don\'t know how to assist you here. ' + 
            'Send us a link to this exact query using the links at the upper right corner and we will investigate. ' +
            'Thank you!' +
        '</div>'
    );
    //console.log(mc);
};

CueCard.QueryEditor.prototype._cancelPopup = function() {
    if (this._popup != null) {
        this._popup.cancel();
        this._popup = null;
    }
};

CueCard.QueryEditor.prototype._startSuggestProperties = function(lineNo, columnNo, mc, contextNode) {
    var self = this;
    
    var token = (contextNode.relative == "path") ? contextNode.node.links[contextNode.child].token : null;
    
    this._startBufferInput();
    this._prepareQueryForSuggestions(mc, lineNo, columnNo, token, function(cont, prefix, placeResult, globalPropertyMap) {
        var onLocatedInnerMostNonTerminal = function(cont2, result) {
            var types = [];
            var ids = [];
            var guids = [];
            
            result.node.getDeclaredTypes(types);
            result.node.getDeclaredIDs(ids);
            result.node.getDeclaredGUIDs(guids);
            
            var params = [];
            if (types.length > 0) {
                params.push("t=" + encodeURIComponent(types.join(",")));
            }
            if (ids.length > 0) {
                params.push("i=" + encodeURIComponent(ids.join(",")));
            }
            if (guids.length > 0) {
                params.push("g=" + encodeURIComponent(guids.join(",")));
            }
            if (result.property != null) {
                params.push("p=" + encodeURIComponent(result.property));
                params.push("r=" + result.reverse);
            }
            
            var url = CueCard.helper + "suggest-properties?" + params.join("&");
            CueCard.JsonpQueue.call(
                url,
                cont2.extend(onGotSuggestedProperties).onDone,
                cont.onError
            );
            
            return true; // don't clean up
        };
        var onGotSuggestedProperties = function(cont2, o) {
            self._suggestProperties(mc, o, prefix + self._stopBufferInput(), placeResult);
        };
        
        mc.model.locateInnerMostNonTerminal(
            mc.context, 
            cont.extend(onLocatedInnerMostNonTerminal)
        );
        return true;
    });
};

CueCard.QueryEditor.prototype._startBufferInput = function() {
    this._overflowInput[0].value = "";
    this._overflowInput[0].focus();
};

CueCard.QueryEditor.prototype._stopBufferInput = function() {
    return this._overflowInput[0].value;
};

CueCard.QueryEditor.prototype._suggestProperties = function(mc, suggestion, prefix, placeResult) {
    this._popup.elmt.empty();
    this._popup.elmt.html("<div></div>");
    
    var entries = [];
    for (var n in suggestion.properties) {
        var entry = suggestion.properties[n];
        var slash = n.lastIndexOf("/");
        var shortName = n.substr(slash + 1);
        var type = n.substr(0, slash);
        var explicit = entry.explicit;
        
        if ("parentProperty" in entry) {
            var resultPrefix = '"' + entry.parentProperty + '" : [{ "' + shortName + '" : ';
            var resultInfix = (entry.unique ? 'null' : '[]');
            var resultSuffix = ' }]';
            
            entries.push({
                label: shortName,
                hint: "of type " + type + " (through " + entry.parentProperty + ")",
                qualifiedProperty: n,
                result: resultPrefix + resultInfix + resultSuffix,
                offset: resultPrefix.length,
                extent: resultInfix.length,
                expectedTypes: entry.expectedTypes
            });
        } else {
            var resultPrefix = '"' + (explicit ? shortName : n) + '" : ';
            var expectedType = entry.expectedTypes.length > 0 ? entry.expectedTypes[0].id : "";
            var entry2 = {
                label: shortName,
                hint: "of type " + type,
                qualifiedProperty: n,
                expectedTypes: entry.expectedTypes
            };
            
            CueCard.QueryEditor.setPropertySuggestionSuffix(expectedType, entry2, entry.unique, resultPrefix);
            entries.push(entry2);
        }
    }
    
    var self = this;
    var suggestor = new CueCard.PropertySuggestor(
        this._popup,
        CueCard.MqlSyntax.KeywordSuggestions, 
        entries, 
        placeResult
    );
    var controller = new CueCard.SuggestionController(this._popup, this._popup.elmt[0].firstChild, suggestor, prefix);
};

CueCard.QueryEditor.setPropertySuggestionSuffix = function(expectedType, entry, unique, resultPrefix) {
    var resultSuffix = null;
    if (expectedType == "/common/image" || expectedType == "/common/document") {
        resultSuffix = '{ "id" : null, "optional" : true, "limit" : 3 }';
        if (!unique) {
            resultSuffix = "[" + resultSuffix + "]";
        }
    } else if (expectedType == "/measurement_unit/dated_integer") {
        resultSuffix = '{ "number" : null, "date" : null }';
        if (unique) {
            resultSuffix = "[" + resultSuffix + "]";
        }
    } else if (expectedType == "/measurement_unit/dated_money_value") {
        resultSuffix = '{ "amount" : null, "valid_date" : null, "currency" : null }';
        if (unique) {
            resultSuffix = "[" + resultSuffix + "]";
        }
    } else if (expectedType.indexOf("/type/") == 0) {
        resultSuffix = (unique ? 'null' : '[]');
    } else {
        resultSuffix = (unique ? '{}' : '[{}]');
    }
    entry.result = resultPrefix + resultSuffix;
    entry.offset = resultPrefix.length;
    entry.extent = resultSuffix.length;
};

CueCard.QueryEditor.prototype._startSuggestValues = function(lineNo, columnNo, mc, contextNode, link) {
    var self = this;
    
    var token = ("token" in contextNode) ? contextNode.token : null;
    
    this._startBufferInput();
    this._prepareQueryForSuggestions(mc, lineNo, columnNo, token, function(cont, prefix, placeResult, globalPropertyMap) {
        prefix += self._stopBufferInput();
        
        if (link != null && !link.reverse && CueCard.QueryNode.isMqlKeyword(link.path)) {
            self._suggestValuesForKeyword(lineNo, columnNo, mc, contextNode, link.path, prefix, placeResult);
        } else {
            function preparePopup() {
                self._popup.elmt.empty();
                self._popup.elmt.html('<div></div><div class="cuecard-suggestion-hint-message">Keep typing to search for topics of types fitting this point in the query.</div>');
            };
            
            var property = link.qualifiedProperty;
            var reverse = link.reverse;
            
            if (!reverse && (property == "/type/object/id" || property == "/type/object/guid" || property == "/type/object/name")) {
                /*
                 *  We need to know the possible types in order to suggest id and guid intelligently.
                 */
                var onLocatedInnerMostNonTerminal = function(cont2, result) {
                    preparePopup();
                    
                    var expectedTypes = [];
                    result.node.getDeclaredTypes(expectedTypes);
                    
                    if ("property" in result && result.property != null) {
                        var leadinProperty = result.property;
                        var leadinReverse = result.reverse;
                        
                        if (reverse) {
                            expectedTypes.push(leadinProperty.substr(0, leadinProperty.lastIndexOf("/")));
                        } else if (leadinProperty in globalPropertyMap) {
                            var expectedTypes2 = globalPropertyMap[leadinProperty].expectedTypes;
                            for (var t = 0; t < expectedTypes2.length; t++) {
                                expectedTypes.push(expectedTypes2[t].id);
                            }
                        }
                    }
                    
                    var suggestor = new CueCard.TypeBasedTopicSuggestor(
                        self._popup,
                        CueCard.MqlSyntax.SingleValueSuggestions, 
                        expectedTypes,
                        link.property,
                        placeResult
                    );
                    var controller = new CueCard.SuggestionController(self._popup, self._popup.elmt[0].firstChild, suggestor, prefix);
                };
                mc.model.locateInnerMostNonTerminal(
                    mc.context, 
                    cont.extend(onLocatedInnerMostNonTerminal)
                );
                return true;
            } else {
                preparePopup();
                
                var expectedTypes;
                var unique = false;
                
                if (reverse) {
                    expectedTypes = [ property.substr(0, property.lastIndexOf("/")) ];
                } else if (property == "/type/object/type") {
                    expectedTypes = [ "/type/type" ];
                } else if (property in globalPropertyMap) {
                    unique = globalPropertyMap[property].unique;
                    
                    expectedTypes = [];
                    var expectedTypes2 = globalPropertyMap[property].expectedTypes;
                    for (var t = 0; t < expectedTypes2.length; t++) {
                        expectedTypes.push(expectedTypes2[t].id);
                    }
                } else if (property == "/type/text/lang") {
                    expectedTypes = [ "/type/lang" ];
                } else {
                    expectedTypes = [];
                }
                
                var singleExpectedType = (expectedTypes.length == 1) ? expectedTypes[0] : null;
                
                if (singleExpectedType !== null && singleExpectedType in CueCard.QueryEditor.nativeTypes) {
                    var suggestor = new CueCard.StaticChoicesSuggestor(
                        CueCard.MqlSyntax[
                            singleExpectedType == "/type/text" ?
                                (unique ? "UniqueStringLiteralValueSuggestions" : "StringLiteralValueSuggestions") :
                                (unique ? "UniqueLiteralValueSuggestions" : "LiteralValueSuggestions")
                        ], 
                        placeResult
                    );
                } else {
                    var suggestor = new CueCard.TypeBasedTopicSuggestor(
                        self._popup,
                        CueCard.MqlSyntax[ unique ? "UniqueTopicValueSuggestions" : "TopicValueSuggestions" ], 
                        expectedTypes,
                        "id",
                        placeResult
                    );
                }
                var controller = new CueCard.SuggestionController(self._popup, self._popup.elmt[0].firstChild, suggestor, prefix);
            }
        }
    });
};

CueCard.QueryEditor.prototype._suggestValuesForKeyword = function(lineNo, columnNo, mc, contextNode, keyword, prefix, placeResult) {
    this._popup.elmt.empty();

    var hint = CueCard.MqlSyntax.KeywordValueHints[keyword];
    if ("html" in hint) {
        this._popup.elmt.html('<div class="cuecard-suggestion-hint-message">' + hint.html + '</div>');
        this.focus();
    } else {
        this._popup.elmt.html("<div></div>");
    
        var self = this;
        var suggestor = new CueCard.StaticChoicesSuggestor(
            hint.choices, 
            placeResult
        );
        var controller = new CueCard.SuggestionController(this._popup, this._popup.elmt[0].firstChild, suggestor, prefix);
    }
};

CueCard.QueryEditor.prototype._prepareQueryForSuggestions = function(mc, lineNo, columnNo, token, f) {
    var self = this;
    var prefix = "";
    var replaceToken;
    
    var insertAndSelect = function(l, c, o, offset, extent) {
        var text = (offset === undefined || typeof o !== "string") ? CueCard.jsonize(o, { breakLines: false }) : o;
        var start = c + (typeof offset == "number" ? offset : text.length);
        var end = start + (typeof extent == "number" ? extent : 0);
        
        self._editor.editor.replaceSelection(text); 
        // for IE, we need to call the codemirror's internal editor field's method.
        // otherwise, codemirror's own replaceSelection method will call focus(), which messes up the selection in IE.
        
        var line = self._editor.nthLine(l + 1);
        self._editor.selectLines(line, start, line, end);
    };
    if (token != null) {
        var startContentIndex = 0;
        var startCol = token.start.col;
        if (/^['"]/.test(token.content)) {
            startContentIndex = 1;
        }
        prefix = token.content.substring(startContentIndex, columnNo - startCol).replace(/['"]$/, '');
        
        replaceToken = function(o, offset, extent) {
            var line = self._editor.nthLine(token.start.line + 1);
            
            self._editor.selectLines(line, token.start.col, line, token.end.col);
            insertAndSelect(token.start.line, token.start.col, o, offset, extent);
        };
    } else {
        var pos = this._editor.cursorPosition(true);
        var l = this._editor.lineNumber(pos.line) - 1;
        var c = pos.character;
        
        replaceToken = function(o, offset, extent) {
            var line = self._editor.nthLine(l + 1);
            
            self._editor.selectLines(line, c, line, c);
            insertAndSelect(l, c, o, offset, extent);
        };
    }
    
    var placeResult = function(entry) {
        self._popup.close();
        if (typeof entry == "string") {
            replaceToken(entry);
        } else {
            replaceToken(entry.result, entry["offset"], entry["extent"]);
        }
    };
    
    var continuation = CueCard.UI.createBlockingContinuations(function(cont, globalPropertyMap) {
        return f(cont, prefix, placeResult, globalPropertyMap || {});
    });
    this._popup.addPendingContinuation(continuation);
    
    mc.model.qualifyAllProperties(continuation);
};

CueCard.QueryEditor.prototype._showExamples = function(evt) {
    var self = this;
    
    CueCard.showDialog("examples", { 
        onDone: function(q) { 
            self.content(q); 
            self._onRun(false);
        } 
    });
};
