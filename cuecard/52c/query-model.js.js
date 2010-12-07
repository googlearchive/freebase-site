/*----------------------------------------------------------------------
 *  QueryNode
 *----------------------------------------------------------------------
 */
CueCard.QueryNode = function(type) {
    this.type = type;
    
    this.value = null;      // only for terminal case
    this.isArray = false;
    
    /*  These should be the same for terminal and missing cases, 
        different for non-terminal case.
    */
    this.startToken = null; 
    this.endToken = null;
    
    this.links = []; // only for non-terminal case
};

CueCard.QueryNode.TYPE_MISSING = -1;            // where a node should be but there is none
CueCard.QueryNode.TYPE_TERMINAL = 0;            // null, string, number, boolean, simple array
CueCard.QueryNode.TYPE_NONTERMINAL = 1;         // object hash {...}
CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY = 2;   // array of one or more object hashes: [{...}, ...]

CueCard.QueryNode.prototype.toQueryJson = function(options) {
    options = options || {};
    if (!("qualifyAllProperties" in options)) {
        options.qualifyAllProperties = false;
    }
    if (!("excludeChild" in options)) {
        options.excludeChild = -1;
    }
    return this._toQueryJson(options);
};

CueCard.QueryNode.prototype._toQueryJson = function(options) {
    var childOptions = {
        qualifyAllProperties: options.qualifyAllProperties,
        excludeChild: -1
    };
    if (this.type == CueCard.QueryNode.TYPE_TERMINAL) {
        if (this.isArray) {
            var a = [];
            for (var i = 0; i < this.value.length; i++) {
                var v = this.value[i];
                a.push(v != null ? v._toQueryJson(childOptions) : null);
            }
            return a;
        } else {
            if (this.startToken.type == CueCard.Token.Types.identifier) {
                return { "__identifier__" : this.value };
            } else {
                return this.value;
            }
        }
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        var a = [];
        for (var i = 0; i < this.elements.length; i++) {
            a.push(this.elements[i]._toQueryJson(childOptions));
        }
        return a;
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        var o = {};
        var hasAnyType = false;
        
        var ns = 0;
        for (var i = 0; i < this.links.length; i++) {
            if (i != options.excludeChild) {
                var link = this.links[i];
                if (link.path.length > 0) {
                    var path = link.getPath(options.qualifyAllProperties);
                    if (path in o && link.namespace.length == 0) {
                        while (path in o) {
                            link.namespace = "ns" + ns++ + ":";
                            path = link.getPath(options.qualifyAllProperties);
                        }
                    }
                    
                    var value = link.value != null ? link.value._toQueryJson(childOptions) : null;
                    o[path] = value;
                    
                    if (link.getUnnamespacedQualifiedPath() == "/type/object/type" && value != null && (!(value instanceof Array) || value.length > 0)) {
                        hasAnyType = true;
                    }
                }
            }
        }
        
        if (!hasAnyType && "expectedTypes" in options && options.expectedTypes.length > 0) {
            var expectedTypes = [];
            for (var i = 0; i < options.expectedTypes.length; i++) {
                var t = options.expectedTypes[i];
                if (t != "/type/object" && t != "/common/topic") {
                    expectedTypes.push(t);
                }
            }
            
            if (expectedTypes.length == 1) {
                o["type"] = expectedTypes[0];
            } else if (expectedTypes.length > 1) {
                o["type|="] = expectedTypes;
            }
        }
        
        return o;
    } else {
        return null;
    }
};

CueCard.QueryNode.isMqlKeyword = function(s) {
    switch (s) {
    case "limit":
    case "sort":
    case "*":
    case "return":
    case "count":
    case "estimate-count":
    case "optional":
    case "create":
    case "connect":
        return true;
    }
    return false;
};

CueCard.QueryNode.prototype.getDeclaredTypes = function(types) {
    var links = null;
    if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        links = this.links;
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        links = this.elements[0].links;
    }
    if (links != null) {
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.qualifiedProperty == "/type/object/type" && !link.reverse) {
                link.getValuesOfType(types, "string");
            }
        }
    }
};

CueCard.QueryNode.prototype.getDeclaredIDs = function(ids) {
    var links = null;
    if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        links = this.links;
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        links = this.elements[0].links;
    }
    if (links != null) {
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.qualifiedProperty == "/type/object/id" && !link.reverse) {
                link.getValuesOfType(ids, "string");
            }
        }
    }
};

CueCard.QueryNode.prototype.getDeclaredGUIDs = function(guids) {
    var links = null;
    if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        links = this.links;
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        links = this.elements[0].links;
    }
    if (links != null) {
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.qualifiedProperty == "/type/object/guid" && !link.reverse) {
                link.getValuesOfType(guids, "string");
            }
        }
    }
};

CueCard.QueryNode.prototype.qualifyAllProperties = function(cont) {
    this._qualifyAllProperties([], {}, cont);
};

CueCard.QueryNode.prototype._qualifyAllProperties = function(expectedTypes, globalPropertyMap, cont) {
    if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
        var nonTerminalLinks = [];
        var hasLinksToQualify = false;
        
        var types = [];
        var ids = [];
        var guids = [];
        
        for (var i = 0; i < this.links.length; i++) {
            var link = this.links[i];
            if (link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL ||
                link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY ||
                link.value.type == CueCard.QueryNode.TYPE_MISSING) {
                nonTerminalLinks.push(link);
            }
            
            if (link.qualifiedProperty == "/type/object/type" && !link.reverse) {
                link.getValuesOfType(types, "string");
            } else if (link.qualifiedProperty == "/type/object/id" && !link.reverse) {
                link.getValuesOfType(ids, "string");
            } else if (link.qualifiedProperty == "/type/object/guid" && !link.reverse) {
                link.getValuesOfType(guids, "string");
            } else if (link.qualifiedProperty != null && link.qualifiedProperty.length > 0) {
                var slash = link.qualifiedProperty.lastIndexOf("/");
                if (slash > 0) {
                    // Cheap way to get types from fully qualified properties
                    types.push(link.qualifiedProperty.substr(0, slash));
                }
            } else if (!CueCard.QueryNode.isMqlKeyword(link.property)) {
                hasLinksToQualify = true;
            }
        }
        types = types.concat(expectedTypes);
        
        /*
         *  Eliminate duplicates
         */
        var typeMap = {};
        for (var i = types.length - 1; i >= 0; i--) {
            typeMap[types[i]] = true;
        }
        types = [];
        for (var t in typeMap) {
            types.push(t);
        }
        
        /*
         *  nonTerminalLinks keeps track of inner query nodes that
         *  are non-terminals, whose properties may need to be qualified.
         */
        if (!hasLinksToQualify && nonTerminalLinks.length == 0) {
            cont.onDone(globalPropertyMap);
            return;
        }
        
        var self = this;
        var onGotSchemaData = function(o) {
            var propertyMap = o.properties;
            var qualificationMap = o.qualifications;
            
            for (var i = 0; i < self.links.length; i++) {
                var link = self.links[i];
                if (link.qualifiedProperty.length == 0 && !CueCard.QueryNode.isMqlKeyword(link.property)) {
                    link.qualifiedProperty = qualificationMap[link.property] || link.property;
                }
            }
            for (var n in propertyMap) {
                globalPropertyMap[n] = propertyMap[n];
            }
            
            (function() {
                if (nonTerminalLinks.length == 0) {
                    cont.onDone(globalPropertyMap);
                } else {
                    var nonTerminalLink = nonTerminalLinks.shift();
                    var linkExpectedTypes = [];
                    
                    if (nonTerminalLink.qualifiedProperty in propertyMap) {
                        var expectedTypes2 = propertyMap[nonTerminalLink.qualifiedProperty].expectedTypes;
                        for (var t = 0; t < expectedTypes2.length; t++) {
                            linkExpectedTypes.push(expectedTypes2[t].id);
                        }
                    }
                    linkExpectedTypes.push("/common/topic");
                    linkExpectedTypes.push("/type/object");
                    
                    if (nonTerminalLink.value.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
                        nonTerminalLink.value.expectedTypes = linkExpectedTypes;
                    } else if (nonTerminalLink.value.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
                        var elements = nonTerminalLink.value.elements;
                        for (var n = 0; n < elements.length; n++) {
                            elements[n].expectedTypes = linkExpectedTypes;
                        }
                    }
                    
                    nonTerminalLink.value._qualifyAllProperties(
                        linkExpectedTypes, 
                        globalPropertyMap,
                        { onDone: arguments.callee, onError: cont.onError }
                    );
                }
            })();
        };
        
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
        var url = CueCard.helper + "qualify-properties?" + params.join("&");
            
        CueCard.JsonpQueue.call(
            url,
            onGotSchemaData,
            cont.onError
        );
        
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        var i = 0;
        var elements = this.elements;
        var next = function() {
            if (i < elements.length) {
                elements[i++]._qualifyAllProperties(
                    expectedTypes, 
                    globalPropertyMap,
                    { onDone: arguments.callee, onError: cont.onError }
                );
            } else {
                cont.onDone(globalPropertyMap);
            }
        };
        next();
    } else {
        cont.onDone();
    }
};

CueCard.QueryNode.prototype.getCursorFromContext = function(context) {
    return this._getCursorFromContext(context, 0);
};

CueCard.QueryNode.prototype._getCursorFromContext = function(context, index) {
    var contextNode = context[index];
    if (this.type == CueCard.QueryNode.TYPE_MISSING) {
        var token = this.startToken;
        return {
            line: token.start.line,
            col: token.start.col
        };
    } else if (this.type == CueCard.QueryNode.TYPE_TERMINAL) {
        if (this.isArray) {
            if (contextNode.relative == "inside") {
                if (contextNode.child < this.value.length) {
                    return this.value[contextNode.child]._getCursorFromContext(context, index + 1);
                } else {
                    var token = this.endToken;
                    return {
                        line: token.start.line,
                        col: token.start.col
                    };
                }
            } else if (contextNode.child < this.value.length) {
                var childNode = this.value[contextNode.child];
                var token = childNode.startToken;
                return {
                    line: token.start.line,
                    col: token.start.col
                };
            } else {
                var token = this.startToken;
                return {
                    line: token.end.line,
                    col: token.end.col
                };
            }
        } else {
            var token = this.startToken;
            return {
                line: token.start.line,
                col: token.start.col + ("offset" in contextNode ? contextNode.offset : 0)
            };
        }
    } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        if (contextNode.relative == "inside") {
            if (contextNode.child < this.elements.length) {
                return this.elements[contextNode.child]._getCursorFromContext(context, index + 1);
            } else {
                var token = this.endToken;
                return {
                    line: token.start.line,
                    col: token.start.col
                };
            }
        } else if (contextNode.child < this.elements.length) {
            var childNode = this.elements[contextNode.child];
            var token = childNode.startToken;
            return {
                line: token.start.line,
                col: token.start.col
            };
        } else {
            var token = this.startToken;
            return {
                line: token.end.line,
                col: token.end.col
            };
        }    
    } else { // TYPE_NONTERMINAL
        if (contextNode.relative == "inside") {
            if (contextNode.child < this.links.length) {
                return this.links[contextNode.child].value._getCursorFromContext(context, index + 1);
            } else {
                var token = this.endToken;
                return {
                    line: token.start.line,
                    col: token.start.col
                };
            }
        } else if (contextNode.relative == "before") {
            if (contextNode.child < this.links.length) {
                var childNode = this.links[contextNode.child].value;
                var token = childNode.startToken;
                return {
                    line: token.start.line,
                    col: token.start.col
                };
            } else {
                var token = this.startToken;
                return {
                    line: token.end.line,
                    col: token.end.col
                };
            }
        } else { // relative is "path" or "space"
            if (contextNode.child < this.links.length) {
                if (contextNode.relative == "path") {
                    var token = this.links[contextNode.child].token;
                    return {
                        line: token.start.line,
                        col: token.start.col + ("offset" in contextNode ? contextNode.offset : 0)
                    };
                } else {
                    var token = this.links[contextNode.child].value.startToken;
                    return {
                        line: token.start.line,
                        col: token.start.col
                    };
                }
            } else {
                var token = this.endToken;
                return {
                    line: token.end.line,
                    col: token.end.col
                };
            }            
        }
    }
};

CueCard.QueryNode.prototype.toInsideOutQueryJson = function(cursorContext, cont) {
    var self = this;
    this.qualifyAllProperties({
        onDone: function() {
            cont.onDone(self._toInsideOutQueryJson(cursorContext, 0, null, null));
        },
        onError: cont.onError
    });
};

CueCard.QueryNode.prototype._toInsideOutQueryJson = function(cursorContext, contextIndex, nestedPath, nestedValue) {
    if (nestedPath != null && !(nestedValue instanceof Array)) {
        nestedValue = [ nestedValue ];
    }
    
    if (contextIndex < cursorContext.length) {
        var contextNode = cursorContext[contextIndex];
        
        if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
            if ("child" in contextNode && contextNode.relative == "inside") {
                var childIndex = contextNode.child;
                if (childIndex < this.links.length) {
                    var link = this.links[childIndex];
                    if (link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL ||
                        link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
                        
                        var path = link.getInverseQualifiedPath();
                        var outer = this.toQueryJson({ excludeChild: childIndex });
                        
                        if (nestedPath != null) {
                            if (outer instanceof Array) {
                                outer[0][nestedPath] = nestedValue;
                            } else {
                                outer[nestedPath] = nestedValue;
                            }
                        }
                        return link.value._toInsideOutQueryJson(cursorContext, contextIndex + 1, path, outer);
                    }
                }
            }
        } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
            if ("child" in contextNode && contextNode.relative == "inside") {
                var childIndex = contextNode.child;
                if (this.elements.length > 1) {
                    throw new Error("Cannot turn a query inside out if a query node has siblings");
                } else if (childIndex == 0) {
                    var o = this.elements[childIndex]._toInsideOutQueryJson(
                        cursorContext, 
                        contextIndex + 1, 
                        nestedPath, 
                        nestedValue
                    );
                    return (o instanceof Array) ? o : [o];
                } else {
                    return null; // ???
                }
            }
        }
    }
    
    var o = this.toQueryJson({ expectedTypes : ("expectedTypes" in this) ? this.expectedTypes : [] });
    if (nestedPath != null) {
        if (typeof o == Array) {
            o[0][nestedPath] = nestedValue;
        } else {
            o[nestedPath] = nestedValue;
        }
    }
    return o;
};

CueCard.QueryNode.prototype.locateInnerMostNonTerminal = function(cursorContext, cont) {
    var self = this;
    this.qualifyAllProperties({
        onDone: function() {
            var r = self._locateInnerMostNonTerminal(cursorContext, 0);
            cont.onDone(r != null ? r : { node: self, property: null, reverse: false });
        },
        onError: cont.onError
    });
};

CueCard.QueryNode.prototype._locateInnerMostNonTerminal = function(cursorContext, contextIndex) {
    if (contextIndex < cursorContext.length) {
        var contextNode = cursorContext[contextIndex];
        
        if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
            if ("child" in contextNode && contextNode.relative == "inside") {
                var childIndex = contextNode.child;
                if (childIndex < this.links.length) {
                    var link = this.links[childIndex];
                    if (link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL || 
                        link.value.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
                        var r = link.value._locateInnerMostNonTerminal(cursorContext, contextIndex + 1);
                        if (r == null) {
                            r = { node: link.value }
                        }
                        if (!("property" in r)) {
                            r.property = link.qualifiedProperty;
                            r.reverse = link.reverse;
                        }
                        return r;
                    }
                }
            }
        } else if (this.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
            if ("child" in contextNode && contextNode.relative == "inside") {
                var childIndex = contextNode.child;
                if (childIndex < this.elements.length) {
                    var child = this.elements[childIndex];
                    var r = child._locateInnerMostNonTerminal(cursorContext, contextIndex + 1);
                    if (r == null) {
                        r = { node: child };
                    }
                    return r;
                }
            }
        }
    }
    return null;
};

/*----------------------------------------------------------------------
 *  QueryNodeLink
 *----------------------------------------------------------------------
 */
CueCard.QueryNodeLink = function(path, token) {
    this.path = path;
    this.token = token;
    
    this.reverse = false;
    this.namespace = "";
    this.property = "";             // only the short key
    this.originalProperty = "";     // might be fully qualified, or might be a short key
    this.qualifiedProperty = "";
    this.suffix = "";
    this.value = null;
    
    if (path.length > 0) {
        if (path.charAt(0) == "!") {
            this.reverse = true;
            path = path.substr(1);
        }
    }
    if (path.length > 0) {
        var colon = path.indexOf(":");
        if (colon >= 0) {
            this.namespace = path.substr(0, colon + 1);
            path = path.substr(colon + 1);
            
            // Check for ! again in case the user type ns:!/...
            if (path.length > 0 && path.charAt(0) == "!") {
                this.reverse = true;
                path = path.substr(1);
            }
        }
    }
    if (path.length >= 2) {
        var suffix = path.substr(path.length - 2);
        if (suffix == ">=" || suffix == "<=" || suffix == "~=") {
            this.suffix = suffix;
            path = path.substr(0, path.length - 2);
        }
    }
    if (path.length > 1 && this.suffix == "") {
        var suffix = path.substr(path.length - 1);
        if (suffix == "<" || suffix == ">") {
            this.suffix = suffix;
            path = path.substr(0, path.length - 1);
        }
    }
    
    this.originalProperty = path;
    
    if (path.length > 0) {
        if (path.charAt(0) == "/") {
            this.qualifiedProperty = path;
            
            var lastSlash = path.lastIndexOf("/");
            this.property = path.substr(lastSlash + 1);
        } else {
            this.property = path;
        }
    }
    // temp
    if (this.qualifiedProperty == "") {
        if (this.property == "type") {
            this.qualifiedProperty = "/type/object/type";
        } else if (this.property == "id") {
            this.qualifiedProperty = "/type/object/id";
        } else if (this.property == "guid") {
            this.qualifiedProperty = "/type/object/guid";
        } else if (this.property == "name") {
            this.qualifiedProperty = "/type/object/name";
        } else if (this.property == "lang") {
            this.qualifiedProperty = "/type/text/lang";
        } else if (CueCard.QueryNode.isMqlKeyword(this.property)) {
            this.qualifiedProperty = this.property;
        }
    }
};

CueCard.QueryNodeLink.prototype.getQualifiedPath = function() {
    return (this.reverse ? "!" : "") + this.namespace + this.qualifiedProperty + this.suffix;
};

CueCard.QueryNodeLink.prototype.getInverseQualifiedPath = function() {
    return (this.reverse ? "" : "!") + this.namespace + this.qualifiedProperty + this.suffix;
};

CueCard.QueryNodeLink.prototype.getUnnamespacedQualifiedPath = function() {
    return (this.reverse ? "!" : "") + this.qualifiedProperty + this.suffix;
};

CueCard.QueryNodeLink.prototype.getPath = function(qualify) {
    var p = (qualify && this.qualifiedProperty.length > 0) ? this.qualifiedProperty : this.originalProperty;
    return (this.reverse ? "!" : "") + this.namespace + p + this.suffix;
};

CueCard.QueryNodeLink.prototype.getValuesOfType = function(results, type) {
    var getLiterals = function(terminalNode) {
        if (terminalNode.isArray) {
            var arrayElements = terminalNode.value;
            for (var j = 0; j < arrayElements.length; j++) {
                var arrayElement = arrayElements[j];
                if (arrayElement.type == CueCard.QueryNode.TYPE_TERMINAL && 
                    arrayElement.value != null && 
                    typeof arrayElement.value == type) {
                    
                    results.push(arrayElement.value);
                }
            }
        } else if (terminalNode.value != null && typeof terminalNode.value == type) {
            results.push(terminalNode.value);
        }
    };
    
    var linkValue = this.value;
    if (linkValue.type == CueCard.QueryNode.TYPE_TERMINAL) {
        getLiterals(linkValue);
    } else if (linkValue.type == CueCard.QueryNode.TYPE_NONTERMINAL || 
                linkValue.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
        var links = linkValue.type == CueCard.QueryNode.TYPE_NONTERMINAL ? linkValue.links : linkValue.elements[0].links;
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.qualifiedProperty == "/type/value/value" && 
                link.value.type == CueCard.QueryNode.TYPE_TERMINAL) {
                getLiterals(link.value);
            }
        }
    }
};