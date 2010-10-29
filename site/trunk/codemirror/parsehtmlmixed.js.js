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

var HTMLMixedParser = Editor.Parser = (function() {

  // tags that trigger seperate parsers
  var triggers = {
    "script": "JSParser",
    "style":  "CSSParser"
  };

  function checkDependencies() {
    var parsers = ['XMLParser'];
    for (var p in triggers) parsers.push(triggers[p]);
    for (var i in parsers) {
      if (!window[parsers[i]]) throw new Error(parsers[i] + " parser must be loaded for HTML mixed mode to work.");
    }
    XMLParser.configure({useHTMLKludges: true});
  }

  function parseMixed(stream) {
    checkDependencies();
    var htmlParser = XMLParser.make(stream), localParser = null, inTag = false;
    var iter = {next: top, copy: copy};

    function top() {
      var token = htmlParser.next();
      if (token.content == "<")
        inTag = true;
      else if (token.style == "xml-tagname" && inTag === true)
        inTag = token.content.toLowerCase();
      else if (token.content == ">") {
        if (triggers[inTag]) {
          var parser = window[triggers[inTag]];
          iter.next = local(parser, "</" + inTag);
        }
        inTag = false;
      }
      return token;
    }
    function local(parser, tag) {
      var baseIndent = htmlParser.indentation();
      localParser = parser.make(stream, baseIndent + indentUnit);
      return function() {
        if (stream.lookAhead(tag, false, false, true)) {
          localParser = null;
          iter.next = top;
          return top();
        }

        var token = localParser.next();
        var lt = token.value.lastIndexOf("<"), sz = Math.min(token.value.length - lt, tag.length);
        if (lt != -1 && token.value.slice(lt, lt + sz).toLowerCase() == tag.slice(0, sz) &&
            stream.lookAhead(tag.slice(sz), false, false, true)) {
          stream.push(token.value.slice(lt));
          token.value = token.value.slice(0, lt);
        }

        if (token.indentation) {
          var oldIndent = token.indentation;
          token.indentation = function(chars) {
            if (chars == "</")
              return baseIndent;
            else
              return oldIndent(chars);
          };
        }

        return token;
      };
    }

    function copy() {
      var _html = htmlParser.copy(), _local = localParser && localParser.copy(),
          _next = iter.next, _inTag = inTag;
      return function(_stream) {
        stream = _stream;
        htmlParser = _html(_stream);
        localParser = _local && _local(_stream);
        iter.next = _next;
        inTag = _inTag;
        return iter;
      };
    }
    return iter;
  }

  return {
    make: parseMixed,
    electricChars: "{}/:",
    configure: function(obj) {
      if (obj.triggers) triggers = obj.triggers;
    }
  };

})();
