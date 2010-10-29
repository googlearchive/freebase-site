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

// Minimal framing needed to use CodeMirror-style parsers to highlight
// code. Load this along with tokenize.js, stringstream.js, and your
// parser. Then call highlightText, passing a string as the first
// argument, and as the second argument either a callback function
// that will be called with an array of SPAN nodes for every line in
// the code, or a DOM node to which to append these spans, and
// optionally (not needed if you only loaded one parser) a parser
// object.

// Stuff from util.js that the parsers are using.
var StopIteration = {toString: function() {return "StopIteration"}};

var Editor = {};
var indentUnit = 2;

(function(){
  function normaliseString(string) {
    var tab = "";
    for (var i = 0; i < indentUnit; i++) tab += " ";

    string = string.replace(/\t/g, tab).replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n");
    var pos = 0, parts = [], lines = string.split("\n");
    for (var line = 0; line < lines.length; line++) {
      if (line != 0) parts.push("\n");
      parts.push(lines[line]);
    }

    return {
      next: function() {
        if (pos < parts.length) return parts[pos++];
        else throw StopIteration;
      }
    };
  }

  window.highlightText = function(string, callback, parser) {
    parser = (parser || Editor.Parser).make(stringStream(normaliseString(string)));
    var line = [];
    if (callback.nodeType == 1) {
      var node = callback;
      callback = function(line) {
        for (var i = 0; i < line.length; i++)
          node.appendChild(line[i]);
        node.appendChild(document.createElement("BR"));
      };
    }

    try {
      while (true) {
        var token = parser.next();
        if (token.value == "\n") {
          callback(line);
          line = [];
        }
        else {
          var span = document.createElement("SPAN");
          span.className = token.style;
          span.appendChild(document.createTextNode(token.value));
          line.push(span);
        }
      }
    }
    catch (e) {
      if (e != StopIteration) throw e;
    }
    if (line.length) callback(line);
  }
})();
