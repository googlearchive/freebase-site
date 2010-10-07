/* CodeMirror main module
 *
 * Implements the CodeMirror constructor and prototype, which take care
 * of initializing the editor frame, and providing the outside interface.
 */

// The CodeMirrorConfig object is used to specify a default
// configuration. If you specify such an object before loading this
// file, the values you put into it will override the defaults given
// below. You can also assign to it after loading.
var CodeMirrorConfig = window.CodeMirrorConfig || {};

var CodeMirror = (function(){
  function setDefaults(object, defaults) {
    for (var option in defaults) {
      if (!object.hasOwnProperty(option))
        object[option] = defaults[option];
    }
  }
  function forEach(array, action) {
    for (var i = 0; i < array.length; i++)
      action(array[i]);
  }

  // These default options can be overridden by passing a set of
  // options to a specific CodeMirror constructor. See manual.html for
  // their meaning.
  setDefaults(CodeMirrorConfig, {
    stylesheet: [],
    path: "",
    parserfile: [],
    basefiles: ["util.js", "stringstream.js", "select.js", "undo.js", "editor.js", "tokenize.js"],
    iframeClass: null,
    passDelay: 200,
    passTime: 50,
    lineNumberDelay: 200,
    lineNumberTime: 50,
    continuousScanning: false,
    saveFunction: null,
    onChange: null,
    undoDepth: 50,
    undoDelay: 800,
    disableSpellcheck: true,
    textWrapping: true,
    readOnly: false,
    width: "",
    height: "300px",
    autoMatchParens: false,
    parserConfig: null,
    tabMode: "indent", // or "spaces", "default", "shift"
    reindentOnLoad: false,
    activeTokens: null,
    cursorActivity: null,
    lineNumbers: false,
    highlightActiveLine: false,
    indentUnit: 2,
    domain: null
  });

  function addLineNumberDiv(container) {
    var nums = document.createElement("DIV"),
        scroller = document.createElement("DIV");
    nums.style.position = "absolute";
    nums.style.height = "100%";
    if (nums.style.setExpression) {
      try {nums.style.setExpression("height", "this.previousSibling.offsetHeight + 'px'");}
      catch(e) {} // Seems to throw 'Not Implemented' on some IE8 versions
    }
    nums.style.top = "0px";
    nums.style.overflow = "hidden";
    container.appendChild(nums);
    scroller.className = "CodeMirror-line-numbers";
    nums.appendChild(scroller);
    scroller.innerHTML = "<div>1</div>";
    return nums;
  }

  function frameHTML(options) {
    if (typeof options.parserfile == "string")
      options.parserfile = [options.parserfile];
    if (typeof options.stylesheet == "string")
      options.stylesheet = [options.stylesheet];

    var html = ["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\"><html><head>"];
     
     // build.sh - replaced dynamic loading of files with inline code:
     html.push("<style type=\"text/css\">",CodeMirrorConfig.INLINE_CSS,"</style> <script type=\"text/javascript\">",CodeMirrorConfig.INLINE_JS,"</script>"); 
     
     
    // Hack to work around a bunch of IE8-specific problems.
    html.push("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=EmulateIE7\"/>");
    html.push("</head><body style=\"border-width: 0;\" class=\"editbox\" spellcheck=\"" +
              (options.disableSpellcheck ? "false" : "true") + "\"></body></html>");
    return html.join("");
  }

  var internetExplorer = document.selection && window.ActiveXObject && /MSIE/.test(navigator.userAgent);

  function CodeMirror(place, options) {
    // Use passed options, if any, to override defaults.
    this.options = options = options || {};
    setDefaults(options, CodeMirrorConfig);

    // Backward compatibility for deprecated options.
    if (options.dumbTabs) options.tabMode = "spaces";
    else if (options.normalTab) options.tabMode = "default";

    var frame = this.frame = document.createElement("IFRAME");
    if (options.iframeClass) frame.className = options.iframeClass;
    frame.frameBorder = 0;
    frame.style.border = "0";
    frame.style.width = '100%';
    frame.style.height = '100%';
    // display: block occasionally suppresses some Firefox bugs, so we
    // always add it, redundant as it sounds.
    frame.style.display = "block";

    var div = this.wrapping = document.createElement("DIV");
    div.style.position = "relative";
    div.className = "CodeMirror-wrapping";
    div.style.width = options.width;
    div.style.height = options.height;
    // This is used by Editor.reroutePasteEvent
    var teHack = this.textareaHack = document.createElement("TEXTAREA");
    div.appendChild(teHack);
    teHack.style.position = "absolute";
    teHack.style.left = "-10000px";
    teHack.style.width = "10px";

    // Link back to this object, so that the editor can fetch options
    // and add a reference to itself.
    frame.CodeMirror = this;
    if (options.domain && internetExplorer) {
      this.html = frameHTML(options);
      frame.src = "javascript:(function(){document.open();" +
        (options.domain ? "document.domain=\"" + options.domain + "\";" : "") +
        "document.write(window.frameElement.CodeMirror.html);document.close();})()";
    }
    else {
      frame.src = "javascript:false";
    }

    if (place.appendChild) place.appendChild(div);
    else place(div);
    div.appendChild(frame);
    if (options.lineNumbers) this.lineNumbers = addLineNumberDiv(div);

    this.win = frame.contentWindow;
    if (!options.domain || !internetExplorer) {
      this.win.document.open();
      this.win.document.write(frameHTML(options));
      this.win.document.close();
    }
  }

  CodeMirror.prototype = {
    init: function() {
      this.line2div = {}; // highlightActiveLine
      if (this.options.initCallback) this.options.initCallback(this);
      if (this.options.lineNumbers) this.activateLineNumbers();
      if (this.options.reindentOnLoad) this.reindent();
    },

    getCode: function() {return this.editor.getCode();},
    setCode: function(code) {this.editor.importCode(code);},
    selection: function() {this.focusIfIE(); return this.editor.selectedText();},
    reindent: function() {this.editor.reindent();},
    reindentSelection: function() {this.focusIfIE(); this.editor.reindentSelection(null);},

    focusIfIE: function() {
      // in IE, a lot of selection-related functionality only works when the frame is focused
      if (this.win.select.ie_selection) this.focus();
    },
    focus: function() {
      this.win.focus();
      if (this.editor.selectionSnapshot) // IE hack
        this.win.select.setBookmark(this.win.document.body, this.editor.selectionSnapshot);
    },
    replaceSelection: function(text) {
      this.focus();
      this.editor.replaceSelection(text);
      return true;
    },
    replaceChars: function(text, start, end) {
      this.editor.replaceChars(text, start, end);
    },
    getSearchCursor: function(string, fromCursor, caseFold) {
      return this.editor.getSearchCursor(string, fromCursor, caseFold);
    },

    undo: function() {this.editor.history.undo();},
    redo: function() {this.editor.history.redo();},
    historySize: function() {return this.editor.history.historySize();},
    clearHistory: function() {this.editor.history.clear();},

    grabKeys: function(callback, filter) {this.editor.grabKeys(callback, filter);},
    ungrabKeys: function() {this.editor.ungrabKeys();},

    setParser: function(name, parserConfig) {this.editor.setParser(name, parserConfig);},
    setSpellcheck: function(on) {this.win.document.body.spellcheck = on;},
    setStylesheet: function(names) {
      if (typeof names === "string") names = [names];
      var activeStylesheets = {};
      var matchedNames = {};
      var links = this.win.document.getElementsByTagName("link");
      // Create hashes of active stylesheets and matched names.
      // This is O(n^2) but n is expected to be very small.
      for (var x = 0, link; link = links[x]; x++) {
        if (link.rel.indexOf("stylesheet") !== -1) {
          for (var y = 0; y < names.length; y++) {
            var name = names[y];
            if (link.href.substring(link.href.length - name.length) === name) {
              activeStylesheets[link.href] = true;
              matchedNames[name] = true;
            }
          }
        }
      }
      // Activate the selected stylesheets and disable the rest.
      for (var x = 0, link; link = links[x]; x++) {
        if (link.rel.indexOf("stylesheet") !== -1) {
          link.disabled = !(link.href in activeStylesheets);
        }
      }
      // Create any new stylesheets.
      for (var y = 0; y < names.length; y++) {
        var name = names[y];
        if (!(name in matchedNames)) {
          var link = this.win.document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = name;
          this.win.document.getElementsByTagName('head')[0].appendChild(link);
        }
      }
    },
    setTextWrapping: function(on) {
      if (on == this.options.textWrapping) return;
      this.win.document.body.style.whiteSpace = on ? "" : "nowrap";
      this.options.textWrapping = on;
      if (this.lineNumbers) {
        this.setLineNumbers(false);
        this.setLineNumbers(true);
      }
    },
    setIndentUnit: function(unit) {this.win.indentUnit = unit;},
    setUndoDepth: function(depth) {this.editor.history.maxDepth = depth;},
    setTabMode: function(mode) {this.options.tabMode = mode;},
    setLineNumbers: function(on) {
      if (on && !this.lineNumbers) {
        this.lineNumbers = addLineNumberDiv(this.wrapping);
        this.activateLineNumbers();
      }
      else if (!on && this.lineNumbers) {
        this.wrapping.removeChild(this.lineNumbers);
        this.wrapping.style.marginLeft = "";
        this.lineNumbers = null;
      }
    },

    cursorPosition: function(start) {this.focusIfIE(); return this.editor.cursorPosition(start);},
    firstLine: function() {return this.editor.firstLine();},
    lastLine: function() {return this.editor.lastLine();},
    nextLine: function(line) {return this.editor.nextLine(line);},
    prevLine: function(line) {return this.editor.prevLine(line);},
    lineContent: function(line) {return this.editor.lineContent(line);},
    setLineContent: function(line, content) {this.editor.setLineContent(line, content);},
    removeLine: function(line){this.editor.removeLine(line);},
    insertIntoLine: function(line, position, content) {this.editor.insertIntoLine(line, position, content);},
    selectLines: function(startLine, startOffset, endLine, endOffset) {
      this.win.focus();
      this.editor.selectLines(startLine, startOffset, endLine, endOffset);
    },
    nthLine: function(n) {
      var line = this.firstLine();
      for (; n > 1 && line !== false; n--)
        line = this.nextLine(line);
      return line;
    },
    lineNumber: function(line) {
      var num = 0;
      while (line !== false) {
        num++;
        line = this.prevLine(line);
      }
      return num;
    },
    jumpToLine: function(line) {
      if (typeof line == "number") line = this.nthLine(line);
      this.selectLines(line, 0);
      this.win.focus();
    },
    currentLine: function() { // Deprecated, but still there for backward compatibility
      return this.lineNumber(this.cursorLine());
    },
    cursorLine: function() {
      return this.cursorPosition().line;
    },
    cursorCoords: function(start) {return this.editor.cursorCoords(start);},

    activateLineNumbers: function() {
      var frame = this.frame, win = frame.contentWindow, doc = win.document, body = doc.body,
          nums = this.lineNumbers, scroller = nums.firstChild, self = this;
      var barWidth = null;

      function sizeBar() {
        if (frame.offsetWidth == 0) return;
        for (var root = frame; root.parentNode; root = root.parentNode);
        if (!nums.parentNode || root != document || !win.Editor) {
          // Clear event handlers (their nodes might already be collected, so try/catch)
          try{clear();}catch(e){}
          clearInterval(sizeInterval);
          return;
        }

        if (nums.offsetWidth != barWidth) {
          barWidth = nums.offsetWidth;
          nums.style.left = "-" + (frame.parentNode.style.marginLeft = barWidth + "px");
        }
      }
      function doScroll() {
        nums.scrollTop = body.scrollTop || doc.documentElement.scrollTop || 0;
      }
      // Cleanup function, registered by nonWrapping and wrapping.
      var clear = function(){};
      sizeBar();
      var sizeInterval = setInterval(sizeBar, 500);

      var oldNumDiv;
      win.highlightActiveLine = function() {
        if (oldNumDiv) {
          oldNumDiv.className = oldNumDiv.className.replace(/\s*Codemirror-current-line\s*/,'');
        }
        var lineNumDiv = self.line2div[self.currentLine()];
        if (lineNumDiv) {
          lineNumDiv.className += ' Codemirror-current-line';
          oldNumDiv = lineNumDiv;
        }
      };

      function ensureEnoughLineNumbers(fill) {
        var lineHeight = scroller.firstChild.offsetHeight;
        if (lineHeight == 0) return;
        var targetHeight = 50 + Math.max(body.offsetHeight, Math.max(frame.offsetHeight, body.scrollHeight || 0)),
            lastNumber = Math.ceil(targetHeight / lineHeight);
        for (var i = scroller.childNodes.length; i <= lastNumber; i++) {
          var div = document.createElement("DIV");
          div.appendChild(document.createTextNode(fill ? String(i + 1) : "\u00a0"));
          scroller.appendChild(div);
          self.line2div[i+1] = div;             // highlightActiveLine
        }
        self.line2div[1] = scroller.firstChild; // line 1 is created using innerHTML 
      }

      function nonWrapping() {
        function update() {
          ensureEnoughLineNumbers(true);
          doScroll();
        }
        self.updateNumbers = update;
        var onScroll = win.addEventHandler(win, "scroll", doScroll, true),
            onResize = win.addEventHandler(win, "resize", update, true);
        clear = function(){
          onScroll(); onResize();
          if (self.updateNumbers == update) self.updateNumbers = null;
        };
        update();
      }
      
      function wrapping() {
        var node, lineNum, next, pos, changes = [];

        function setNum(n) {
          // Does not typically happen (but can, if you mess with the
          // document during the numbering)
          if (!lineNum) lineNum = scroller.appendChild(document.createElement("DIV"));
          // Changes are accumulated, so that the document layout
          // doesn't have to be recomputed during the pass
          changes.push(lineNum); changes.push(n);
          pos = lineNum.offsetHeight + lineNum.offsetTop;
          lineNum = lineNum.nextSibling;
        }
        function commitChanges() {
          for (var i = 0; i < changes.length; i += 2) {
            self.line2div[changes[i + 1]] = changes[i] ; // highlightActiveLine
            changes[i].innerHTML = changes[i + 1];
          }
          changes = [];
        }
        function work() {
          if (!scroller.parentNode || scroller.parentNode != self.lineNumbers) return;

          var endTime = new Date().getTime() + self.options.lineNumberTime;
          while (node) {
            setNum(next++);
            for (; node && !win.isBR(node); node = node.nextSibling) {
              var bott = node.offsetTop + node.offsetHeight;
              while (scroller.offsetHeight && bott - 3 > pos) setNum("&nbsp;");
            }
            if (node) node = node.nextSibling;
            if (new Date().getTime() > endTime) {
              commitChanges();
              pending = setTimeout(work, self.options.lineNumberDelay);
              return;
            }
          }
          commitChanges();
          doScroll();
        }
        function start() {
          doScroll();
          ensureEnoughLineNumbers(false);
          node = body.firstChild;
          lineNum = scroller.firstChild;
          pos = 0;
          next = 1;
          work();
        }

        start();
        var pending = null;
        function update() {
          if (pending) clearTimeout(pending);
          if (self.editor.allClean()) start();
          else pending = setTimeout(update, 200);
        }
        self.updateNumbers = update;
        var onScroll = win.addEventHandler(win, "scroll", doScroll, true),
            onResize = win.addEventHandler(win, "resize", update, true);
        clear = function(){
          if (pending) clearTimeout(pending);
          if (self.updateNumbers == update) self.updateNumbers = null;
          onScroll();
          onResize();
        };
      }
      (this.options.textWrapping ? wrapping : nonWrapping)();
    }
  };

  CodeMirror.InvalidLineHandle = {toString: function(){return "CodeMirror.InvalidLineHandle";}};

  CodeMirror.replace = function(element) {
    if (typeof element == "string")
      element = document.getElementById(element);
    return function(newElement) {
      element.parentNode.replaceChild(newElement, element);
    };
  };

  CodeMirror.fromTextArea = function(area, options) {
    if (typeof area == "string")
      area = document.getElementById(area);

    options = options || {};
    if (area.style.width && options.width == null)
      options.width = area.style.width;
    if (area.style.height && options.height == null)
      options.height = area.style.height;
    if (options.content == null) options.content = area.value;

    if (area.form) {
      function updateField() {
        area.value = mirror.getCode();
      }
      if (typeof area.form.addEventListener == "function")
        area.form.addEventListener("submit", updateField, false);
      else
        area.form.attachEvent("onsubmit", updateField);
      var realSubmit = area.form.submit;
      function wrapSubmit() {
        updateField();
        // Can't use realSubmit.apply because IE6 is too stupid
        area.form.submit = realSubmit;
        area.form.submit();
        area.form.submit = wrapSubmit;
      }
      area.form.submit = wrapSubmit;
    }

    function insert(frame) {
      if (area.nextSibling)
        area.parentNode.insertBefore(frame, area.nextSibling);
      else
        area.parentNode.appendChild(frame);
    }

    area.style.display = "none";
    var mirror = new CodeMirror(insert, options);
    return mirror;
  };

  CodeMirror.isProbablySupported = function() {
    // This is rather awful, but can be useful.
    var match;
    if (window.opera)
      return Number(window.opera.version()) >= 9.52;
    else if (/Apple Computers, Inc/.test(navigator.vendor) && (match = navigator.userAgent.match(/Version\/(\d+(?:\.\d+)?)\./)))
      return Number(match[1]) >= 3;
    else if (document.selection && window.ActiveXObject && (match = navigator.userAgent.match(/MSIE (\d+(?:\.\d*)?)\b/)))
      return Number(match[1]) >= 6;
    else if (match = navigator.userAgent.match(/gecko\/(\d{8})/i))
      return Number(match[1]) >= 20050901;
    else if (match = navigator.userAgent.match(/AppleWebKit\/(\d+)/))
      return Number(match[1]) >= 525;
    else
      return null;
  };

  return CodeMirror;
})();

CodeMirrorConfig.INLINE_JS = 
[
  ';function method(obj,name){return function(){obj[name].apply(obj,arguments);};}',
  'var StopIteration={toString:function(){return"StopIteration"}};function forEach(iter,f){if(iter.next){try{while(true)f(iter.next());}',
  'catch(e){if(e!=StopIteration)throw e;}}',
  'else{for(var i=0;i<iter.length;i++)',
  'f(iter[i]);}}',
  'function map(iter,f){var accum=[];forEach(iter,function(val){accum.push(f(val));});return accum;}',
  'function matcher(regexp){return function(value){return regexp.test(value);};}',
  'function hasClass(element,className){var classes=element.className;return classes&&new RegExp("(^| )"+className+"($| )").test(classes);}',
  'function insertAfter(newNode,oldNode){var parent=oldNode.parentNode;parent.insertBefore(newNode,oldNode.nextSibling);return newNode;}',
  'function removeElement(node){if(node.parentNode)',
  'node.parentNode.removeChild(node);}',
  'function clearElement(node){while(node.firstChild)',
  'node.removeChild(node.firstChild);}',
  'function isAncestor(node,child){while(child=child.parentNode){if(node==child)',
  'return true;}',
  'return false;}',
  'var nbsp="\\u00a0";var matching={"{":"}","[":"]","(":")","}":"{","]":"[",")":"("};function normalizeEvent(event){if(!event.stopPropagation){event.stopPropagation=function(){this.cancelBubble=true;};event.preventDefault=function(){this.returnValue=false;};}',
  'if(!event.stop){event.stop=function(){this.stopPropagation();this.preventDefault();};}',
  'if(event.type=="keypress"){event.code=(event.charCode==null)?event.keyCode:event.charCode;event.character=String.fromCharCode(event.code);}',
  'return event;}',
  'function addEventHandler(node,type,handler,removeFunc){function wrapHandler(event){handler(normalizeEvent(event||window.event));}',
  'if(typeof node.addEventListener=="function"){node.addEventListener(type,wrapHandler,false);if(removeFunc)return function(){node.removeEventListener(type,wrapHandler,false);};}',
  'else{node.attachEvent("on"+type,wrapHandler);if(removeFunc)return function(){node.detachEvent("on"+type,wrapHandler);};}}',
  'function nodeText(node){return node.textContent||node.innerText||node.nodeValue||"";}',
  'function nodeTop(node){var top=0;while(node.offsetParent){top+=node.offsetTop;node=node.offsetParent;}',
  'return top;}',
  'function isBR(node){var nn=node.nodeName;return nn=="BR"||nn=="br";}',
  'function isSpan(node){var nn=node.nodeName;return nn=="SPAN"||nn=="span";};var stringStream=function(source){var current="";var pos=0;var accum="";function ensureChars(){while(pos==current.length){accum+=current;current="";pos=0;try{current=source.next();}',
  'catch(e){if(e!=StopIteration)throw e;else return false;}}',
  'return true;}',
  'return{peek:function(){if(!ensureChars())return null;return current.charAt(pos);},next:function(){if(!ensureChars()){if(accum.length>0)',
  'throw"End of stringstream reached without emptying buffer (\'"+accum+"\').";else',
  'throw StopIteration;}',
  'return current.charAt(pos++);},get:function(){var temp=accum;accum="";if(pos>0){temp+=current.slice(0,pos);current=current.slice(pos);pos=0;}',
  'return temp;},push:function(str){current=current.slice(0,pos)+str+current.slice(pos);},lookAhead:function(str,consume,skipSpaces,caseInsensitive){function cased(str){return caseInsensitive?str.toLowerCase():str;}',
  'str=cased(str);var found=false;var _accum=accum,_pos=pos;if(skipSpaces)this.nextWhileMatches(/[\\s\\u00a0]/);while(true){var end=pos+str.length,left=current.length-pos;if(end<=current.length){found=str==cased(current.slice(pos,end));pos=end;break;}',
  'else if(str.slice(0,left)==cased(current.slice(pos))){accum+=current;current="";try{current=source.next();}',
  'catch(e){break;}',
  'pos=0;str=str.slice(left);}',
  'else{break;}}',
  'if(!(found&&consume)){current=accum.slice(_accum.length)+current;pos=_pos;accum=_accum;}',
  'return found;},more:function(){return this.peek()!==null;},applies:function(test){var next=this.peek();return(next!==null&&test(next));},nextWhile:function(test){var next;while((next=this.peek())!==null&&test(next))',
  'this.next();},matches:function(re){var next=this.peek();return(next!==null&&re.test(next));},nextWhileMatches:function(re){var next;while((next=this.peek())!==null&&re.test(next))',
  'this.next();},equals:function(ch){return ch===this.peek();},endOfLine:function(){var next=this.peek();return next==null||next=="\\n";}};};;var select={};(function(){select.ie_selection=document.selection&&document.selection.createRangeCollection;function topLevelNodeAt(node,top){while(node&&node.parentNode!=top)',
  'node=node.parentNode;return node;}',
  'function topLevelNodeBefore(node,top){while(!node.previousSibling&&node.parentNode!=top)',
  'node=node.parentNode;return topLevelNodeAt(node.previousSibling,top);}',
  'var fourSpaces="\\u00a0\\u00a0\\u00a0\\u00a0";select.scrollToNode=function(element){if(!element)return;var doc=element.ownerDocument,body=doc.body,win=(doc.defaultView||doc.parentWindow),html=doc.documentElement,atEnd=!element.nextSibling||!element.nextSibling.nextSibling||!element.nextSibling.nextSibling.nextSibling;var compensateHack=0;while(element&&!element.offsetTop){compensateHack++;element=element.previousSibling;}',
  'if(compensateHack==0)atEnd=false;if(webkit&&element&&element.offsetTop==5&&element.offsetLeft==5)',
  'return',
  'var y=compensateHack*(element?element.offsetHeight:0),x=0,pos=element;while(pos&&pos.offsetParent){y+=pos.offsetTop;if(!isBR(pos))',
  'x+=pos.offsetLeft;pos=pos.offsetParent;}',
  'var scroll_x=body.scrollLeft||html.scrollLeft||0,scroll_y=body.scrollTop||html.scrollTop||0,screen_x=x-scroll_x,screen_y=y-scroll_y,scroll=false;if(screen_x<0||screen_x>(win.innerWidth||html.clientWidth||0)){scroll_x=x;scroll=true;}',
  'if(screen_y<0||atEnd||screen_y>(win.innerHeight||html.clientHeight||0)-50){scroll_y=atEnd?1e6:y;scroll=true;}',
  'if(scroll)win.scrollTo(scroll_x,scroll_y);};select.scrollToCursor=function(container){select.scrollToNode(select.selectionTopNode(container,true)||container.firstChild);};var currentSelection=null;select.snapshotChanged=function(){if(currentSelection)currentSelection.changed=true;};select.snapshotReplaceNode=function(from,to,length,offset){if(!currentSelection)return;function replace(point){if(from==point.node){currentSelection.changed=true;if(length&&point.offset>length){point.offset-=length;}',
  'else{point.node=to;point.offset+=(offset||0);}}}',
  'replace(currentSelection.start);replace(currentSelection.end);};select.snapshotMove=function(from,to,distance,relative,ifAtStart){if(!currentSelection)return;function move(point){if(from==point.node&&(!ifAtStart||point.offset==0)){currentSelection.changed=true;point.node=to;if(relative)point.offset=Math.max(0,point.offset+distance);else point.offset=distance;}}',
  'move(currentSelection.start);move(currentSelection.end);};if(select.ie_selection){function selectionNode(win,start){var range=win.document.selection.createRange();range.collapse(start);function nodeAfter(node){var found=null;while(!found&&node){found=node.nextSibling;node=node.parentNode;}',
  'return nodeAtStartOf(found);}',
  'function nodeAtStartOf(node){while(node&&node.firstChild)node=node.firstChild;return{node:node,offset:0};}',
  'var containing=range.parentElement();if(!isAncestor(win.document.body,containing))return null;if(!containing.firstChild)return nodeAtStartOf(containing);var working=range.duplicate();working.moveToElementText(containing);working.collapse(true);for(var cur=containing.firstChild;cur;cur=cur.nextSibling){if(cur.nodeType==3){var size=cur.nodeValue.length;working.move("character",size);}',
  'else{working.moveToElementText(cur);working.collapse(false);}',
  'var dir=range.compareEndPoints("StartToStart",working);if(dir==0)return nodeAfter(cur);if(dir==1)continue;if(cur.nodeType!=3)return nodeAtStartOf(cur);working.setEndPoint("StartToEnd",range);return{node:cur,offset:size-working.text.length};}',
  'return nodeAfter(containing);}',
  'select.markSelection=function(win){currentSelection=null;var sel=win.document.selection;if(!sel)return;var start=selectionNode(win,true),end=selectionNode(win,false);if(!start||!end)return;currentSelection={start:start,end:end,window:win,changed:false};};select.selectMarked=function(){if(!currentSelection||!currentSelection.changed)return;var win=currentSelection.window,doc=win.document;function makeRange(point){var range=doc.body.createTextRange(),node=point.node;if(!node){range.moveToElementText(currentSelection.window.document.body);range.collapse(false);}',
  'else if(node.nodeType==3){range.moveToElementText(node.parentNode);var offset=point.offset;while(node.previousSibling){node=node.previousSibling;offset+=(node.innerText||"").length;}',
  'range.move("character",offset);}',
  'else{range.moveToElementText(node);range.collapse(true);}',
  'return range;}',
  'var start=makeRange(currentSelection.start),end=makeRange(currentSelection.end);start.setEndPoint("StartToEnd",end);start.select();};select.selectionTopNode=function(container,start){var selection=container.ownerDocument.selection;if(!selection)return false;var range=selection.createRange(),range2=range.duplicate();range.collapse(start);var around=range.parentElement();if(around&&isAncestor(container,around)){range2.moveToElementText(around);if(range.compareEndPoints("StartToStart",range2)==1)',
  'return topLevelNodeAt(around,container);}',
  'function moveToNodeStart(range,node){if(node.nodeType==3){var count=0,cur=node.previousSibling;while(cur&&cur.nodeType==3){count+=cur.nodeValue.length;cur=cur.previousSibling;}',
  'if(cur){try{range.moveToElementText(cur);}',
  'catch(e){return false;}',
  'range.collapse(false);}',
  'else range.moveToElementText(node.parentNode);if(count)range.move("character",count);}',
  'else{try{range.moveToElementText(node);}',
  'catch(e){return false;}}',
  'return true;}',
  'var start=0,end=container.childNodes.length-1;while(start<end){var middle=Math.ceil((end+start)/2),node=container.childNodes[middle];if(!node)return false;if(!moveToNodeStart(range2,node))return false;if(range.compareEndPoints("StartToStart",range2)==1)',
  'start=middle;else',
  'end=middle-1;}',
  'return container.childNodes[start]||null;};select.focusAfterNode=function(node,container){var range=container.ownerDocument.body.createTextRange();range.moveToElementText(node||container);range.collapse(!node);range.select();};select.somethingSelected=function(win){var sel=win.document.selection;return sel&&(sel.createRange().text!="");};function insertAtCursor(window,html){var selection=window.document.selection;if(selection){var range=selection.createRange();range.pasteHTML(html);range.collapse(false);range.select();}}',
  'select.insertNewlineAtCursor=function(window){insertAtCursor(window,"<br>");};select.insertTabAtCursor=function(window){insertAtCursor(window,fourSpaces);};select.cursorPos=function(container,start){var selection=container.ownerDocument.selection;if(!selection)return null;var topNode=select.selectionTopNode(container,start);while(topNode&&!isBR(topNode))',
  'topNode=topNode.previousSibling;var range=selection.createRange(),range2=range.duplicate();range.collapse(start);if(topNode){range2.moveToElementText(topNode);range2.collapse(false);}',
  'else{try{range2.moveToElementText(container);}',
  'catch(e){return null;}',
  'range2.collapse(true);}',
  'range.setEndPoint("StartToStart",range2);return{node:topNode,offset:range.text.length};};select.setCursorPos=function(container,from,to){function rangeAt(pos){var range=container.ownerDocument.body.createTextRange();if(!pos.node){range.moveToElementText(container);range.collapse(true);}',
  'else{range.moveToElementText(pos.node);range.collapse(false);}',
  'range.move("character",pos.offset);return range;}',
  'var range=rangeAt(from);if(to&&to!=from)',
  'range.setEndPoint("EndToEnd",rangeAt(to));range.select();}',
  'select.getBookmark=function(container){var from=select.cursorPos(container,true),to=select.cursorPos(container,false);if(from&&to)return{from:from,to:to};};select.setBookmark=function(container,mark){if(!mark)return;select.setCursorPos(container,mark.from,mark.to);};}',
  'else{select.markSelection=function(win){var selection=win.getSelection();if(!selection||selection.rangeCount==0)',
  'return(currentSelection=null);var range=selection.getRangeAt(0);currentSelection={start:{node:range.startContainer,offset:range.startOffset},end:{node:range.endContainer,offset:range.endOffset},window:win,changed:false};function normalize(point){while(point.node.nodeType!=3&&!isBR(point.node)){var newNode=point.node.childNodes[point.offset]||point.node.nextSibling;point.offset=0;while(!newNode&&point.node.parentNode){point.node=point.node.parentNode;newNode=point.node.nextSibling;}',
  'point.node=newNode;if(!newNode)',
  'break;}}',
  'normalize(currentSelection.start);normalize(currentSelection.end);};select.selectMarked=function(){var cs=currentSelection;function focusIssue(){return cs.start.node==cs.end.node&&cs.start.offset==0&&cs.end.offset==0;}',
  'if(!cs||!(cs.changed||(webkit&&focusIssue())))return;var win=cs.window,range=win.document.createRange();function setPoint(point,which){if(point.node){if(point.offset==0)',
  'range["set"+which+"Before"](point.node);else',
  'range["set"+which](point.node,point.offset);}',
  'else{range.setStartAfter(win.document.body.lastChild||win.document.body);}}',
  'setPoint(cs.end,"End");setPoint(cs.start,"Start");selectRange(range,win);};function selectRange(range,window){var selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}',
  'function selectionRange(window){var selection=window.getSelection();if(!selection||selection.rangeCount==0)',
  'return false;else',
  'return selection.getRangeAt(0);}',
  'select.selectionTopNode=function(container,start){var range=selectionRange(container.ownerDocument.defaultView);if(!range)return false;var node=start?range.startContainer:range.endContainer;var offset=start?range.startOffset:range.endOffset;if(window.opera&&!start&&range.endContainer==container&&range.endOffset==range.startOffset+1&&container.childNodes[range.startOffset]&&isBR(container.childNodes[range.startOffset]))',
  'offset--;if(node.nodeType==3){if(offset>0)',
  'return topLevelNodeAt(node,container);else',
  'return topLevelNodeBefore(node,container);}',
  'else if(node.nodeName.toUpperCase()=="HTML"){return(offset==1?null:container.lastChild);}',
  'else if(node==container){return(offset==0)?null:node.childNodes[offset-1];}',
  'else{if(offset==node.childNodes.length)',
  'return topLevelNodeAt(node,container);else if(offset==0)',
  'return topLevelNodeBefore(node,container);else',
  'return topLevelNodeAt(node.childNodes[offset-1],container);}};select.focusAfterNode=function(node,container){var win=container.ownerDocument.defaultView,range=win.document.createRange();range.setStartBefore(container.firstChild||container);if(node&&!node.firstChild)',
  'range.setEndAfter(node);else if(node)',
  'range.setEnd(node,node.childNodes.length);else',
  'range.setEndBefore(container.firstChild||container);range.collapse(false);selectRange(range,win);};select.somethingSelected=function(win){var range=selectionRange(win);return range&&!range.collapsed;};function insertNodeAtCursor(window,node){var range=selectionRange(window);if(!range)return;range.deleteContents();range.insertNode(node);webkitLastLineHack(window.document.body);if(window.opera&&isBR(node)&&isSpan(node.parentNode)){var next=node.nextSibling,p=node.parentNode,outer=p.parentNode;outer.insertBefore(node,p.nextSibling);var textAfter="";for(;next&&next.nodeType==3;next=next.nextSibling){textAfter+=next.nodeValue;removeElement(next);}',
  'outer.insertBefore(makePartSpan(textAfter,window.document),node.nextSibling);}',
  'range=window.document.createRange();range.selectNode(node);range.collapse(false);selectRange(range,window);}',
  'select.insertNewlineAtCursor=function(window){insertNodeAtCursor(window,window.document.createElement("BR"));};select.insertTabAtCursor=function(window){insertNodeAtCursor(window,window.document.createTextNode(fourSpaces));};select.cursorPos=function(container,start){var range=selectionRange(window);if(!range)return;var topNode=select.selectionTopNode(container,start);while(topNode&&!isBR(topNode))',
  'topNode=topNode.previousSibling;range=range.cloneRange();range.collapse(start);if(topNode)',
  'range.setStartAfter(topNode);else',
  'range.setStartBefore(container);var text=range.toString();if(webkit)text=text.replace(/\\u200b/g,"");return{node:topNode,offset:text.length};};select.setCursorPos=function(container,from,to){var win=container.ownerDocument.defaultView,range=win.document.createRange();function setPoint(node,offset,side){if(offset==0&&node&&!node.nextSibling){range["set"+side+"After"](node);return true;}',
  'if(!node)',
  'node=container.firstChild;else',
  'node=node.nextSibling;if(!node)return;if(offset==0){range["set"+side+"Before"](node);return true;}',
  'var backlog=[]',
  'function decompose(node){if(node.nodeType==3)',
  'backlog.push(node);else',
  'forEach(node.childNodes,decompose);}',
  'while(true){while(node&&!backlog.length){decompose(node);node=node.nextSibling;}',
  'var cur=backlog.shift();if(!cur)return false;var length=cur.nodeValue.length;if(length>=offset){range["set"+side](cur,offset);return true;}',
  'offset-=length;}}',
  'to=to||from;if(setPoint(to.node,to.offset,"End")&&setPoint(from.node,from.offset,"Start"))',
  'selectRange(range,win);};}})();;function UndoHistory(container,maxDepth,commitDelay,editor){this.container=container;this.maxDepth=maxDepth;this.commitDelay=commitDelay;this.editor=editor;this.parent=editor.parent;var initial={text:"",from:null,to:null};this.first=initial;this.last=initial;this.firstTouched=false;this.history=[];this.redoHistory=[];this.touched=[];}',
  'UndoHistory.prototype={scheduleCommit:function(){var self=this;this.parent.clearTimeout(this.commitTimeout);this.commitTimeout=this.parent.setTimeout(function(){self.tryCommit();},this.commitDelay);},touch:function(node){this.setTouched(node);this.scheduleCommit();},undo:function(){this.commit();if(this.history.length){var item=this.history.pop();this.redoHistory.push(this.updateTo(item,"applyChain"));this.notifyEnvironment();return this.chainNode(item);}},redo:function(){this.commit();if(this.redoHistory.length){var item=this.redoHistory.pop();this.addUndoLevel(this.updateTo(item,"applyChain"));this.notifyEnvironment();return this.chainNode(item);}},clear:function(){this.history=[];this.redoHistory=[];},historySize:function(){return{undo:this.history.length,redo:this.redoHistory.length};},push:function(from,to,lines){var chain=[];for(var i=0;i<lines.length;i++){var end=(i==lines.length-1)?to:this.container.ownerDocument.createElement("BR");chain.push({from:from,to:end,text:cleanText(lines[i])});from=end;}',
  'this.pushChains([chain],from==null&&to==null);this.notifyEnvironment();},pushChains:function(chains,doNotHighlight){this.commit(doNotHighlight);this.addUndoLevel(this.updateTo(chains,"applyChain"));this.redoHistory=[];},chainNode:function(chains){for(var i=0;i<chains.length;i++){var start=chains[i][0],node=start&&(start.from||start.to);if(node)return node;}},reset:function(){this.history=[];this.redoHistory=[];},textAfter:function(br){return this.after(br).text;},nodeAfter:function(br){return this.after(br).to;},nodeBefore:function(br){return this.before(br).from;},tryCommit:function(){if(!window.UndoHistory)return;if(this.editor.highlightDirty())this.commit(true);else this.scheduleCommit();},commit:function(doNotHighlight){this.parent.clearTimeout(this.commitTimeout);if(!doNotHighlight)this.editor.highlightDirty(true);var chains=this.touchedChains(),self=this;if(chains.length){this.addUndoLevel(this.updateTo(chains,"linkChain"));this.redoHistory=[];this.notifyEnvironment();}},updateTo:function(chains,updateFunc){var shadows=[],dirty=[];for(var i=0;i<chains.length;i++){shadows.push(this.shadowChain(chains[i]));dirty.push(this[updateFunc](chains[i]));}',
  'if(updateFunc=="applyChain")',
  'this.notifyDirty(dirty);return shadows;},notifyDirty:function(nodes){forEach(nodes,method(this.editor,"addDirtyNode"))',
  'this.editor.scheduleHighlight();},notifyEnvironment:function(){if(window.frameElement&&window.frameElement.CodeMirror.updateNumbers)',
  'window.frameElement.CodeMirror.updateNumbers();if(this.onChange)this.onChange();},linkChain:function(chain){for(var i=0;i<chain.length;i++){var line=chain[i];if(line.from)line.from.historyAfter=line;else this.first=line;if(line.to)line.to.historyBefore=line;else this.last=line;}},after:function(node){return node?node.historyAfter:this.first;},before:function(node){return node?node.historyBefore:this.last;},setTouched:function(node){if(node){if(!node.historyTouched){this.touched.push(node);node.historyTouched=true;}}',
  'else{this.firstTouched=true;}},addUndoLevel:function(diffs){this.history.push(diffs);if(this.history.length>this.maxDepth)',
  'this.history.shift();},touchedChains:function(){var self=this;var nullTemp=null;function temp(node){return node?node.historyTemp:nullTemp;}',
  'function setTemp(node,line){if(node)node.historyTemp=line;else nullTemp=line;}',
  'function buildLine(node){var text=[];for(var cur=node?node.nextSibling:self.container.firstChild;cur&&!isBR(cur);cur=cur.nextSibling)',
  'if(cur.currentText)text.push(cur.currentText);return{from:node,to:cur,text:cleanText(text.join(""))};}',
  'var lines=[];if(self.firstTouched)self.touched.push(null);forEach(self.touched,function(node){if(node&&node.parentNode!=self.container)return;if(node)node.historyTouched=false;else self.firstTouched=false;var line=buildLine(node),shadow=self.after(node);if(!shadow||shadow.text!=line.text||shadow.to!=line.to){lines.push(line);setTemp(node,line);}});function nextBR(node,dir){var link=dir+"Sibling",search=node[link];while(search&&!isBR(search))',
  'search=search[link];return search;}',
  'var chains=[];self.touched=[];forEach(lines,function(line){if(!temp(line.from))return;var chain=[],curNode=line.from,safe=true;while(true){var curLine=temp(curNode);if(!curLine){if(safe)break;else curLine=buildLine(curNode);}',
  'chain.unshift(curLine);setTemp(curNode,null);if(!curNode)break;safe=self.after(curNode);curNode=nextBR(curNode,"previous");}',
  'curNode=line.to;safe=self.before(line.from);while(true){if(!curNode)break;var curLine=temp(curNode);if(!curLine){if(safe)break;else curLine=buildLine(curNode);}',
  'chain.push(curLine);setTemp(curNode,null);safe=self.before(curNode);curNode=nextBR(curNode,"next");}',
  'chains.push(chain);});return chains;},shadowChain:function(chain){var shadows=[],next=this.after(chain[0].from),end=chain[chain.length-1].to;while(true){shadows.push(next);var nextNode=next.to;if(!nextNode||nextNode==end)',
  'break;else',
  'next=nextNode.historyAfter||this.before(end);}',
  'return shadows;},applyChain:function(chain){var cursor=select.cursorPos(this.container,false),self=this;function removeRange(from,to){var pos=from?from.nextSibling:self.container.firstChild;while(pos!=to){var temp=pos.nextSibling;removeElement(pos);pos=temp;}}',
  'var start=chain[0].from,end=chain[chain.length-1].to;removeRange(start,end);for(var i=0;i<chain.length;i++){var line=chain[i];if(i>0)',
  'self.container.insertBefore(line.from,end);var node=makePartSpan(fixSpaces(line.text),this.container.ownerDocument);self.container.insertBefore(node,end);if(cursor&&cursor.node==line.from){var cursordiff=0;var prev=this.after(line.from);if(prev&&i==chain.length-1){for(var match=0;match<cursor.offset&&line.text.charAt(match)==prev.text.charAt(match);match++);if(cursor.offset>match)',
  'cursordiff=line.text.length-prev.text.length;}',
  'select.setCursorPos(this.container,{node:line.from,offset:Math.max(0,cursor.offset+cursordiff)});}',
  'else if(cursor&&(i==chain.length-1)&&cursor.node&&cursor.node.parentNode!=this.container){select.setCursorPos(this.container,{node:line.from,offset:line.text.length});}}',
  'this.linkChain(chain);return start;}};;var internetExplorer=document.selection&&window.ActiveXObject&&/MSIE/.test(navigator.userAgent);var webkit=/AppleWebKit/.test(navigator.userAgent);var safari=/Apple Computers, Inc/.test(navigator.vendor);var gecko=/gecko\\/(\\d{8})/i.test(navigator.userAgent);function makeWhiteSpace(n){var buffer=[],nb=true;for(;n>0;n--){buffer.push((nb||n==1)?nbsp:" ");nb^=true;}',
  'return buffer.join("");}',
  'function fixSpaces(string){if(string.charAt(0)==" ")string=nbsp+string.slice(1);return string.replace(/\\t/g,function(){return makeWhiteSpace(indentUnit);}).replace(/[ \\u00a0]{2,}/g,function(s){return makeWhiteSpace(s.length);});}',
  'function cleanText(text){return text.replace(/\\u00a0/g," ").replace(/\\u200b/g,"");}',
  'function makePartSpan(value,doc){var text=value;if(value.nodeType==3)text=value.nodeValue;else value=doc.createTextNode(text);var span=doc.createElement("SPAN");span.isPart=true;span.appendChild(value);span.currentText=text;return span;}',
  'var webkitLastLineHack=webkit?function(container){var last=container.lastChild;if(!last||!last.isPart||last.textContent!="\\u200b")',
  'container.appendChild(makePartSpan("\\u200b",container.ownerDocument));}:function(){};var Editor=(function(){var newlineElements={"P":true,"DIV":true,"LI":true};function asEditorLines(string){var tab=makeWhiteSpace(indentUnit);return map(string.replace(/\\t/g,tab).replace(/\\u00a0/g," ").replace(/\\r\\n?/g,"\\n").split("\\n"),fixSpaces);}',
  'function simplifyDOM(root,atEnd){var doc=root.ownerDocument;var result=[];var leaving=true;function simplifyNode(node,top){if(node.nodeType==3){var text=node.nodeValue=fixSpaces(node.nodeValue.replace(/[\\r\\u200b]/g,"").replace(/\\n/g," "));if(text.length)leaving=false;result.push(node);}',
  'else if(isBR(node)&&node.childNodes.length==0){leaving=true;result.push(node);}',
  'else{for(var n=node.firstChild;n;n=n.nextSibling)simplifyNode(n);if(!leaving&&newlineElements.hasOwnProperty(node.nodeName.toUpperCase())){leaving=true;if(!atEnd||!top)',
  'result.push(doc.createElement("BR"));}}}',
  'simplifyNode(root,true);return result;}',
  'function traverseDOM(start){var owner=start.ownerDocument;var nodeQueue=[];function pointAt(node){var parent=node.parentNode;var next=node.nextSibling;return function(newnode){parent.insertBefore(newnode,next);};}',
  'var point=null;var afterBR=true;function insertPart(part){var text="\\n";if(part.nodeType==3){select.snapshotChanged();part=makePartSpan(part,owner);text=part.currentText;afterBR=false;}',
  'else{if(afterBR&&window.opera)',
  'point(makePartSpan("",owner));afterBR=true;}',
  'part.dirty=true;nodeQueue.push(part);point(part);return text;}',
  'function writeNode(node,end){var simplified=simplifyDOM(node,end);for(var i=0;i<simplified.length;i++)',
  'simplified[i]=insertPart(simplified[i]);return simplified.join("");}',
  'function partNode(node){if(node.isPart&&node.childNodes.length==1&&node.firstChild.nodeType==3){node.currentText=node.firstChild.nodeValue;return!/[\\n\\t\\r]/.test(node.currentText);}',
  'return false;}',
  'function next(){if(!start)throw StopIteration;var node=start;start=node.nextSibling;if(partNode(node)){nodeQueue.push(node);afterBR=false;return node.currentText;}',
  'else if(isBR(node)){if(afterBR&&window.opera)',
  'node.parentNode.insertBefore(makePartSpan("",owner),node);nodeQueue.push(node);afterBR=true;return"\\n";}',
  'else{var end=!node.nextSibling;point=pointAt(node);removeElement(node);return writeNode(node,end);}}',
  'return{next:next,nodes:nodeQueue};}',
  'function nodeSize(node){return isBR(node)?1:node.currentText.length;}',
  'function startOfLine(node){while(node&&!isBR(node))node=node.previousSibling;return node;}',
  'function endOfLine(node,container){if(!node)node=container.firstChild;else if(isBR(node))node=node.nextSibling;while(node&&!isBR(node))node=node.nextSibling;return node;}',
  'function time(){return new Date().getTime();}',
  'function SearchCursor(editor,string,fromCursor,caseFold){this.editor=editor;if(caseFold==undefined){caseFold=(string==string.toLowerCase());}',
  'this.caseFold=caseFold;if(caseFold)string=string.toLowerCase();this.history=editor.history;this.history.commit();this.atOccurrence=false;this.fallbackSize=15;var cursor;if(fromCursor&&(cursor=select.cursorPos(this.editor.container))){this.line=cursor.node;this.offset=cursor.offset;}',
  'else{this.line=null;this.offset=0;}',
  'this.valid=!!string;var target=string.split("\\n"),self=this;this.matches=(target.length==1)?function(){var line=cleanText(self.history.textAfter(self.line).slice(self.offset));var match=(self.caseFold?line.toLowerCase():line).indexOf(string);if(match>-1)',
  'return{from:{node:self.line,offset:self.offset+match},to:{node:self.line,offset:self.offset+match+string.length}};}:function(){var firstLine=cleanText(self.history.textAfter(self.line).slice(self.offset));var match=(self.caseFold?firstLine.toLowerCase():firstLine).lastIndexOf(target[0]);if(match==-1||match!=firstLine.length-target[0].length)',
  'return false;var startOffset=self.offset+match;var line=self.history.nodeAfter(self.line);for(var i=1;i<target.length-1;i++){var lineText=cleanText(self.history.textAfter(line));if((self.caseFold?lineText.toLowerCase():lineText)!=target[i])',
  'return false;line=self.history.nodeAfter(line);}',
  'var lastLine=cleanText(self.history.textAfter(line));if((self.caseFold?lastLine.toLowerCase():lastLine).indexOf(target[target.length-1])!=0)',
  'return false;return{from:{node:self.line,offset:startOffset},to:{node:line,offset:target[target.length-1].length}};};}',
  'SearchCursor.prototype={findNext:function(){if(!this.valid)return false;this.atOccurrence=false;var self=this;if(this.line&&!this.line.parentNode){this.line=null;this.offset=0;}',
  'function saveAfter(pos){if(self.history.textAfter(pos.node).length>pos.offset){self.line=pos.node;self.offset=pos.offset+1;}',
  'else{self.line=self.history.nodeAfter(pos.node);self.offset=0;}}',
  'while(true){var match=this.matches();if(match){this.atOccurrence=match;saveAfter(match.from);return true;}',
  'this.line=this.history.nodeAfter(this.line);this.offset=0;if(!this.line){this.valid=false;return false;}}},select:function(){if(this.atOccurrence){select.setCursorPos(this.editor.container,this.atOccurrence.from,this.atOccurrence.to);select.scrollToCursor(this.editor.container);}},replace:function(string){if(this.atOccurrence){var end=this.editor.replaceRange(this.atOccurrence.from,this.atOccurrence.to,string);this.line=end.node;this.offset=end.offset;this.atOccurrence=false;}}};function Editor(options){this.options=options;window.indentUnit=options.indentUnit;this.parent=parent;this.doc=document;var container=this.container=this.doc.body;this.win=window;this.history=new UndoHistory(container,options.undoDepth,options.undoDelay,this);var self=this;if(!Editor.Parser)',
  'throw"No parser loaded.";if(options.parserConfig&&Editor.Parser.configure)',
  'Editor.Parser.configure(options.parserConfig);if(!options.readOnly)',
  'select.setCursorPos(container,{node:null,offset:0});this.dirty=[];this.importCode(options.content||"");this.history.onChange=options.onChange;if(!options.readOnly){if(options.continuousScanning!==false){this.scanner=this.documentScanner(options.passTime);this.delayScanning();}',
  'function setEditable(){if(document.body.contentEditable!=undefined&&internetExplorer)',
  'document.body.contentEditable="true";else',
  'document.designMode="on";document.documentElement.style.borderWidth="0";if(!options.textWrapping)',
  'container.style.whiteSpace="nowrap";}',
  'try{setEditable();}',
  'catch(e){var focusEvent=addEventHandler(document,"focus",function(){focusEvent();setEditable();},true);}',
  'addEventHandler(document,"keydown",method(this,"keyDown"));addEventHandler(document,"keypress",method(this,"keyPress"));addEventHandler(document,"keyup",method(this,"keyUp"));function cursorActivity(){self.cursorActivity(false);}',
  'addEventHandler(document.body,"mouseup",cursorActivity);addEventHandler(document.body,"cut",cursorActivity);if(gecko)',
  'addEventHandler(this.win,"pagehide",function(){self.unloaded=true;});addEventHandler(document.body,"paste",function(event){cursorActivity();var text=null;try{var clipboardData=event.clipboardData||window.clipboardData;if(clipboardData)text=clipboardData.getData(\'Text\');}',
  'catch(e){}',
  'if(text!==null){event.stop();self.replaceSelection(text);select.scrollToCursor(self.container);}});if(this.options.autoMatchParens)',
  'addEventHandler(document.body,"click",method(this,"scheduleParenHighlight"));}',
  'else if(!options.textWrapping){container.style.whiteSpace="nowrap";}}',
  'function isSafeKey(code){return(code>=16&&code<=18)||(code>=33&&code<=40);}',
  'Editor.prototype={importCode:function(code){this.history.push(null,null,asEditorLines(code));this.history.reset();},getCode:function(){if(!this.container.firstChild)',
  'return"";var accum=[];select.markSelection(this.win);forEach(traverseDOM(this.container.firstChild),method(accum,"push"));webkitLastLineHack(this.container);select.selectMarked();return cleanText(accum.join(""));},checkLine:function(node){if(node===false||!(node==null||node.parentNode==this.container))',
  'throw parent.CodeMirror.InvalidLineHandle;},cursorPosition:function(start){if(start==null)start=true;var pos=select.cursorPos(this.container,start);if(pos)return{line:pos.node,character:pos.offset};else return{line:null,character:0};},firstLine:function(){return null;},lastLine:function(){if(this.container.lastChild)return startOfLine(this.container.lastChild);else return null;},nextLine:function(line){this.checkLine(line);var end=endOfLine(line,this.container);return end||false;},prevLine:function(line){this.checkLine(line);if(line==null)return false;return startOfLine(line.previousSibling);},visibleLineCount:function(){var line=this.container.firstChild;while(line&&isBR(line))line=line.nextSibling;if(!line)return false;var innerHeight=(window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight);return Math.floor(innerHeight/line.offsetHeight);},selectLines:function(startLine,startOffset,endLine,endOffset){this.checkLine(startLine);var start={node:startLine,offset:startOffset},end=null;if(endOffset!==undefined){this.checkLine(endLine);end={node:endLine,offset:endOffset};}',
  'select.setCursorPos(this.container,start,end);select.scrollToCursor(this.container);},lineContent:function(line){var accum=[];for(line=line?line.nextSibling:this.container.firstChild;line&&!isBR(line);line=line.nextSibling)',
  'accum.push(nodeText(line));return cleanText(accum.join(""));},setLineContent:function(line,content){this.history.commit();this.replaceRange({node:line,offset:0},{node:line,offset:this.history.textAfter(line).length},content);this.addDirtyNode(line);this.scheduleHighlight();},removeLine:function(line){var node=line?line.nextSibling:this.container.firstChild;while(node){var next=node.nextSibling;removeElement(node);if(isBR(node))break;node=next;}',
  'this.addDirtyNode(line);this.scheduleHighlight();},insertIntoLine:function(line,position,content){var before=null;if(position=="end"){before=endOfLine(line,this.container);}',
  'else{for(var cur=line?line.nextSibling:this.container.firstChild;cur;cur=cur.nextSibling){if(position==0){before=cur;break;}',
  'var text=nodeText(cur);if(text.length>position){before=cur.nextSibling;content=text.slice(0,position)+content+text.slice(position);removeElement(cur);break;}',
  'position-=text.length;}}',
  'var lines=asEditorLines(content),doc=this.container.ownerDocument;for(var i=0;i<lines.length;i++){if(i>0)this.container.insertBefore(doc.createElement("BR"),before);this.container.insertBefore(makePartSpan(lines[i],doc),before);}',
  'this.addDirtyNode(line);this.scheduleHighlight();},selectedText:function(){var h=this.history;h.commit();var start=select.cursorPos(this.container,true),end=select.cursorPos(this.container,false);if(!start||!end)return"";if(start.node==end.node)',
  'return h.textAfter(start.node).slice(start.offset,end.offset);var text=[h.textAfter(start.node).slice(start.offset)];for(var pos=h.nodeAfter(start.node);pos!=end.node;pos=h.nodeAfter(pos))',
  'text.push(h.textAfter(pos));text.push(h.textAfter(end.node).slice(0,end.offset));return cleanText(text.join("\\n"));},replaceSelection:function(text){this.history.commit();var start=select.cursorPos(this.container,true),end=select.cursorPos(this.container,false);if(!start||!end)return;end=this.replaceRange(start,end,text);select.setCursorPos(this.container,end);webkitLastLineHack(this.container);},cursorCoords:function(start){var sel=select.cursorPos(this.container,start);if(!sel)return null;var off=sel.offset,node=sel.node,doc=this.win.document,self=this;function measureFromNode(node,xOffset){var y=-(self.win.document.body.scrollTop||self.win.document.documentElement.scrollTop||0),x=-(self.win.document.body.scrollLeft||self.win.document.documentElement.scrollLeft||0)+xOffset;forEach([node,self.win.frameElement],function(n){while(n){x+=n.offsetLeft;y+=n.offsetTop;n=n.offsetParent;}});return{x:x,y:y,yBot:y+node.offsetHeight};}',
  'function withTempNode(text,f){var node=doc.createElement("SPAN");node.appendChild(doc.createTextNode(text));try{return f(node);}',
  'finally{if(node.parentNode)node.parentNode.removeChild(node);}}',
  'while(off){node=node?node.nextSibling:this.container.firstChild;var txt=nodeText(node);if(off<txt.length)',
  'return withTempNode(txt.substr(0,off),function(tmp){tmp.style.position="absolute";tmp.style.display="hidden";tmp.className=node.className;self.container.appendChild(tmp);return measureFromNode(node,tmp.offsetWidth);});off-=txt.length;}',
  'if(node&&!isBR(node))',
  'return measureFromNode(node,node.offsetWidth);else if(node&&node.nextSibling&&!isBR(node.nextSibling))',
  'return measureFromNode(node.nextSibling,0);else',
  'return withTempNode("\\u200b",function(tmp){if(node)node.parentNode.insertBefore(tmp,node.nextSibling);else self.container.insertBefore(tmp,self.container.firstChild);return measureFromNode(tmp,0);});},reroutePasteEvent:function(){if(this.capturingPaste||window.opera)return;this.capturingPaste=true;var te=window.frameElement.CodeMirror.textareaHack;parent.focus();te.value="";te.focus();var self=this;this.parent.setTimeout(function(){self.capturingPaste=false;self.win.focus();if(self.selectionSnapshot)',
  'self.win.select.setBookmark(self.container,self.selectionSnapshot);var text=te.value;if(text){self.replaceSelection(text);select.scrollToCursor(self.container);}},10);},replaceRange:function(from,to,text){var lines=asEditorLines(text);lines[0]=this.history.textAfter(from.node).slice(0,from.offset)+lines[0];var lastLine=lines[lines.length-1];lines[lines.length-1]=lastLine+this.history.textAfter(to.node).slice(to.offset);var end=this.history.nodeAfter(to.node);this.history.push(from.node,end,lines);return{node:this.history.nodeBefore(end),offset:lastLine.length};},getSearchCursor:function(string,fromCursor,caseFold){return new SearchCursor(this,string,fromCursor,caseFold);},reindent:function(){if(this.container.firstChild)',
  'this.indentRegion(null,this.container.lastChild);},reindentSelection:function(direction){if(!select.somethingSelected(this.win)){this.indentAtCursor(direction);}',
  'else{var start=select.selectionTopNode(this.container,true),end=select.selectionTopNode(this.container,false);if(start===false||end===false)return;this.indentRegion(start,end,direction);}},grabKeys:function(eventHandler,filter){this.frozen=eventHandler;this.keyFilter=filter;},ungrabKeys:function(){this.frozen="leave";},setParser:function(name,parserConfig){Editor.Parser=window[name];parserConfig=parserConfig||this.options.parserConfig;if(parserConfig&&Editor.Parser.configure)',
  'Editor.Parser.configure(parserConfig);if(this.container.firstChild){forEach(this.container.childNodes,function(n){if(n.nodeType!=3)n.dirty=true;});this.addDirtyNode(this.firstChild);this.scheduleHighlight();}},keyDown:function(event){if(this.frozen=="leave"){this.frozen=null;this.keyFilter=null;}',
  'if(this.frozen&&(!this.keyFilter||this.keyFilter(event.keyCode,event))){event.stop();this.frozen(event);return;}',
  'var code=event.keyCode;this.delayScanning();if(this.options.autoMatchParens)',
  'this.scheduleParenHighlight();if(code==13){if(event.ctrlKey&&!event.altKey){this.reparseBuffer();}',
  'else{select.insertNewlineAtCursor(this.win);this.indentAtCursor();select.scrollToCursor(this.container);}',
  'event.stop();}',
  'else if(code==9&&this.options.tabMode!="default"&&!event.ctrlKey){this.handleTab(!event.shiftKey);event.stop();}',
  'else if(code==32&&event.shiftKey&&this.options.tabMode=="default"){this.handleTab(true);event.stop();}',
  'else if(code==36&&!event.shiftKey&&!event.ctrlKey){if(this.home())event.stop();}',
  'else if(code==35&&!event.shiftKey&&!event.ctrlKey){if(this.end())event.stop();}',
  'else if(code==33&&!event.shiftKey&&!event.ctrlKey&&!gecko){if(this.pageUp())event.stop();}',
  'else if(code==34&&!event.shiftKey&&!event.ctrlKey&&!gecko){if(this.pageDown())event.stop();}',
  'else if((code==219||code==221)&&event.ctrlKey&&!event.altKey){this.highlightParens(event.shiftKey,true);event.stop();}',
  'else if(event.metaKey&&!event.shiftKey&&(code==37||code==39)){var cursor=select.selectionTopNode(this.container);if(cursor===false||!this.container.firstChild)return;if(code==37)select.focusAfterNode(startOfLine(cursor),this.container);else{var end=endOfLine(cursor,this.container);select.focusAfterNode(end?end.previousSibling:this.container.lastChild,this.container);}',
  'event.stop();}',
  'else if((event.ctrlKey||event.metaKey)&&!event.altKey){if((event.shiftKey&&code==90)||code==89){select.scrollToNode(this.history.redo());event.stop();}',
  'else if(code==90||(safari&&code==8)){select.scrollToNode(this.history.undo());event.stop();}',
  'else if(code==83&&this.options.saveFunction){this.options.saveFunction();event.stop();}',
  'else if(internetExplorer&&code==86){this.reroutePasteEvent();}}},keyPress:function(event){var electric=Editor.Parser.electricChars,self=this;if((this.frozen&&(!this.keyFilter||this.keyFilter(event.keyCode||event.code,event)))||event.code==13||(event.code==9&&this.options.tabMode!="default")||(event.code==32&&event.shiftKey&&this.options.tabMode=="default"))',
  'event.stop();else if(electric&&electric.indexOf(event.character)!=-1)',
  'this.parent.setTimeout(function(){self.indentAtCursor(null);},0);else if((event.character=="v"||event.character=="V")&&(event.ctrlKey||event.metaKey)&&!event.altKey)',
  'this.reroutePasteEvent();},keyUp:function(event){this.cursorActivity(isSafeKey(event.keyCode));},indentLineAfter:function(start,direction){var whiteSpace=start?start.nextSibling:this.container.firstChild;if(whiteSpace&&!hasClass(whiteSpace,"whitespace"))',
  'whiteSpace=null;var firstText=whiteSpace?whiteSpace.nextSibling:(start?start.nextSibling:this.container.firstChild);var nextChars=(start&&firstText&&firstText.currentText)?firstText.currentText:"";var newIndent=0,curIndent=whiteSpace?whiteSpace.currentText.length:0;if(direction!=null&&this.options.tabMode=="shift")',
  'newIndent=direction?curIndent+indentUnit:Math.max(0,curIndent-indentUnit)',
  'else if(start)',
  'newIndent=start.indentation(nextChars,curIndent,direction);else if(Editor.Parser.firstIndentation)',
  'newIndent=Editor.Parser.firstIndentation(nextChars,curIndent,direction);var indentDiff=newIndent-curIndent;if(indentDiff<0){if(newIndent==0){if(firstText)select.snapshotMove(whiteSpace.firstChild,firstText.firstChild,0);removeElement(whiteSpace);whiteSpace=null;}',
  'else{select.snapshotMove(whiteSpace.firstChild,whiteSpace.firstChild,indentDiff,true);whiteSpace.currentText=makeWhiteSpace(newIndent);whiteSpace.firstChild.nodeValue=whiteSpace.currentText;}}',
  'else if(indentDiff>0){if(whiteSpace){whiteSpace.currentText=makeWhiteSpace(newIndent);whiteSpace.firstChild.nodeValue=whiteSpace.currentText;select.snapshotMove(whiteSpace.firstChild,whiteSpace.firstChild,indentDiff,true);}',
  'else{whiteSpace=makePartSpan(makeWhiteSpace(newIndent),this.doc);whiteSpace.className="whitespace";if(start)insertAfter(whiteSpace,start);else this.container.insertBefore(whiteSpace,this.container.firstChild);select.snapshotMove(firstText&&(firstText.firstChild||firstText),whiteSpace.firstChild,newIndent,false,true);}}',
  'if(indentDiff!=0)this.addDirtyNode(start);},highlightAtCursor:function(){var pos=select.selectionTopNode(this.container,true);var to=select.selectionTopNode(this.container,false);if(pos===false||to===false)return false;select.markSelection(this.win);if(this.highlight(pos,endOfLine(to,this.container),true,20)===false)',
  'return false;select.selectMarked();return true;},handleTab:function(direction){if(this.options.tabMode=="spaces")',
  'select.insertTabAtCursor(this.win);else',
  'this.reindentSelection(direction);},home:function(){var cur=select.selectionTopNode(this.container,true),start=cur;if(cur===false||!(!cur||cur.isPart||isBR(cur))||!this.container.firstChild)',
  'return false;while(cur&&!isBR(cur))cur=cur.previousSibling;var next=cur?cur.nextSibling:this.container.firstChild;if(next&&next!=start&&next.isPart&&hasClass(next,"whitespace"))',
  'select.focusAfterNode(next,this.container);else',
  'select.focusAfterNode(cur,this.container);select.scrollToCursor(this.container);return true;},end:function(){var cur=select.selectionTopNode(this.container,true);if(cur===false)return false;cur=endOfLine(cur,this.container);if(!cur)return false;select.focusAfterNode(cur.previousSibling,this.container);select.scrollToCursor(this.container);return true;},pageUp:function(){var line=this.cursorPosition().line,scrollAmount=this.visibleLineCount();if(line===false||scrollAmount===false)return false;scrollAmount-=2;for(var i=0;i<scrollAmount;i++){line=this.prevLine(line);if(line===false)break;}',
  'if(i==0)return false;select.setCursorPos(this.container,{node:line,offset:0});select.scrollToCursor(this.container);return true;},pageDown:function(){var line=this.cursorPosition().line,scrollAmount=this.visibleLineCount();if(line===false||scrollAmount===false)return false;scrollAmount-=2;for(var i=0;i<scrollAmount;i++){var nextLine=this.nextLine(line);if(nextLine===false)break;line=nextLine;}',
  'if(i==0)return false;select.setCursorPos(this.container,{node:line,offset:0});select.scrollToCursor(this.container);return true;},scheduleParenHighlight:function(){if(this.parenEvent)this.parent.clearTimeout(this.parenEvent);var self=this;this.parenEvent=this.parent.setTimeout(function(){self.highlightParens();},300);},highlightParens:function(jump,fromKey){var self=this;function highlight(node,ok){if(!node)return;if(self.options.markParen){self.options.markParen(node,ok);}',
  'else{node.style.fontWeight="bold";node.style.color=ok?"#8F8":"#F88";}}',
  'function unhighlight(node){if(!node)return;if(self.options.unmarkParen){self.options.unmarkParen(node);}',
  'else{node.style.fontWeight="";node.style.color="";}}',
  'if(!fromKey&&self.highlighted){unhighlight(self.highlighted[0]);unhighlight(self.highlighted[1]);}',
  'if(!window.select)return;if(this.parenEvent)this.parent.clearTimeout(this.parenEvent);this.parenEvent=null;function paren(node){if(node.currentText){var match=node.currentText.match(/^[\\s\\u00a0]*([\\(\\)\\[\\]{}])[\\s\\u00a0]*$/);return match&&match[1];}}',
  'function forward(ch){return/[\\(\\[\\{]/.test(ch);}',
  'var ch,cursor=select.selectionTopNode(this.container,true);if(!cursor||!this.highlightAtCursor())return;cursor=select.selectionTopNode(this.container,true);if(!(cursor&&((ch=paren(cursor))||(cursor=cursor.nextSibling)&&(ch=paren(cursor)))))',
  'return;var className=cursor.className,dir=forward(ch),match=matching[ch];function tryFindMatch(){var stack=[],ch,ok=true;for(var runner=cursor;runner;runner=dir?runner.nextSibling:runner.previousSibling){if(runner.className==className&&isSpan(runner)&&(ch=paren(runner))){if(forward(ch)==dir)',
  'stack.push(ch);else if(!stack.length)',
  'ok=false;else if(stack.pop()!=matching[ch])',
  'ok=false;if(!stack.length)break;}',
  'else if(runner.dirty||!isSpan(runner)&&!isBR(runner)){return{node:runner,status:"dirty"};}}',
  'return{node:runner,status:runner&&ok};}',
  'while(true){var found=tryFindMatch();if(found.status=="dirty"){this.highlight(found.node,endOfLine(found.node));found.node.dirty=false;continue;}',
  'else{highlight(cursor,found.status);highlight(found.node,found.status);if(fromKey)',
  'self.parent.setTimeout(function(){unhighlight(cursor);unhighlight(found.node);},500);else',
  'self.highlighted=[cursor,found.node];if(jump&&found.node)',
  'select.focusAfterNode(found.node.previousSibling,this.container);break;}}},indentAtCursor:function(direction){if(!this.container.firstChild)return;if(!this.highlightAtCursor())return;var cursor=select.selectionTopNode(this.container,false);if(cursor===false)',
  'return;select.markSelection(this.win);this.indentLineAfter(startOfLine(cursor),direction);select.selectMarked();},indentRegion:function(start,end,direction){var current=(start=startOfLine(start)),before=start&&startOfLine(start.previousSibling);if(!isBR(end))end=endOfLine(end,this.container);this.addDirtyNode(start);do{var next=endOfLine(current,this.container);if(current)this.highlight(before,next,true);this.indentLineAfter(current,direction);before=current;current=next;}while(current!=end);select.setCursorPos(this.container,{node:start,offset:0},{node:end,offset:0});},cursorActivity:function(safe){if(this.unloaded){this.win.document.designMode="off";this.win.document.designMode="on";this.unloaded=false;}',
  'if(internetExplorer){this.container.createTextRange().execCommand("unlink");this.selectionSnapshot=select.getBookmark(this.container);}',
  'if(this.options.highlightActiveLine){this.win.highlightActiveLine();}',
  'var activity=this.options.cursorActivity;if(!safe||activity){var cursor=select.selectionTopNode(this.container,false);if(cursor===false||!this.container.firstChild)return;cursor=cursor||this.container.firstChild;if(activity)activity(cursor);if(!safe){this.scheduleHighlight();this.addDirtyNode(cursor);}}},reparseBuffer:function(){forEach(this.container.childNodes,function(node){node.dirty=true;});if(this.container.firstChild)',
  'this.addDirtyNode(this.container.firstChild);},addDirtyNode:function(node){node=node||this.container.firstChild;if(!node)return;for(var i=0;i<this.dirty.length;i++)',
  'if(this.dirty[i]==node)return;if(node.nodeType!=3)',
  'node.dirty=true;this.dirty.push(node);},allClean:function(){return!this.dirty.length;},scheduleHighlight:function(){var self=this;this.parent.clearTimeout(this.highlightTimeout);this.highlightTimeout=this.parent.setTimeout(function(){self.highlightDirty();},this.options.passDelay);},getDirtyNode:function(){while(this.dirty.length>0){var found=this.dirty.pop();try{while(found&&found.parentNode!=this.container)',
  'found=found.parentNode;if(found&&(found.dirty||found.nodeType==3))',
  'return found;}catch(e){}}',
  'return null;},highlightDirty:function(force){if(!window.select)return false;if(!this.options.readOnly)select.markSelection(this.win);var start,endTime=force?null:time()+this.options.passTime;while((time()<endTime||force)&&(start=this.getDirtyNode())){var result=this.highlight(start,endTime);if(result&&result.node&&result.dirty)',
  'this.addDirtyNode(result.node);}',
  'if(!this.options.readOnly)select.selectMarked();if(start)this.scheduleHighlight();return this.dirty.length==0;},documentScanner:function(passTime){var self=this,pos=null;return function(){if(!window.select)return;if(pos&&pos.parentNode!=self.container)',
  'pos=null;select.markSelection(self.win);var result=self.highlight(pos,time()+passTime,true);select.selectMarked();var newPos=result?(result.node&&result.node.nextSibling):null;pos=(pos==newPos)?null:newPos;self.delayScanning();};},delayScanning:function(){if(this.scanner){this.parent.clearTimeout(this.documentScan);this.documentScan=this.parent.setTimeout(this.scanner,this.options.continuousScanning);}},highlight:function(from,target,cleanLines,maxBacktrack){var container=this.container,self=this,active=this.options.activeTokens;var endTime=(typeof target=="number"?target:null);if(!container.firstChild)',
  'return false;while(from&&(!from.parserFromHere||from.dirty)){if(maxBacktrack!=null&&isBR(from)&&(--maxBacktrack)<0)',
  'return false;from=from.previousSibling;}',
  'if(from&&!from.nextSibling)',
  'return false;function correctPart(token,part){return!part.reduced&&part.currentText==token.value&&part.className==token.style;}',
  'function shortenPart(part,minus){part.currentText=part.currentText.substring(minus);part.reduced=true;}',
  'function tokenPart(token){var part=makePartSpan(token.value,self.doc);part.className=token.style;return part;}',
  'function maybeTouch(node){if(node){var old=node.oldNextSibling;if(lineDirty||old===undefined||node.nextSibling!=old)',
  'self.history.touch(node);node.oldNextSibling=node.nextSibling;}',
  'else{var old=self.container.oldFirstChild;if(lineDirty||old===undefined||self.container.firstChild!=old)',
  'self.history.touch(null);self.container.oldFirstChild=self.container.firstChild;}}',
  'var traversal=traverseDOM(from?from.nextSibling:container.firstChild),stream=stringStream(traversal),parsed=from?from.parserFromHere(stream):Editor.Parser.make(stream);function surroundedByBRs(node){return(node.previousSibling==null||isBR(node.previousSibling))&&(node.nextSibling==null||isBR(node.nextSibling));}',
  'var parts={current:null,get:function(){if(!this.current)',
  'this.current=traversal.nodes.shift();return this.current;},next:function(){this.current=null;},remove:function(){container.removeChild(this.get());this.current=null;},getNonEmpty:function(){var part=this.get();while(part&&isSpan(part)&&part.currentText==""){if(window.opera&&surroundedByBRs(part)){this.next();part=this.get();}',
  'else{var old=part;this.remove();part=this.get();select.snapshotMove(old.firstChild,part&&(part.firstChild||part),0);}}',
  'return part;}};var lineDirty=false,prevLineDirty=true,lineNodes=0;forEach(parsed,function(token){var part=parts.getNonEmpty();if(token.value=="\\n"){if(!isBR(part))',
  'throw"Parser out of sync. Expected BR.";if(part.dirty||!part.indentation)lineDirty=true;maybeTouch(from);from=part;part.parserFromHere=parsed.copy();part.indentation=token.indentation;part.dirty=false;if(endTime==null&&part==target)throw StopIteration;if((endTime!=null&&time()>=endTime)||(!lineDirty&&!prevLineDirty&&lineNodes>1&&!cleanLines))',
  'throw StopIteration;prevLineDirty=lineDirty;lineDirty=false;lineNodes=0;parts.next();}',
  'else{if(!isSpan(part))',
  'throw"Parser out of sync. Expected SPAN.";if(part.dirty)',
  'lineDirty=true;lineNodes++;if(correctPart(token,part)){part.dirty=false;parts.next();}',
  'else{lineDirty=true;var newPart=tokenPart(token);container.insertBefore(newPart,part);if(active)active(newPart,token,self);var tokensize=token.value.length;var offset=0;while(tokensize>0){part=parts.get();var partsize=part.currentText.length;select.snapshotReplaceNode(part.firstChild,newPart.firstChild,tokensize,offset);if(partsize>tokensize){shortenPart(part,tokensize);tokensize=0;}',
  'else{tokensize-=partsize;offset+=partsize;parts.remove();}}}}});maybeTouch(from);webkitLastLineHack(this.container);return{node:parts.getNonEmpty(),dirty:lineDirty};}};return Editor;})();addEventHandler(window,"load",function(){var CodeMirror=window.frameElement.CodeMirror;var e=CodeMirror.editor=new Editor(CodeMirror.options);this.parent.setTimeout(method(CodeMirror,"init"),0);});;function tokenizer(source,state){function isWhiteSpace(ch){return ch!="\\n"&&/^[\\s\\u00a0]*$/.test(ch);}',
  'var tokenizer={state:state,take:function(type){if(typeof(type)=="string")',
  'type={style:type,type:type};type.content=(type.content||"")+source.get();if(!/\\n$/.test(type.content))',
  'source.nextWhile(isWhiteSpace);type.value=type.content+source.get();return type;},next:function(){if(!source.more())throw StopIteration;var type;if(source.equals("\\n")){source.next();return this.take("whitespace");}',
  'if(source.applies(isWhiteSpace))',
  'type="whitespace";else',
  'while(!type)',
  'type=this.state(source,function(s){tokenizer.state=s;});return this.take(type);}};return tokenizer;};var XMLParser=Editor.Parser=(function(){var Kludges={autoSelfClosers:{"br":true,"img":true,"hr":true,"link":true,"input":true,"meta":true,"col":true,"frame":true,"base":true,"area":true},doNotIndent:{"pre":true,"!cdata":true}};var NoKludges={autoSelfClosers:{},doNotIndent:{"!cdata":true}};var UseKludges=Kludges;var alignCDATA=false;var tokenizeXML=(function(){function inText(source,setState){var ch=source.next();if(ch=="<"){if(source.equals("!")){source.next();if(source.equals("[")){if(source.lookAhead("[CDATA[",true)){setState(inBlock("xml-cdata","]]>"));return null;}',
  'else{return"xml-text";}}',
  'else if(source.lookAhead("--",true)){setState(inBlock("xml-comment","-->"));return null;}',
  'else{return"xml-text";}}',
  'else if(source.equals("?")){source.next();source.nextWhileMatches(/[\\w\\._\\-]/);setState(inBlock("xml-processing","?>"));return"xml-processing";}',
  'else{if(source.equals("/"))source.next();setState(inTag);return"xml-punctuation";}}',
  'else if(ch=="&"){while(!source.endOfLine()){if(source.next()==";")',
  'break;}',
  'return"xml-entity";}',
  'else{source.nextWhileMatches(/[^&<\\n]/);return"xml-text";}}',
  'function inTag(source,setState){var ch=source.next();if(ch==">"){setState(inText);return"xml-punctuation";}',
  'else if(/[?\\/]/.test(ch)&&source.equals(">")){source.next();setState(inText);return"xml-punctuation";}',
  'else if(ch=="="){return"xml-punctuation";}',
  'else if(/[\\\'\\"]/.test(ch)){setState(inAttribute(ch));return null;}',
  'else{source.nextWhileMatches(/[^\\s\\u00a0=<>\\"\\\'\\/?]/);return"xml-name";}}',
  'function inAttribute(quote){return function(source,setState){while(!source.endOfLine()){if(source.next()==quote){setState(inTag);break;}}',
  'return"xml-attribute";};}',
  'function inBlock(style,terminator){return function(source,setState){while(!source.endOfLine()){if(source.lookAhead(terminator,true)){setState(inText);break;}',
  'source.next();}',
  'return style;};}',
  'return function(source,startState){return tokenizer(source,startState||inText);};})();function parseXML(source){var tokens=tokenizeXML(source),token;var cc=[base];var tokenNr=0,indented=0;var currentTag=null,context=null;var consume;function push(fs){for(var i=fs.length-1;i>=0;i--)',
  'cc.push(fs[i]);}',
  'function cont(){push(arguments);consume=true;}',
  'function pass(){push(arguments);consume=false;}',
  'function markErr(){token.style+=" xml-error";}',
  'function expect(text){return function(style,content){if(content==text)cont();else{markErr();cont(arguments.callee);}};}',
  'function pushContext(tagname,startOfLine){var noIndent=UseKludges.doNotIndent.hasOwnProperty(tagname)||(context&&context.noIndent);context={prev:context,name:tagname,indent:indented,startOfLine:startOfLine,noIndent:noIndent};}',
  'function popContext(){context=context.prev;}',
  'function computeIndentation(baseContext){return function(nextChars,current){var context=baseContext;if(context&&context.noIndent)',
  'return current;if(alignCDATA&&/<!\\[CDATA\\[/.test(nextChars))',
  'return 0;if(context&&/^<\\//.test(nextChars))',
  'context=context.prev;while(context&&!context.startOfLine)',
  'context=context.prev;if(context)',
  'return context.indent+indentUnit;else',
  'return 0;};}',
  'function base(){return pass(element,base);}',
  'var harmlessTokens={"xml-text":true,"xml-entity":true,"xml-comment":true,"xml-processing":true};function element(style,content){if(content=="<")cont(tagname,attributes,endtag(tokenNr==1));else if(content=="</")cont(closetagname,expect(">"));else if(style=="xml-cdata"){if(!context||context.name!="!cdata")pushContext("!cdata");if(/\\]\\]>$/.test(content))popContext();cont();}',
  'else if(harmlessTokens.hasOwnProperty(style))cont();else{markErr();cont();}}',
  'var legal_namespace_tags={acre:{doc:true,block:true,script:true}};function style_for_tagname(tagname){var style=\'xml-tagname\';var r=(tagname||\'\').split(\':\');if(r.length===2){var ns=r[0];var tag=r[1];if(legal_namespace_tags[ns]&&legal_namespace_tags[ns][tag]){style+=\'-\'+ns;}',
  'else{style+=\' xml-error\';}}',
  'return style;}',
  'function tagname(style,content){if(style=="xml-name"){currentTag=content.toLowerCase();token.style=style_for_tagname(currentTag);cont();}',
  'else{currentTag=null;pass();}}',
  'function closetagname(style,content){if(style=="xml-name"){token.style=style_for_tagname((context||{}).name);if(context&&content.toLowerCase()==context.name)popContext();else markErr();}',
  'cont();}',
  'function endtag(startOfLine){return function(style,content){if(content=="/>"||(content==">"&&UseKludges.autoSelfClosers.hasOwnProperty(currentTag)))cont();else if(content==">"){pushContext(currentTag,startOfLine);cont();}',
  'else{markErr();cont(arguments.callee);}};}',
  'function attributes(style){if(style=="xml-name"){token.style="xml-attname";cont(attribute,attributes);}',
  'else pass();}',
  'function attribute(style,content){if(content=="=")cont(value);else if(content==">"||content=="/>")pass(endtag);else pass();}',
  'function value(style){if(style=="xml-attribute")cont(value);else pass();}',
  'return{indentation:function(){return indented;},next:function(){token=tokens.next();if(token.style=="whitespace"&&tokenNr==0)',
  'indented=token.value.length;else',
  'tokenNr++;if(token.content=="\\n"){indented=tokenNr=0;token.indentation=computeIndentation(context);}',
  'if(token.style=="whitespace"||token.type=="xml-comment")',
  'return token;while(true){consume=false;cc.pop()(token.style,token.content);if(consume)return token;}},copy:function(){var _cc=cc.concat([]),_tokenState=tokens.state,_context=context;var parser=this;return function(input){cc=_cc.concat([]);tokenNr=indented=0;context=_context;tokens=tokenizeXML(input,_tokenState);return parser;};}};}',
  'return{make:parseXML,electricChars:"/",configure:function(config){if(config.useHTMLKludges!=null)',
  'UseKludges=config.useHTMLKludges?Kludges:NoKludges;if(config.alignCDATA)',
  'alignCDATA=config.alignCDATA;}};})();;var CSSParser=Editor.Parser=(function(){var tokenizeCSS=(function(){function normal(source,setState){var ch=source.next();if(ch=="@"){source.nextWhileMatches(/\\w/);return"css-at";}',
  'else if(ch=="/"&&source.equals("*")){setState(inCComment);return null;}',
  'else if(ch=="<"&&source.equals("!")){setState(inSGMLComment);return null;}',
  'else if(ch=="="){return"css-compare";}',
  'else if(source.equals("=")&&(ch=="~"||ch=="|")){source.next();return"css-compare";}',
  'else if(ch=="\\""||ch=="\'"){setState(inString(ch));return null;}',
  'else if(ch=="#"){source.nextWhileMatches(/\\w/);return"css-hash";}',
  'else if(ch=="!"){source.nextWhileMatches(/[ \\t]/);source.nextWhileMatches(/\\w/);return"css-important";}',
  'else if(/\\d/.test(ch)){source.nextWhileMatches(/[\\w.%]/);return"css-unit";}',
  'else if(/[,.+>*\\/]/.test(ch)){return"css-select-op";}',
  'else if(/[;{}:\\[\\]]/.test(ch)){return"css-punctuation";}',
  'else{source.nextWhileMatches(/[\\w\\\\\\-_]/);return"css-identifier";}}',
  'function inCComment(source,setState){var maybeEnd=false;while(!source.endOfLine()){var ch=source.next();if(maybeEnd&&ch=="/"){setState(normal);break;}',
  'maybeEnd=(ch=="*");}',
  'return"css-comment";}',
  'function inSGMLComment(source,setState){var dashes=0;while(!source.endOfLine()){var ch=source.next();if(dashes>=2&&ch==">"){setState(normal);break;}',
  'dashes=(ch=="-")?dashes+1:0;}',
  'return"css-comment";}',
  'function inString(quote){return function(source,setState){var escaped=false;while(!source.endOfLine()){var ch=source.next();if(ch==quote&&!escaped)',
  'break;escaped=!escaped&&ch=="\\\\";}',
  'if(!escaped)',
  'setState(normal);return"css-string";};}',
  'return function(source,startState){return tokenizer(source,startState||normal);};})();function indentCSS(inBraces,inRule,base){return function(nextChars){if(!inBraces||/^\\}/.test(nextChars))return base;else if(inRule)return base+indentUnit*2;else return base+indentUnit;};}',
  'function parseCSS(source,basecolumn){basecolumn=basecolumn||0;var tokens=tokenizeCSS(source);var inBraces=false,inRule=false;var iter={next:function(){var token=tokens.next(),style=token.style,content=token.content;if(style=="css-identifier"&&inRule)',
  'token.style="css-value";if(style=="css-hash")',
  'token.style=inRule?"css-colorcode":"css-identifier";if(content=="\\n")',
  'token.indentation=indentCSS(inBraces,inRule,basecolumn);if(content=="{")',
  'inBraces=true;else if(content=="}")',
  'inBraces=inRule=false;else if(inBraces&&content==";")',
  'inRule=false;else if(inBraces&&style!="css-comment"&&style!="whitespace")',
  'inRule=true;return token;},copy:function(){var _inBraces=inBraces,_inRule=inRule,_tokenState=tokens.state;return function(source){tokens=tokenizeCSS(source,_tokenState);inBraces=_inBraces;inRule=_inRule;return iter;};}};return iter;}',
  'return{make:parseCSS,electricChars:"}"};})();;var tokenizeJavaScript=(function(){function nextUntilUnescaped(source,end){var escaped=false;while(!source.endOfLine()){var next=source.next();if(next==end&&!escaped)',
  'return false;escaped=!escaped&&next=="\\\\";}',
  'return escaped;}',
  'var keywords=function(){function result(type,style){return{type:type,style:"js-"+style};}',
  'var keywordA=result("keyword a","keyword");var keywordB=result("keyword b","keyword");var keywordC=result("keyword c","keyword");var operator=result("operator","keyword");var atom=result("atom","atom");return{"if":keywordA,"while":keywordA,"with":keywordA,"else":keywordB,"do":keywordB,"try":keywordB,"finally":keywordB,"return":keywordC,"break":keywordC,"continue":keywordC,"new":keywordC,"delete":keywordC,"throw":keywordC,"in":operator,"typeof":operator,"instanceof":operator,"var":result("var","keyword"),"function":result("function","keyword"),"catch":result("catch","keyword"),"for":result("for","keyword"),"switch":result("switch","keyword"),"case":result("case","keyword"),"default":result("default","keyword"),"true":atom,"false":atom,"null":atom,"undefined":atom,"NaN":atom,"Infinity":atom};}();var isOperatorChar=/[+\\-*&%=<>!?|]/;var isHexDigit=/[0-9A-Fa-f]/;var isWordChar=/[\\w\\$_]/;function jsTokenState(inside,regexp){return function(source,setState){var newInside=inside;var type=jsToken(inside,regexp,source,function(c){newInside=c;});var newRegexp=type.type=="operator"||type.type=="keyword c"||type.type.match(/^[\\[{}\\(,;:]$/);if(newRegexp!=regexp||newInside!=inside)',
  'setState(jsTokenState(newInside,newRegexp));return type;};}',
  'function jsToken(inside,regexp,source,setInside){function readHexNumber(){source.next();source.nextWhileMatches(isHexDigit);return{type:"number",style:"js-atom"};}',
  'function readNumber(){source.nextWhileMatches(/[0-9]/);if(source.equals(".")){source.next();source.nextWhileMatches(/[0-9]/);}',
  'if(source.equals("e")||source.equals("E")){source.next();if(source.equals("-"))',
  'source.next();source.nextWhileMatches(/[0-9]/);}',
  'return{type:"number",style:"js-atom"};}',
  'function readWord(){source.nextWhileMatches(isWordChar);var word=source.get();var known=keywords.hasOwnProperty(word)&&keywords.propertyIsEnumerable(word)&&keywords[word];return known?{type:known.type,style:known.style,content:word}:{type:"variable",style:"js-variable",content:word};}',
  'function readRegexp(){nextUntilUnescaped(source,"/");source.nextWhileMatches(/[gi]/);return{type:"regexp",style:"js-string"};}',
  'function readMultilineComment(start){var newInside="/*";var maybeEnd=(start=="*");while(true){if(source.endOfLine())',
  'break;var next=source.next();if(next=="/"&&maybeEnd){newInside=null;break;}',
  'maybeEnd=(next=="*");}',
  'setInside(newInside);return{type:"comment",style:"js-comment"};}',
  'function readOperator(){source.nextWhileMatches(isOperatorChar);return{type:"operator",style:"js-operator"};}',
  'function readString(quote){var endBackSlash=nextUntilUnescaped(source,quote);setInside(endBackSlash?quote:null);return{type:"string",style:"js-string"};}',
  'if(inside=="\\""||inside=="\'")',
  'return readString(inside);var ch=source.next();if(inside=="/*")',
  'return readMultilineComment(ch);else if(ch=="\\""||ch=="\'")',
  'return readString(ch);else if(/[\\[\\]{}\\(\\),;\\:\\.]/.test(ch))',
  'return{type:ch,style:"js-punctuation"};else if(ch=="0"&&(source.equals("x")||source.equals("X")))',
  'return readHexNumber();else if(/[0-9]/.test(ch))',
  'return readNumber();else if(ch=="/"){if(source.equals("*"))',
  '{source.next();return readMultilineComment(ch);}',
  'else if(source.equals("/"))',
  '{nextUntilUnescaped(source,null);return{type:"comment",style:"js-comment"};}',
  'else if(regexp)',
  'return readRegexp();else',
  'return readOperator();}',
  'else if(isOperatorChar.test(ch))',
  'return readOperator();else',
  'return readWord();}',
  'return function(source,startState){return tokenizer(source,startState||jsTokenState(false,true));};})();;var JSParser=Editor.Parser=(function(){var atomicTypes={"atom":true,"number":true,"variable":true,"string":true,"regexp":true};var json=false;function JSLexical(indented,column,type,align,prev,info){this.indented=indented;this.column=column;this.type=type;if(align!=null)',
  'this.align=align;this.prev=prev;this.info=info;}',
  'function indentJS(lexical){return function(firstChars){var firstChar=firstChars&&firstChars.charAt(0),type=lexical.type;var closing=firstChar==type;if(type=="vardef")',
  'return lexical.indented+4;else if(type=="form"&&firstChar=="{")',
  'return lexical.indented;else if(type=="stat"||type=="form")',
  'return lexical.indented+indentUnit;else if(lexical.info=="switch"&&!closing)',
  'return lexical.indented+(/^(?:case|default)\\b/.test(firstChars)?indentUnit:2*indentUnit);else if(lexical.align)',
  'return lexical.column-(closing?1:0);else',
  'return lexical.indented+(closing?0:indentUnit);};}',
  'function parseJS(input,basecolumn){var tokens=tokenizeJavaScript(input);var cc=[json?singleExpr:statements];var context=null;var lexical=new JSLexical((basecolumn||0)-indentUnit,0,"block",false);var column=0;var indented=0;var consume,marked;var parser={next:next,copy:copy};function next(){while(cc[cc.length-1].lex)',
  'cc.pop()();var token=tokens.next();if(token.type=="whitespace"&&column==0)',
  'indented=token.value.length;column+=token.value.length;if(token.content=="\\n"){indented=column=0;if(!("align"in lexical))',
  'lexical.align=false;token.indentation=indentJS(lexical);}',
  'if(token.type=="whitespace"||token.type=="comment")',
  'return token;if(!("align"in lexical))',
  'lexical.align=true;while(true){consume=marked=false;cc.pop()(token.type,token.content);if(consume){if(marked)',
  'token.style=marked;else if(token.type=="variable"&&inScope(token.content))',
  'token.style="js-localvariable";return token;}}}',
  'function copy(){var _context=context,_lexical=lexical,_cc=cc.concat([]),_tokenState=tokens.state;return function copyParser(input){context=_context;lexical=_lexical;cc=_cc.concat([]);column=indented=0;tokens=tokenizeJavaScript(input,_tokenState);return parser;};}',
  'function push(fs){for(var i=fs.length-1;i>=0;i--)',
  'cc.push(fs[i]);}',
  'function cont(){push(arguments);consume=true;}',
  'function pass(){push(arguments);consume=false;}',
  'function mark(style){marked=style;}',
  'function pushcontext(){context={prev:context,vars:{"this":true,"arguments":true}};}',
  'function popcontext(){context=context.prev;}',
  'function register(varname){if(context){mark("js-variabledef");context.vars[varname]=true;}}',
  'function inScope(varname){var cursor=context;while(cursor){if(cursor.vars[varname])',
  'return true;cursor=cursor.prev;}',
  'return false;}',
  'function pushlex(type,info){var result=function(){lexical=new JSLexical(indented,column,type,null,lexical,info)};result.lex=true;return result;}',
  'function poplex(){lexical=lexical.prev;}',
  'poplex.lex=true;function expect(wanted){return function expecting(type){if(type==wanted)cont();else cont(arguments.callee);};}',
  'function statements(type){return pass(statement,statements);}',
  'function singleExpr(type){return pass(expression,statements);}',
  'function statement(type){if(type=="var")cont(pushlex("vardef"),vardef1,expect(";"),poplex);else if(type=="keyword a")cont(pushlex("form"),expression,statement,poplex);else if(type=="keyword b")cont(pushlex("form"),statement,poplex);else if(type=="{")cont(pushlex("}"),block,poplex);else if(type=="function")cont(functiondef);else if(type=="for")cont(pushlex("form"),expect("("),pushlex(")"),forspec1,expect(")"),poplex,statement,poplex);else if(type=="variable")cont(pushlex("stat"),maybelabel);else if(type=="switch")cont(pushlex("form"),expression,pushlex("}","switch"),expect("{"),block,poplex,poplex);else if(type=="case")cont(expression,expect(":"));else if(type=="default")cont(expect(":"));else if(type=="catch")cont(pushlex("form"),pushcontext,expect("("),funarg,expect(")"),statement,poplex,popcontext);else pass(pushlex("stat"),expression,expect(";"),poplex);}',
  'function expression(type){if(atomicTypes.hasOwnProperty(type))cont(maybeoperator);else if(type=="function")cont(functiondef);else if(type=="keyword c")cont(expression);else if(type=="(")cont(pushlex(")"),expression,expect(")"),poplex,maybeoperator);else if(type=="operator")cont(expression);else if(type=="[")cont(pushlex("]"),commasep(expression,"]"),poplex,maybeoperator);else if(type=="{")cont(pushlex("}"),commasep(objprop,"}"),poplex,maybeoperator);}',
  'function maybeoperator(type){if(type=="operator")cont(expression);else if(type=="(")cont(pushlex(")"),expression,commasep(expression,")"),poplex,maybeoperator);else if(type==".")cont(property,maybeoperator);else if(type=="[")cont(pushlex("]"),expression,expect("]"),poplex,maybeoperator);}',
  'function maybelabel(type){if(type==":")cont(poplex,statement);else pass(maybeoperator,expect(";"),poplex);}',
  'function property(type){if(type=="variable"){mark("js-property");cont();}}',
  'function objprop(type){if(type=="variable")mark("js-property");if(atomicTypes.hasOwnProperty(type))cont(expect(":"),expression);}',
  'function commasep(what,end){function proceed(type){if(type==",")cont(what,proceed);else if(type==end)cont();else cont(expect(end));}',
  'return function commaSeparated(type){if(type==end)cont();else pass(what,proceed);};}',
  'function block(type){if(type=="}")cont();else pass(statement,block);}',
  'function vardef1(type,value){if(type=="variable"){register(value);cont(vardef2);}',
  'else cont();}',
  'function vardef2(type,value){if(value=="=")cont(expression,vardef2);else if(type==",")cont(vardef1);}',
  'function forspec1(type){if(type=="var")cont(vardef1,forspec2);else if(type==";")pass(forspec2);else if(type=="variable")cont(formaybein);else pass(forspec2);}',
  'function formaybein(type,value){if(value=="in")cont(expression);else cont(maybeoperator,forspec2);}',
  'function forspec2(type,value){if(type==";")cont(forspec3);else if(value=="in")cont(expression);else cont(expression,expect(";"),forspec3);}',
  'function forspec3(type){if(type==")")pass();else cont(expression);}',
  'function functiondef(type,value){if(type=="variable"){register(value);cont(functiondef);}',
  'else if(type=="(")cont(pushcontext,commasep(funarg,")"),statement,popcontext);}',
  'function funarg(type,value){if(type=="variable"){register(value);cont();}}',
  'return parser;}',
  'return{make:parseJS,electricChars:"{}:",configure:function(obj){if(obj.json!=null)json=obj.json;}};})();;var HTMLMixedParser=Editor.Parser=(function(){if(!(CSSParser&&JSParser&&XMLParser))',
  'throw new Error("CSS, JS, and XML parsers must be loaded for HTML mixed mode to work.");XMLParser.configure({useHTMLKludges:true});function parseMixed(stream){var htmlParser=XMLParser.make(stream),localParser=null,inTag=false;var iter={next:top,copy:copy};function top(){var token=htmlParser.next();if(token.content=="<")',
  'inTag=true;else if((token.style.indexOf("xml-tagname")==0)&&inTag===true)',
  'inTag=token.content.toLowerCase();else if(token.content==">"){if(inTag=="script")',
  'iter.next=local(JSParser,"</script");else if(inTag=="acre:script")',
  'iter.next=local(JSParser,"</acre:script");else if(inTag=="style")',
  'iter.next=local(CSSParser,"</style");inTag=false;}',
  'return token;}',
  'function local(parser,tag){var baseIndent=htmlParser.indentation();localParser=parser.make(stream,baseIndent+indentUnit);return function(){if(stream.lookAhead(tag,false,false,true)){localParser=null;iter.next=top;return top();}',
  'var token=localParser.next();var lt=token.value.lastIndexOf("<"),sz=Math.min(token.value.length-lt,tag.length);if(lt!=-1&&token.value.slice(lt,lt+sz).toLowerCase()==tag.slice(0,sz)&&stream.lookAhead(tag.slice(sz),false,false,true)){stream.push(token.value.slice(lt));token.value=token.value.slice(0,lt);}',
  'if(token.indentation){var oldIndent=token.indentation;token.indentation=function(chars){if(chars=="</")',
  'return baseIndent;else',
  'return oldIndent(chars);}}',
  'return token;};}',
  'function copy(){var _html=htmlParser.copy(),_local=localParser&&localParser.copy(),_next=iter.next,_inTag=inTag;return function(_stream){stream=_stream;htmlParser=_html(_stream);localParser=_local&&_local(_stream);iter.next=_next;inTag=_inTag;return iter;};}',
  'return iter;}',
  'return{make:parseMixed,electricChars:"{}/:"};})();;var DummyParser=Editor.Parser=(function(){function tokenizeDummy(source){while(!source.endOfLine())source.next();return"text";}',
  'function parseDummy(source){function indentTo(n){return function(){return n;}}',
  'source=tokenizer(source,tokenizeDummy);var space=0;var iter={next:function(){var tok=source.next();if(tok.type=="whitespace"){if(tok.value=="\\n")tok.indentation=indentTo(space);else space=tok.value.length;}',
  'return tok;},copy:function(){var _space=space;return function(_source){space=_space;source=tokenizer(_source,tokenizeDummy);return iter;};}};return iter;}',
  'return{make:parseDummy};})();',  ''
].join("\n");
CodeMirrorConfig.INLINE_CSS = 
[
  '.editbox{margin:.4em;padding:0;font-family:monospace;color:black;}',
  '.editbox p{margin:0;}',
  'span.xml-tagname{color:#90c;}',
  'span.xml-attribute{color:#396;}',
  'span.xml-punctuation{color:#777;}',
  'span.xml-attname{color:#06c;}',
  'span.xml-comment{color:#888;}',
  'span.xml-cdata{color:#000;}',
  'span.xml-processing{color:#999;}',
  'span.xml-entity{color:#c33;}',
  'span.xml-error{color:#F00;}',
  'span.xml-text{color:black;}',
  'span.xml-tagname-acre{color:#f60;}',
  '.editbox{margin:.4em;padding:0;font-family:monospace;color:black;}',
  'pre.code,.editbox{color:#666666;}',
  '.editbox p{margin:0;}',
  'span.js-punctuation{color:#777;}',
  'span.js-operator{color:#000;}',
  'span.js-keyword{color:#630;}',
  'span.js-atom{color:#90c;}',
  'span.js-variable{color:#06c;}',
  'span.js-variabledef{color:#09f;}',
  'span.js-localvariable{color:#06c;}',
  'span.js-string{color:#396;}',
  'span.js-property{color:#996;}',
  'span.js-comment{color:#888;}',
  '.editbox{margin:.4em;padding:0;font-family:monospace;font-size:13px;color:black;}',
  'pre.code,.editbox{color:#777;}',
  '.editbox p{margin:0;}',
  'span.css-at{color:#663;}',
  'span.css-unit{color:#c63;}',
  'span.css-value{color:#996;}',
  'span.css-identifier{color:#000;}',
  'span.css-important{color:#f00;}',
  'span.css-colorcode{color:#099;}',
  'span.css-comment{color:#888;}',
  'span.css-string{color:#c33;}',
  ''
].join("\n");