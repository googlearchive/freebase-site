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

