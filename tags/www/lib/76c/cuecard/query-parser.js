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

/*----------------------------------------------------------------------
 *  QueryParser
 *----------------------------------------------------------------------
 */
CueCard.QueryParser = {};

CueCard.QueryParser.parseForContext = function(text, startIndex, cursorLine, cursorCol) {
    var tokenizer = new CueCard.QueryTokenizer(text, startIndex);
    var token = tokenizer.token();
    var lookAheads = [];
    
    var tokenTypes = CueCard.Token.Types;
    var next = function() {
        if (lookAheads.length == 0) {
            token = tokenizer.next();
        } else {
            token = lookAheads.shift();
        }
    };
    var lookAhead = function(count) { // count is 
        if (count == 0) {
            return token;
        } else {
            while (count > lookAheads.length) {
                lookAheads.push(tokenizer.next());
            }
            return lookAheads[count - 1];
        }
    };
    var eatWhitespace = function() {
        while (token != null && 
            (token.type == tokenTypes.whitespace || token.type == tokenTypes.unrecognized)) {
            next();
        }
    };
    var makePhantomToken = function(anchorToken) {
        return new CueCard.Token(
            CueCard.Token.Types.phantom, 
            "",
            anchorToken.start,
            anchorToken.start
        );
    };
    var getSafeToken = function() {
        if (token != null) {
            return token;
        } else {
            return new CueCard.Token(
                CueCard.Token.Types.phantom, 
                "",
                tokenizer.index(),
                tokenizer.index()
            );
        }
    };
    var makeMissingQueryNode = function() {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_MISSING);
        queryNode.startToken = queryNode.endToken = makePhantomToken(getSafeToken());
        
        return queryNode;
    };
    
    var parseTerminal = function() {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_TERMINAL);
        queryNode.startToken = queryNode.endToken = token;
        queryNode.isArray = false;
        if (token.type == tokenTypes.numberLiteral) {
            queryNode.value = parseFloat(token.content);
        } else if (token.type == tokenTypes.stringLiteral) {
            queryNode.value = token.content.replace(/^['"]/, '').replace(/['"]$/, '');
        } else if (token.type == tokenTypes.booleanLiteral) {
            queryNode.value = (token.content == "true" || token.content == "True");
        } else if (token.type == tokenTypes.nullLiteral) {
            queryNode.value = null;
        } else if (token.type == tokenTypes.delimiter) {
            return null;
        } else {
            queryNode.value = token.content;
        }
        next();
        
        return queryNode;
    };
    var parseTerminalArray = function() {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_TERMINAL);
        queryNode.startToken = token;
        queryNode.isArray = true;
        queryNode.value = [];
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "[") {
            next(); // eat the [
        }
        
        while (token != null) {
            eatWhitespace();
            if (token == null || (token.type == tokenTypes.delimiter && token.content == "]")) {
                break;
            }
            
            /*  While we should just have terminals here, the user might 
             *  put in a nonterminal, so we just have to be prudent and
             *  expect any sort of node. We can do error handling later.
             */
            var terminal = parseNode(false);
            if (terminal == null) {
                // We probably hit a delimiter like :
                break;
            }
            queryNode.value.push(terminal);
            
            eatWhitespace();
            
            // Eat the comma if any. If not, we won't be fussy about it.
            if (token != null && token.type == tokenTypes.delimiter && token.content == ",") {
                next(); // eat comma
            }
        }
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "]") {
            queryNode.endToken = token;
            next(); // eat ]
        }
        if (queryNode.endToken == null) {
            queryNode.endToken = getSafeToken();
        }
        
        return queryNode;
    };
    var parseNonTerminal = function(queryNode) {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_NONTERMINAL);
        queryNode.startToken = token;
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "{") {
            next(); // eat the {
        }
        while (token != null) {
            eatWhitespace();
            if (token == null) {
                break;
            }
            
            var path = null;
            var pathToken = null;
            var valueNode = null;
            
            if (token.type == tokenTypes.identifier) {
                path = token.content;
                pathToken = token;
                next();
                eatWhitespace();
            } else if (token.type == tokenTypes.stringLiteral) {
                path = token.content.replace(/^['"]/, '').replace(/['"]$/, '');
                pathToken = token;
                next();
                eatWhitespace();
            } else {
                pathToken = makePhantomToken(token);
            }
            
            if (token != null && token.type == tokenTypes.delimiter && 
                (token.content == ":" || token.content == ";")) {
                // People tend to mistype : as ;
                next(); // eat : or ;
                eatWhitespace();
            } // don't be fussy if we can't find a :
            
            if (token != null) {
                valueNode = parseNode(false);
            }
            
            if (path != null || valueNode != null) {
                var queryNodeLink = new CueCard.QueryNodeLink(
                    path != null ? path : "", 
                    pathToken
                );
                queryNodeLink.value = valueNode != null ? valueNode : makeMissingQueryNode();
                
                queryNode.links.push(queryNodeLink);
            }
            
            eatWhitespace();
            if (token == null || 
                (token.type == tokenTypes.delimiter && 
                    (token.content == "}" || token.content == "]"))) {
                break;
            }
            
            if (token.type == tokenTypes.delimiter &&
                token.content == ",") {
                next(); // eat comma
            }
        }
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "}") {
            queryNode.endToken = token;
            next(); // eat }
        }
        if (queryNode.endToken == null) {
            queryNode.endToken = getSafeToken();
        }
        
        return queryNode;
    };
    var parseNonTerminalArray = function() {
        var queryNode = new CueCard.QueryNode(CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY);
        queryNode.startToken = token;
        queryNode.elements = [];
        
        // We need to check this because we might be called when the user forgets [
        if (token != null && token.type == tokenTypes.delimiter && token.content == "[") {
            next(); // eat the [
        }
        
        while (token != null) {
            eatWhitespace();
            if (token == null || (token.type == tokenTypes.delimiter && token.content == "]")) {
                break;
            }
            
            queryNode.elements.push(parseNonTerminal());
            
            eatWhitespace();
            
            // Eat the comma if any. If not, we won't be fussy about it.
            if (token != null && token.type == tokenTypes.delimiter && token.content == ",") {
                next(); // eat comma
            }
        }
        
        if (token != null && token.type == tokenTypes.delimiter && token.content == "]") {
            queryNode.endToken = token;
            next(); // eat ]
        }
        if (queryNode.endToken == null) {
            queryNode.endToken = getSafeToken();
        }
        
        return queryNode;
    };
    var parseTerminalArrayOrNonTerminalArray = function() {
        var look = 1;
        var token2;
        while ((token2 = lookAhead(look)) != null && 
            (token2.type == tokenTypes.whitespace || token2.type == tokenTypes.unrecognized)) {
            look++;
        }
        
        if (token2 != null) {
            if (token2.type == tokenTypes.delimiter && token2.content == "{") {
                return parseNonTerminalArray();
            } else if (token2.type == tokenTypes.identifier || token2.type == tokenTypes.stringLiteral) {
                // Keep on looking for :
                look++;
                while ((token2 = lookAhead(look)) != null && 
                    (token2.type == tokenTypes.whitespace || token2.type == tokenTypes.unrecognized)) {
                    look++;
                }
                
                if (token2 != null && token2.type == tokenTypes.delimiter && token2.content == ":") {
                    return parseNonTerminalArray();
                }
            }
        }
        
        return parseTerminalArray();
    };
    var parseNode = function(forceNonTerminal) {
        eatWhitespace();
        
        if (token == null) {
            return makeMissingQueryNode();
        } else if (token.type == tokenTypes.delimiter) {
            if (token.content == "[") {
                return parseTerminalArrayOrNonTerminalArray();
            } else if (token.content == "{") {
                return parseNonTerminal();
            } else {
                return makeMissingQueryNode();
            }
        } else if (forceNonTerminal) {
            // It is safest to assume that the user meant [{ }];
            return parseNonTerminalArray();
        } else {
            return parseTerminal();
        }
    };
    
    var cursorBeforeStart = function(token) {
        return cursorLine < token.start.line ||
            (cursorLine == token.start.line && cursorCol <= token.start.col);
    };
    var cursorAfterStart = function(token) {
        return cursorLine > token.start.line ||
            (cursorLine == token.start.line && cursorCol >= token.start.col);
    };
    var cursorBeforeEnd = function(token) {
        return cursorLine < token.end.line ||
            (cursorLine == token.end.line && cursorCol <= token.end.col);
    };
    var cursorBeforeStart = function(token) {
        return cursorLine < token.start.line ||
            (cursorLine == token.start.line && cursorCol <= token.start.col);
    };
    var cursorWithinNode = function(node) {
        return node.startToken == node.endToken ?
            (cursorAfterStart(node.startToken) && cursorBeforeEnd(node.startToken)) :
            (cursorAfterStart(node.startToken) && cursorBeforeStart(node.endToken));
    };
    var resolveNode = function(node, indices) {
        if (node.type == CueCard.QueryNode.TYPE_TERMINAL) {
            if (node.isArray) {
                for (var i = 0; i < node.value.length; i++) {
                    var childNode = node.value[i];
                    if (cursorBeforeStart(childNode.startToken)) {
                        indices.push({ child: i, relative: "before", node: node });
                        return;
                    } else if (cursorWithinNode(childNode)) {
                        indices.push({ child: i, relative: "inside", node: node });
                        resolveNode(childNode, indices);
                        return;
                    }
                }
                indices.push({ child: node.value.length, relative: "before", node: node });
            } else {
                indices.push({ token: node.startToken, node: node, offset: cursorCol - node.startToken.start.col });
            }
        } else if (node.type == CueCard.QueryNode.TYPE_NONTERMINAL_ARRAY) {
            for (var i = 0; i < node.elements.length; i++) {
                var childNode = node.elements[i];
                if (cursorBeforeStart(childNode.startToken)) {
                    indices.push({ child: i, relative: "before", node: node });
                    return;
                } else if (cursorWithinNode(childNode)) {
                    indices.push({ child: i, relative: "inside", node: node });
                    resolveNode(childNode, indices);
                    return;
                }
            }
            indices.push({ child: node.elements.length, relative: "before", node: node });
        } else if (node.type == CueCard.QueryNode.TYPE_NONTERMINAL) {
            for (var i = 0; i < node.links.length; i++) {
                var link = node.links[i];
                if (cursorBeforeStart(link.token)) {
                    indices.push({ child: i, relative: "before", node: node });
                    return;
                } else if (cursorBeforeEnd(link.token)) {
                    indices.push({ child: i, relative: "path", node: node, offset: cursorCol - link.token.start.col });
                    return;
                } else if (!cursorAfterStart(link.value.startToken)) {
                    indices.push({ child: i, relative: "space", node: node });
                    return;
                } else if (cursorBeforeEnd(link.value.endToken)) {
                    indices.push({ child: i, relative: "inside", node: node });
                    resolveNode(link.value, indices);
                    return;
                }
            }
            indices.push({ child: node.links.length, relative: "before", node: node });
        } else {
            indices.push({ token: node.startToken, node: node });
        }
    };
    
    eatWhitespace();
    var result = { model: parseNode(true), context: [] };
    resolveNode(result.model, result.context);
    
    return result;
};

/*----------------------------------------------------------------------
 *  QueryTokenizer and token stuff
 *----------------------------------------------------------------------
 */
CueCard.QueryTokenizer = function(text, startIndex) {
    this._text = text + " "; // make it easier to parse
    this._maxIndex = text.length;
    this._index = startIndex;
    this._line = 0;
    this._col = 0;
    
    this.next();
};

CueCard.QueryTokenizer.prototype.token = function() {
    return this._token;
};

CueCard.QueryTokenizer.prototype.index = function() {
    return this._index;
};

CueCard.QueryTokenizer._whitespaces = " \t\r\n";

CueCard.QueryTokenizer.prototype.next = function() {
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
            return new CueCard.TokenPos(self._index, self._line, self._col);
        };
        function makeCurrentPosAndIncrement() {
            var pos = makeCurrentPos();
            advance();
            return pos;
        };
        function makeSimpleToken(type, startPos, text) {
            var endPos = makeCurrentPos();
            self._pos = endPos;
            self._token = new CueCard.Token(
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
                if (CueCard.QueryTokenizer._whitespaces.indexOf(c) < 0) {
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
            makeSimpleToken(CueCard.Token.Types.whitespace, startPos);
        };
        
        function parseString(opener) {
            var startPos = makeCurrentPos();
            
            if (c1 == 'u') {
                advance();
            }
            advance();
            
            var text = "";
            while (self._index < self._maxIndex) {
                c1 = self._text.charAt(self._index);
                if (c1 == opener) {
                    advance();
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
            
            makeSimpleToken(CueCard.Token.Types.stringLiteral, startPos, text);
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
                   CueCard.QueryTokenizer._isDigit(self._text.charAt(self._index))) {
                advance();
            }
            
            if (self._index < self._maxIndex &&
                self._text.charAt(self._index) == '.') {
                
                advance();
                
                while (self._index < self._maxIndex &&
                       CueCard.QueryTokenizer._isDigit(self._text.charAt(self._index))) {
                    advance();
                }
            }
            
            if (self._index < self._maxIndex &&
                self._text.charAt(self._index) == 'e') {
                
                advance();
                
                c1 = self._text.charAt(self._index);
                if (c1 == '+' || c1 == '-') {
                    advance();
                }
                
                while (self._index < self._maxIndex &&
                       CueCard.QueryTokenizer._isDigit(self._text.charAt(self._index))) {
                    advance();
                }
            }
            
            makeSimpleToken(CueCard.Token.Types.numberLiteral, startPos);
        };
        
        function parseIdentifier() {
            var startPos = makeCurrentPos();
            while (self._index < self._maxIndex &&
                    CueCard.QueryTokenizer._identifierPrefix.indexOf(self._text.charAt(self._index)) >= 0) {
                advance();
            }
            
            var hasSuffix = false;
            if (self._index < self._maxIndex - 2) {
                var s = self._text.substr(self._index, 2);
                if (s == ">=" || s == "<=" || s == "~=") {
                    advance();
                    advance();
                    hasSuffix = true;
                }
            }
            if (!hasSuffix && self._index < self._maxIndex - 1) {
                var s = self._text.substr(self._index, 1);
                if (s == ">" || s == "<") {
                    advance();
                    hasSuffix = true;
                }
            }
            
            var endPos = makeCurrentPos();
            var content = self._text.substring(startPos.offset, endPos.offset);
            self._pos = endPos;
            if (content == "null" || content == "None") {
                self._token = new CueCard.Token(
                    CueCard.Token.Types.nullLiteral, 
                    content,
                    startPos,
                    endPos
                );
            } else if (content == "true" || content == "True" || content == "false" || content == "False") {
                self._token = new CueCard.Token(
                    CueCard.Token.Types.booleanLiteral, 
                    content,
                    startPos,
                    endPos
                );
            } else {
                self._token = new CueCard.Token(
                    CueCard.Token.Types.identifier, 
                    content,
                    startPos,
                    endPos
                );
            }
        };
        
        if (CueCard.QueryTokenizer._whitespaces.indexOf(c1) >= 0) {
            parseWhitespace();
        } else if ("[{}],:".indexOf(c1) >= 0) {
            makeSimpleToken(CueCard.Token.Types.delimiter, makeCurrentPosAndIncrement());
        } else if (c1 == '"' || c1 == "'") {
            parseString(c1);
        } else if (c1 == 'u' && (c2 == '"' || c2 == "'")) {
            parseString(c2);
        } else if (c1 == "-" || c1 == "+" || CueCard.QueryTokenizer._isDigit(c1)) {
            parseNumber();
        } else if (c1 == "*") {
            makeSimpleToken(CueCard.Token.Types.identifier, makeCurrentPosAndIncrement());
        } else if (CueCard.QueryTokenizer._identifierPrefix.indexOf(c1) >= 0) {
            parseIdentifier();
        } else {
            makeSimpleToken(CueCard.Token.Types.unrecognized, makeCurrentPosAndIncrement());
        }
    }
    
    return this._token;
};

CueCard.QueryTokenizer._isDigit = function(c) {
    return "0123456789".indexOf(c) >= 0;
};

CueCard.QueryTokenizer._identifierPrefix = "#!/_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

CueCard.TokenPos = function(offset, line, col) {
    this.offset = offset;
    this.line = line;
    this.col = col;
}

CueCard.Token = function(type, content, start, end) {
    this.type = type;
    this.content = content;
    this.start = start;
    this.end = end;
};

CueCard.Token.Types = {
    unrecognized:       -1,
    phantom:            0,  // for internal marking only
    whitespace:         1,
    delimiter:          2,  // including [{}],:
    nullLiteral:        3,
    numberLiteral:      4,
    stringLiteral:      5,
    booleanLiteral:     6,
    identifier:         7
};
