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

// A simple implementation of http://code.google.com/p/zen-coding/ in JavaScript

var zen = (function() {
  var error=''; // last error during parse
  
  var tagRE = /^[\w:]+/,
      idRE  = /^\#[:\w\$]+/,
      cnRE  = /^(\.[\w\$]+)+/,
      attrRE = /^\[.+\]/,
      multRE = /^\*\d+/;

  var tagger = (function() {
    var indent    = function(level) { return new Array(level+1).join('  '); };
    var t;
    return {
      newTag :   function()  { t = {tagName:'div'}; return t;},

      tag :      function(m) { t.tagName=m;                               return ''; }, 
      id:        function(m) { t.id=m.slice(1);                           return ''; }, // #foo --> 'foo'
      className: function(m) { t.className=m.slice(1).replace(/\./g,' '); return ''; }, // .class1.class2 --> 'class1 class2'
      attr:      function(m) { t.attrs=m.slice(1,-1);                     return ''; }, // [foo=bar] --> foo=bar
      mult:      function(m) { t.multiplier=parseInt(m.slice(1),10);      return ''; }, // *3 --> '3'

      html:      function(innerHTML,level) {
        var out = '<'+t.tagName
        + (t.id?' id="'+t.id+'"':'')
        + (t.className?' class="'+t.className+'"':'')
        + (t.attrs?' '+t.attrs:'')
        + '>'
        + (innerHTML ? '\n'+innerHTML+'\n'+indent(level) : '')
        + '</'+t.tagName+'>';
        var m = [];
        for (var i=0,len=t.multiplier||1;i<len;i++) {
          m[i]=out.replace(/\$/g,i+1); // expand foo$ as foo1,foo2,foo3
        } 
        return indent(level) + m.join('\n'+indent(level));
      }
    };
  })();

  function parseSel(sel,level,innerHTML) {
    var t = tagger.newTag();
    var leftover = sel
      .replace(tagRE,  tagger.tag)
      .replace(idRE,   tagger.id)
      .replace(cnRE,   tagger.className)
      .replace(attrRE, tagger.attr)
      .replace(multRE, tagger.mult);
    if (leftover.length && !error.length) { error=leftover; }
    return tagger.html(innerHTML,level);
  }

  function zexp(selectors,level) {
    if (!selectors || !selectors.length) { return ''; }
    var siblings  = selectors.shift().split('+'),
        max       = siblings.length-1,
        innerHTML = zexp(selectors,level+1);
    return siblings.map(function(sibling,i) {
      return parseSel( sibling, level, i===max?innerHTML:'' );
    }).join('\n');
  }

  function convert(expression,startlevel) {
    error=''; // global to zen module
    var r = expression.split('|'),      // div>span|e
            selectors=r[0].split('>'),  // div,span                  
            filter=r[1],                // |e (html escape)
            out=zexp(selectors,startlevel||0); // eval zen expression
    if (filter) {
      if (filter==='e') {
        out = out.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      } else {
        error ='Unknown filter '+filter;
      }
    }
    //console.warn('\n\nIN=\n'+expression,'\n\nOUT=\n'+out);
    if (/^[\.\#\[\*]$/.test(error)) { error=''; } // ignore partial selectors
    return {out:out,error:error};
  }
  
  return { convert:convert };
})();

