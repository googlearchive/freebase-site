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

var SparqlParser = Editor.Parser = (function() {
  function wordRegexp(words) {
    return new RegExp("^(?:" + words.join("|") + ")$", "i");
  }
  var ops = wordRegexp(["str", "lang", "langmatches", "datatype", "bound", "sameterm", "isiri", "isuri",
                        "isblank", "isliteral", "union", "a"]);
  var keywords = wordRegexp(["base", "prefix", "select", "distinct", "reduced", "construct", "describe",
                             "ask", "from", "named", "where", "order", "limit", "offset", "filter", "optional",
                             "graph", "by", "asc", "desc"]);
  var operatorChars = /[*+\-<>=&|]/;

  var tokenizeSparql = (function() {
    function normal(source, setState) {
      var ch = source.next();
      if (ch == "$" || ch == "?") {
        source.nextWhileMatches(/[\w\d]/);
        return "sp-var";
      }
      else if (ch == "<" && !source.matches(/[\s\u00a0=]/)) {
        source.nextWhileMatches(/[^\s\u00a0>]/);
        if (source.equals(">")) source.next();
        return "sp-uri";
      }
      else if (ch == "\"" || ch == "'") {
        setState(inLiteral(ch));
        return null;
      }
      else if (/[{}\(\),\.;\[\]]/.test(ch)) {
        return "sp-punc";
      }
      else if (ch == "#") {
        while (!source.endOfLine()) source.next();
        return "sp-comment";
      }
      else if (operatorChars.test(ch)) {
        source.nextWhileMatches(operatorChars);
        return "sp-operator";
      }
      else if (ch == ":") {
        source.nextWhileMatches(/[\w\d\._\-]/);
        return "sp-prefixed";
      }
      else {
        source.nextWhileMatches(/[_\w\d]/);
        if (source.equals(":")) {
          source.next();
          source.nextWhileMatches(/[\w\d_\-]/);
          return "sp-prefixed";
        }
        var word = source.get(), type;
        if (ops.test(word))
          type = "sp-operator";
        else if (keywords.test(word))
          type = "sp-keyword";
        else
          type = "sp-word";
        return {style: type, content: word};
      }
    }

    function inLiteral(quote) {
      return function(source, setState) {
        var escaped = false;
        while (!source.endOfLine()) {
          var ch = source.next();
          if (ch == quote && !escaped) {
            setState(normal);
            break;
          }
          escaped = !escaped && ch == "\\";
        }
        return "sp-literal";
      };
    }

    return function(source, startState) {
      return tokenizer(source, startState || normal);
    };
  })();

  function indentSparql(context) {
    return function(nextChars) {
      var firstChar = nextChars && nextChars.charAt(0);
      if (/[\]\}]/.test(firstChar))
        while (context && context.type == "pattern") context = context.prev;

      var closing = context && firstChar == matching[context.type];
      if (!context)
        return 0;
      else if (context.type == "pattern")
        return context.col;
      else if (context.align)
        return context.col - (closing ? context.width : 0);
      else
        return context.indent + (closing ? 0 : indentUnit);
    }
  }

  function parseSparql(source) {
    var tokens = tokenizeSparql(source);
    var context = null, indent = 0, col = 0;
    function pushContext(type, width) {
      context = {prev: context, indent: indent, col: col, type: type, width: width};
    }
    function popContext() {
      context = context.prev;
    }

    var iter = {
      next: function() {
        var token = tokens.next(), type = token.style, content = token.content, width = token.value.length;

        if (content == "\n") {
          token.indentation = indentSparql(context);
          indent = col = 0;
          if (context && context.align == null) context.align = false;
        }
        else if (type == "whitespace" && col == 0) {
          indent = width;
        }
        else if (type != "sp-comment" && context && context.align == null) {
          context.align = true;
        }

        if (content != "\n") col += width;

        if (/[\[\{\(]/.test(content)) {
          pushContext(content, width);
        }
        else if (/[\]\}\)]/.test(content)) {
          while (context && context.type == "pattern")
            popContext();
          if (context && content == matching[context.type])
            popContext();
        }
        else if (content == "." && context && context.type == "pattern") {
          popContext();
        }
        else if ((type == "sp-word" || type == "sp-prefixed" || type == "sp-uri" || type == "sp-var" || type == "sp-literal") &&
                 context && /[\{\[]/.test(context.type)) {
          pushContext("pattern", width);
        }

        return token;
      },

      copy: function() {
        var _context = context, _indent = indent, _col = col, _tokenState = tokens.state;
        return function(source) {
          tokens = tokenizeSparql(source, _tokenState);
          context = _context;
          indent = _indent;
          col = _col;
          return iter;
        };
      }
    };
    return iter;
  }

  return {make: parseSparql, electricChars: "}]"};
})();
