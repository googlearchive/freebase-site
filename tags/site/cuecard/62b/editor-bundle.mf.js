
/** codemirror, codemirror.mf.js **/

/** codemirror.js **/
/* CodeMirror main module (http://codemirror.net/)
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
    minHeight: 100,
    autoMatchParens: false,
    parserConfig: null,
    tabMode: "indent", // or "spaces", "default", "shift"
    enterMode: "indent", // or "keep", "flat"
    electricChars: true,
    reindentOnLoad: false,
    activeTokens: null,
    cursorActivity: null,
    lineNumbers: false,
    firstLineNumber: 1,
    indentUnit: 2,
    domain: null,
    noScriptCaching: false
  });

  function addLineNumberDiv(container, firstNum) {
    var nums = document.createElement("DIV"),
        scroller = document.createElement("DIV");
    nums.style.position = "absolute";
    nums.style.height = "100%";
    if (nums.style.setExpression) {
      try {nums.style.setExpression("height", "this.previousSibling.offsetHeight + 'px'");}
      catch(e) {} // Seems to throw 'Not Implemented' on some IE8 versions
    }
    nums.style.top = "0px";
    nums.style.left = "0px";
    nums.style.overflow = "hidden";
    container.appendChild(nums);
    scroller.className = "CodeMirror-line-numbers";
    nums.appendChild(scroller);
    scroller.innerHTML = "<div>" + firstNum + "</div>";
    return nums;
  }

  function frameHTML(options) {
    if (typeof options.parserfile == "string")
      options.parserfile = [options.parserfile];
    if (typeof options.basefiles == "string")
      options.basefiles = [options.basefiles];
    if (typeof options.stylesheet == "string")
      options.stylesheet = [options.stylesheet];

    var html = ["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\"><html><head>"];
    // Hack to work around a bunch of IE8-specific problems.
    html.push("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=EmulateIE7\"/>");
    forEach(options.stylesheet, function(file) {
      html.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + file + "\"/>");
    });
    forEach(options.basefiles.concat(options.parserfile), function(file) {
      if (!/^https?:/.test(file)) file = options.path + file;
      html.push("<script type=\"text/javascript\" src=\"" + file + (options.noScriptCaching ? "?nocache=" + new Date().getTime().toString(16) : "") + "\"><" + "/script>");
    });
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
    div.style.height = (options.height == "dynamic") ? options.minHeight + "px" : options.height;
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
      frame.src = "javascript:;";
    }

    if (place.appendChild) place.appendChild(div);
    else place(div);
    div.appendChild(frame);
    if (options.lineNumbers) this.lineNumbers = addLineNumberDiv(div, options.firstLineNumber);

    this.win = frame.contentWindow;
    if (!options.domain || !internetExplorer) {
      this.win.document.open();
      this.win.document.write(frameHTML(options));
      this.win.document.close();
    }
  }

  CodeMirror.prototype = {
    init: function() {
      if (this.options.initCallback) this.options.initCallback(this);
      if (this.options.lineNumbers) this.activateLineNumbers();
      if (this.options.reindentOnLoad) this.reindent();
      if (this.options.height == "dynamic") this.setDynamicHeight();
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
    setEnterMode: function(mode) {this.options.enterMode = mode;},
    setLineNumbers: function(on) {
      if (on && !this.lineNumbers) {
        this.lineNumbers = addLineNumberDiv(this.wrapping,this.options.firstLineNumber);
        this.activateLineNumbers();
      }
      else if (!on && this.lineNumbers) {
        this.wrapping.removeChild(this.lineNumbers);
        this.wrapping.style.paddingLeft = "";
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
        for (var root = frame; root.parentNode; root = root.parentNode){}
        if (!nums.parentNode || root != document || !win.Editor) {
          // Clear event handlers (their nodes might already be collected, so try/catch)
          try{clear();}catch(e){}
          clearInterval(sizeInterval);
          return;
        }

        if (nums.offsetWidth != barWidth) {
          barWidth = nums.offsetWidth;
          frame.parentNode.style.paddingLeft = barWidth + "px";
        }
      }
      function doScroll() {
        nums.scrollTop = body.scrollTop || doc.documentElement.scrollTop || 0;
      }
      // Cleanup function, registered by nonWrapping and wrapping.
      var clear = function(){};
      sizeBar();
      var sizeInterval = setInterval(sizeBar, 500);

      function ensureEnoughLineNumbers(fill) {
        var lineHeight = scroller.firstChild.offsetHeight;
        if (lineHeight == 0) return;
        var targetHeight = 50 + Math.max(body.offsetHeight, Math.max(frame.offsetHeight, body.scrollHeight || 0)),
            lastNumber = Math.ceil(targetHeight / lineHeight);
        for (var i = scroller.childNodes.length; i <= lastNumber; i++) {
          var div = document.createElement("DIV");
          div.appendChild(document.createTextNode(fill ? String(i + self.options.firstLineNumber) : "\u00a0"));
          scroller.appendChild(div);
        }
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
        var node, lineNum, next, pos, changes = [], styleNums = self.options.styleNumbers;

        function setNum(n, node) {
          // Does not typically happen (but can, if you mess with the
          // document during the numbering)
          if (!lineNum) lineNum = scroller.appendChild(document.createElement("DIV"));
          if (styleNums) styleNums(lineNum, node, n);
          // Changes are accumulated, so that the document layout
          // doesn't have to be recomputed during the pass
          changes.push(lineNum); changes.push(n);
          pos = lineNum.offsetHeight + lineNum.offsetTop;
          lineNum = lineNum.nextSibling;
        }
        function commitChanges() {
          for (var i = 0; i < changes.length; i += 2)
            changes[i].innerHTML = changes[i + 1];
          changes = [];
        }
        function work() {
          if (!scroller.parentNode || scroller.parentNode != self.lineNumbers) return;

          var endTime = new Date().getTime() + self.options.lineNumberTime;
          while (node) {
            setNum(next++, node.previousSibling);
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
          while (lineNum) setNum(next++);
          commitChanges();
          doScroll();
        }
        function start(firstTime) {
          doScroll();
          ensureEnoughLineNumbers(firstTime);
          node = body.firstChild;
          lineNum = scroller.firstChild;
          pos = 0;
          next = self.options.firstLineNumber;
          work();
        }

        start(true);
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
      (this.options.textWrapping || this.options.styleNumbers ? wrapping : nonWrapping)();
    },

    setDynamicHeight: function() {
      var self = this, activity = self.options.cursorActivity, win = self.win, body = win.document.body,
          lineHeight = null, timeout = null, vmargin = 2 * self.frame.offsetTop;
      body.style.overflowY = "hidden";
      win.document.documentElement.style.overflowY = "hidden";
      this.frame.scrolling = "no";

      function updateHeight() {
        var trailingLines = 0, node = body.lastChild, computedHeight;
        while (node && win.isBR(node)) {
          if (!node.hackBR) trailingLines++;
          node = node.previousSibling;
        }
        if (node) {
          lineHeight = node.offsetHeight;
          computedHeight = node.offsetTop + (1 + trailingLines) * lineHeight;
        }
        else if (lineHeight) {
          computedHeight = trailingLines * lineHeight;
        }
        if (computedHeight)
          self.wrapping.style.height = Math.max(vmargin + computedHeight, self.options.minHeight) + "px";
      }
      setTimeout(updateHeight, 300);
      self.options.cursorActivity = function(x) {
        if (activity) activity(x);
        clearTimeout(timeout);
        timeout = setTimeout(updateHeight, 100);
      };
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
    mirror.toTextArea = function() {
      updateField();
      area.parentNode.removeChild(mirror.wrapping);
      area.style.display = "";
      if (area.form) {
        area.form.submit = realSubmit;
        if (typeof area.form.removeEventListener == "function")
          area.form.removeEventListener("submit", updateField, false);
        else
          area.form.detachEvent("onsubmit", updateField);
      }
    };

    return mirror;
  };

  CodeMirror.isProbablySupported = function() {
    // This is rather awful, but can be useful.
    var match;
    if (window.opera)
      return Number(window.opera.version()) >= 9.52;
    else if (/Apple Computer, Inc/.test(navigator.vendor) && (match = navigator.userAgent.match(/Version\/(\d+(?:\.\d+)?)\./)))
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

/** cuecard.mf.js **/

/** mjt, mjt.mf.js **/

/** Error: Could not fetch data from //62b.mjt.site.tags.svn.freebase-site.googlecode.dev/mjt.mf.js **/

/** jquerytools, overlay.js **/

/** Error: Could not fetch data from //62b.jquerytools.site.tags.svn.freebase-site.googlecode.dev/overlay.js **/

/** cuecard-api.js **/
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

if (!("CueCard" in window)) {
    (function() {

        var acreAppUrl = "http://www.freebase.com/cuecard/";
        
        window.CueCard = {
            loaded:                 false,
            version:                "trunk",
            loadingScriptsCount:    0,
            error:                  null,
            helper: acreAppUrl,
            apiProxy: {
                base : acreAppUrl,
                read:  "mqlread?",
                write: "mqlwrite?"
            },
            freebaseServiceUrl:     "http://www.freebase.com/",
            params:                 { bundle: true, externals: true }
        };
        
        var getHead = function(doc) {
            return doc.getElementsByTagName("head")[0];
        };
        CueCard.findScript = function(doc, substring) {
            var heads = doc.documentElement.getElementsByTagName("head");
            for (var h = 0; h < heads.length; h++) {
                var node = heads[h].firstChild;
                while (node != null) {
                    if (node.nodeType == 1 && node.tagName.toLowerCase() == "script") {
                        var url = node.src;
                        var i = url.indexOf(substring);
                        if (i >= 0) {
                            return url;
                        }
                    }
                    node = node.nextSibling;
                }
            }
            return null;
        };
        CueCard.parseURLParameters = function(url, to, types) {
            to = to || {};
            types = types || {};
            
            if (typeof url == "undefined") {
                url = location.href;
            }
            var q = url.indexOf("?");
            if (q < 0) {
                return to;
            }
            url = (url+"#").slice(q+1, url.indexOf("#")); // toss the URL fragment
            
            var params = url.split("&"), param, parsed = {};
            var decode = window.decodeURIComponent || unescape;
            for (var i = 0; param = params[i]; i++) {
                var eq = param.indexOf("=");
                var name = decode(param.slice(0,eq).replace(/\+/g, ' '));
                var old = parsed[name];
                if (typeof old == "undefined") {
                    old = [];
                } else if (!(old instanceof Array)) {
                    old = [old];
                }
                parsed[name] = old.concat(decode(param.slice(eq+1).replace(/\+/g, ' ')));
            }
            for (var i in parsed) {
                if (!parsed.hasOwnProperty(i)) continue;
                var type = types[i] || String;
                var data = parsed[i];
                if (!(data instanceof Array)) {
                    data = [data];
                }
                if (type === Boolean && data[0] == "false") {
                    to[i] = false; // because Boolean("false") === true
                } else {
                    to[i] = type.apply(this, data);
                }
            }
            return to;
        };
        
        if (typeof CueCard_urlPrefix == "string") {
            CueCard.urlPrefix = CueCard_urlPrefix;
        } else {
            var url = CueCard.findScript(document, "cuecard-api.js");
            if (url == null) {
                CueCard.error = new Error("Failed to derive URL prefix for CueCard API code files");
                return;
            }

            CueCard.urlPrefix = url.substr(0, url.indexOf("cuecard-api.js"));
        }

        CueCard.parseURLParameters(url, CueCard.params, {bundle:Boolean, externals:Boolean});
        
        CueCard.loaded = true;
    })();
}
/** cuecard.js **/
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

CueCard.createComposition = function(options) {
    var qe = new CueCard.QueryEditor(options.queryEditorElement, options["queryEditorOptions"]);
    var op = null;
    var cp = null;
    if ("outputPaneElement" in options) {
        var opo = options["outputPaneOptions"] || {};
        opo.queryEditor = qe;
        
        op = new CueCard.OutputPane(options.outputPaneElement, opo);
        qe.setOutputPane(op);
    }
    if ("controlPaneElement" in options) {
        var cpo = options["controlPaneOptions"] || {};
        cpo.queryEditor = qe;
        if (op != null) {
            cpo.outputPane = op;
        }
        
        cp = new CueCard.ControlPane(options.controlPaneElement, cpo);
        qe.setControlPane(cp);
    }
    
    return {
        queryEditor: qe,
        outputPane: op,
        controlPane: cp
    };
};

CueCard.showDialog           = function(dialogname /*, arg1, arg2, etc. */) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();

    var dialog = $("<div id='dialog-" + dialogname + "' class='modal'></div>").acre(fb.acre.apps.cuecard + "/dialogs", dialogname, args);   
    $(document.body).append(dialog.hide());

    dialog.overlay({
        load: true,
        mask: {
            color: '#000',
            loadSpeed: 200,
            opacity: 0.5
        },
        close: ".modal-buttons .button",
        closeOnClick: false,
        onClose: function() {
            dialog.remove();
        }
    });
};
/** mql-syntax.js **/
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

CueCard.MqlSyntax = {};

CueCard.MqlSyntax.KeywordSuggestions = [
    {   label: "*",
        hint: "(keyword)",
        qualifiedProperty: "*",
        result: "*"
    },
    {   label: "connect",
        hint: "(keyword)",
        qualifiedProperty: "connect",
        result: "connect"
    },
    {   label: "create",
        hint: "(keyword)",
        qualifiedProperty: "create",
        result: "create"
    },
    {   label: "estimate-count",
        hint: "(keyword)",
        qualifiedProperty: "estimate-count",
        result: "estimate-count"
    },
    {   label: "limit",
        hint: "(keyword)",
        qualifiedProperty: "limit",
        result: "limit"
    },
    {   label: "optional",
        hint: "(keyword)",
        qualifiedProperty: "optional",
        result: "optional"
    },
    {   label: "return",
        hint: "(keyword)",
        qualifiedProperty: "return",
        result: "return"
    },
    {   label: "sort",
        hint: "(keyword)",
        qualifiedProperty: "sort",
        result: "sort"
    }
];

CueCard.MqlSyntax.KeywordValueHints = {
    "*" : {
        choices: [
            {   label: "null",
                hint: "return a single value",
                result: null
            },
            {   label: "[]",
                hint: "return a list of values",
                result: [],
                offset: 1
            },
            {   label: "{}",
                hint: "return a single object",
                result: {},
                offset: 1
            },
            {   label: "[{}]",
                hint: "return a list of objects",
                result: [{}],
                offset: 2
            }
        ]
    },
    "connect" : {
        choices: [
            {   label:  "insert",
                hint:   "attach a value or object to a non-unique property, or attach the first value or object to a unique property",
                result: "insert"
            },
            {   label:  "update",
                hint:   "attach a value or object to a unique property replacing any value or object that was previously connected",
                result: "update"
            },
            {   label:  "replace",
                hint:   "update unique properties and performs an insert for non-unique properties",
                result: "replace"
            },
            {   label:  "delete",
                hint:   "detach a value or object from any property",
                result: "delete"
            }
        ]
    },
    "create" : {
        choices: [
            {   label: "unless_exists",
                hint: "look for a matching object and create it if it doesn't exist",
                result: "unless_exists"
            },
            {   label:  "unless_connected",
                hint:   "look for a matching object connected to the parent query, and create and connect it if it doesn't exist",
                result: "unless_connected"
            },
            {   label:  "unconditional",
                hint:   "create the specified object without looking for a match (dangerous; ues carefully)",
                result: "unconditional"
            }
        ]
    },
    "estimate-count" : {
        choices: [
            {   label: "null",
                hint: "(keyword)",
                result: null
            }
        ]
    },
    "limit" : {
        html: 'Use a positive integer to limit how many results to return, or <span class="cuecard-code">0</span> for all available results.'
    },
    "optional" : {
        choices: [
            {   label: "true",
                hint: "(keyword)",
                result: true
            },
            {   label: "false",
                hint: "(keyword)",
                result: false
            },
            {   label: "required",
                hint: "(keyword)",
                result: "required"
            },
            {   label: "forbidden",
                hint: "(keyword)",
                result: "forbidden"
            }
        ]
    },
    "return" : {
        choices: [
            {   label: "count",
                hint: "(keyword)",
                result: "count"
            },
            {   label: "estimate-count",
                hint: "(keyword)",
                result: "estimate-count"
            }
        ]
    },
    "sort" : {
        html: 'Use a property name in the same query node. Prefix it with <span class="cuecard-code">-</span> to sort in descending order. For more complex ordering, see <a href="">this documentation</a>.'
    }
};

CueCard.MqlSyntax.UniqueTopicValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single topic ID",
        result: null
    },
    {   label: "{}",
        hint: "returns a single topic object with a default set of properties",
        result: {},
        offset: 1
    },
    {   label: "{ \"id\" : null, \"name\" : null }",
        hint: "returns a single topic object with id and name",
        result: { "id" : null, "name" : null }
    }
];

CueCard.MqlSyntax.TopicValueSuggestions = [
    {   label: "[]",
        hint: "returns a list of topic IDs or topic names",
        result: [],
        offset: 1
    },
    {   label: "[{}]",
        hint: "returns a list of topic objects with a default set of properties",
        result: [{}],
        offset: 2
    },
    {   label: "[{ \"id\" : null, \"name\" : null, \"optional\" : true, \"limit\" : 10 }]",
        hint: "returns an optional, limited list of topic objects with id and name",
        result: [{ "id" : null, "name" : null, "optional" : true, "limit" : 10 }]
    }
];

CueCard.MqlSyntax.SingleValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single value",
        result: null
    },
    {   label: "{ \"value\" : null, \"type\" : null }",
        hint: "returns a value with type",
        result: { "value" : null, "type" : null }
    }
];

CueCard.MqlSyntax.UniqueStringLiteralValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single string",
        result: null
    },
    {   label:  "{ \"value\" : null, \"lang\" : null, \"optional\" : true }",
        hint:   "returns a single string with more options",
        result: { "value" : null, "lang" : null, "optional" : true }
    }
];

CueCard.MqlSyntax.StringLiteralValueSuggestions = [
    {   label:  "[]",
        hint:   "returns a list of strings",
        result: null
    },
    {   label:  "[{ \"value\" : null, \"lang\" : null, \"optional\" : true }]",
        hint:   "returns a list of strings with more options",
        result: [{ "value" : null, "lang" : null, "optional" : true }]
    }
];

CueCard.MqlSyntax.UniqueLiteralValueSuggestions = [
    {   label:  "null",
        hint:   "returns a single value",
        result: null
    },
    {   label:  "{ \"value\" : null, \"optional\" : true }",
        hint:   "returns a single value with more options",
        result: { "value" : null, "optional" : true }
    }
];

CueCard.MqlSyntax.LiteralValueSuggestions = [
    {   label:  "[]",
        hint:   "returns a list of values",
        result: null
    },
    {   label:  "[{ \"value\" : null, \"optional\" : true }]",
        hint:   "returns a list of values with more options",
        result: [{ "value" : null, "optional" : true }]
    }
];
/** indent-writer.js **/
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

// Copied from http://simile.mit.edu/repository/juggler/trunk/src/main/webapp/scripts/lib/jsonizer.js

CueCard.SerializingContext = function(parent) {
    this._parent = parent;
    this._root = (parent == null) ? this : parent.getRoot();
    this._properties = {};
}
CueCard.SerializingContext.prototype = {
    getProperty: function(name) {
        return (name in this._properties) ?
            this._properties[name] :
            (this._parent != null ? this._parent.getProperty(name) : null);
    },
    setProperty: function(name, value) {
        this._properties[name] = value;
    },
    getRoot: function() {
        return this._root;
    },
    getRootProperty: function(name) {
        return this.getRoot().getProperty(name);
    },
    setRootProperty: function(name, value) {
        return this.getRoot().setProperty(name, value);
    },
    create: function() {
        return new SerializingContext(this);
    }
};

CueCard.IndentWriter = function(context) {
    this._context = context;
    this._stream = context.getProperty("stream");
}
CueCard.IndentWriter.prototype = {
    appendLineBreak: function() {
        this._stream.append("\n");
    },
    appendIndent: function() {
        var indentLevel = this._context.getRootProperty("indentLevel");
        var indentString = this._context.getRootProperty("indentString");
        for (var i = 0; i < indentLevel; i++) {
            this._stream.append(indentString);
        }
    },
    indent: function() {
        this._context.setRootProperty("indentLevel", this._context.getRootProperty("indentLevel") + 1);
    },
    unindent: function() {
        this._context.setRootProperty("indentLevel", this._context.getRootProperty("indentLevel") - 1);
    },
    append: function(s) {
        this._stream.append(s);
    }
};

/** jsonize.js **/
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

// Copied from http://simile.mit.edu/repository/juggler/trunk/src/main/webapp/scripts/lib/jsonizer.js

/*
 *  Some code adapted from http://www.json.org/json.js.
 */
(function() {
    var javascriptEscapeCharacters = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\'': '\\\'',
        '\\': '\\\\'
    };

    function encodeJavascriptString(x) {
        if (/["\\\x00-\x1f]/.test(x)) {
            return x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                var c = javascriptEscapeCharacters[b];
                if (c) {
                    return c;
                }
                c = b.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            });
        } else {
            return x;
        }
    }
    
    function isObject(o) {
        return o != null && typeof o == "object" && !(o instanceof Array) && !("__identifier__" in o);
    }
    
    function isArray(o) {
        return o != null && o instanceof Array;
    }
    
    function objectHasFields(o) {
        for (var n in o) {
            if (o.hasOwnProperty(n)) {
                return true;
            }
        }
        return false;
    }
    
    function arrayIsEffectivelyEmpty(a) {
        return a.length == 0 || (a.length == 1 && isObject(a[0]) && !objectHasFields(a[0]));
    }

    var jsonize = CueCard.jsonize = function(o, params) {
        params = (params) ? params : {};
        
        var result = "";
        
        var quoteAllFieldNames = ("quoteAllFieldNames" in params) ? params.quoteAllFieldNames : true;
        var variables = ("variables" in params) ? params.variables : {};
        var resolveVariables = ("resolveVariables" in params) ? params.resolveVariables : false;
        
        if ("context" in params) {
            var context = new CueCard.SerializingContext(params.context);
        } else {
            var indentCount = ("indentCount" in params) ? params.indentCount : 4;
            var indentString = ""; for (var i = 0; i < indentCount; i++) indentString += " ";
        
            var context = new CueCard.SerializingContext(null);
            context.setProperty("indentCount", indentCount);
            context.setProperty("indentString", indentString);
            context.setProperty("indentLevel", 0);
            context.setProperty("stream", {
                append: function(s) {
                    result += s;
                }
            });
        }
        context.setProperty("omitWhitespace", ("omitWhitespace" in params) ? params.omitWhitespace : false);
        context.setProperty("maxFieldLength", ("maxFieldLength" in params) ? params.maxFieldLength : 15);
        context.setProperty("breakLines", ("breakLines" in params) ? params.breakLines : true);
        context.setProperty("alignFieldValues", ("alignFieldValues" in params) ? params.alignFieldValues : true);
        context.setProperty("collapseSingleObjectArray", ("collapseSingleObjectArray" in params) ? params.collapseSingleObjectArray : true);
        context.setProperty("variables", variables);
        context.setProperty("resolveVariables", resolveVariables);
        context.setProperty("encodeJavascriptString", ("encodeJavascriptString" in params) ? params["encodeJavascriptString"] : encodeJavascriptString);
        
        context.setRootProperty("fieldNameEncoder", {
            _m: {},
            encode: function(s) {
                if (s in this._m) {
                    return this._m[s];
                } else {
                    var t = encodeJavascriptString(s);
                    this._m[s] = t = (quoteAllFieldNames || /\W/.test(t)) ? ('"' + t + '"') : t;
                    return t;
                }
            }
        });
        context.setProperty("path", []);
        context.setRootProperty(
            "contextualize", 
            ("contextualize" in params) ? params.contextualize :
                function(context, path) {
                    return context;
                }
        );
        
        var writer = new CueCard.IndentWriter(context);
        jsonize.converters['anything'](o, context, writer);
        
        return result;
    }

    jsonize.converters = {
        'anything': function(o, context, writer) {
            if (o == null) {
                jsonize.converters['null'](o, context, writer);
            } else if (o instanceof Array) {
                jsonize.converters['array'](o, context, writer);
            } else if (o instanceof Object) {
                jsonize.converters['object'](o, context, writer);
            } else {
                jsonize.converters[typeof o](o, context, writer);
            }
        },
        'array': function (a, context, writer) {
            var omitWhitespace = context.getProperty("omitWhitespace");
            var breakLines = context.getProperty("breakLines");
            
            if (a.length == 0) {
                writer.append('[]');
                return;
            } else if (a.length == 1) {
                if (isObject(a[0])) {
                    if (objectHasFields(a[0])) {
                        if (context.getProperty("collapseSingleObjectArray")) {
                            writer.append('[');
                            
                            var v = a[0];
                            jsonize.converters['object'](v, context, writer);
                            
                            writer.append(']');
                            return;
                        }
                    } else {
                        writer.append('[{}]');
                        return;
                    }
                }
            }
            
            writer.append('[');
            if (breakLines) {
                writer.appendLineBreak();
                writer.indent();
            } else if (!omitWhitespace) {
                writer.append(" ");
            }
            
            var l = a.length;
            for (var i = 0; i < l; i ++) {
                var v = a[i];
                var f = jsonize.converters[v == null ? 'null' : typeof v];
                if (f) {
                    if (breakLines) {
                        writer.appendIndent();
                    }
                    
                    f(v, context, writer);
                    if (i < l - 1) {
                        writer.append(',');
                    }
                    
                    if (breakLines) {
                        writer.appendLineBreak();
                    } else if (!omitWhitespace) {
                        writer.append(" ");
                    }
                }
            }
            
            if (breakLines) {
                writer.unindent();
                writer.appendIndent();
            }
            writer.append(']');
        },
        'boolean': function (x, context, writer) {
            writer.append(String(x));
        },
        'null': function (x, context, writer) {
            writer.append("null");
        },
        'undefined': function (x, context, writer) {
            writer.append("undefined");
        },
        'number': function (x, context, writer) {
            writer.append(isFinite(x) ? String(x) : "null");
        },
        'object': function (x, context, writer) {
            if (x instanceof Array) {
                jsonize.converters['array'](x, context, writer);
            } else if ("__identifier__" in x) {
                var identifier = x["__identifier__"];
                var resolve = context.getProperty("resolveVariables");
                var variables = context.getProperty("variables");
                
                if (identifier in variables) {
                    if (resolve) {
                        var v = variables[identifier];
                        jsonize.converters['anything'](v, context, writer);
                    } else {
                        writer.append(identifier);
                    }
                } else {
                    // Always turn it into a string if the identifier isn't defined.
                    jsonize.converters['anything'](identifier, context, writer);
                }
            } else {
                var contextualize = context.getRootProperty("contextualize");
                var path = context.getProperty("path");
                
                var omitWhitespace = context.getProperty("omitWhitespace");
                var breakLines = context.getProperty("breakLines");
                var alignFieldValues = context.getProperty("alignFieldValues");
                
                writer.append('{');
                if (breakLines) {
                    writer.appendLineBreak();
                    writer.indent();
                } else if (!omitWhitespace) {
                    writer.append(" ");
                }
                
                var count = 0;
                var maxFieldLength = 0;
                var fieldNameEncoder = context.getRootProperty("fieldNameEncoder");
                for (var n in x) {
                    if (x.hasOwnProperty(n)) {
                        var v = x[n];
                        count++;
                        if (!isObject(v) && (!isArray(v) || arrayIsEffectivelyEmpty(v))) {
                            maxFieldLength = Math.max(maxFieldLength, fieldNameEncoder.encode(n).length);
                        }
                    }
                }
                maxFieldLength = Math.min(maxFieldLength, context.getProperty("maxFieldLength"));
                
                for (var n in x) {
                    if (x.hasOwnProperty(n)) {
                        var v = x[n];
                        var f = jsonize.converters[v == null ? 'null' : typeof v];
                        var n2 = fieldNameEncoder.encode(n);
                    
                        if (breakLines) {
                            writer.appendIndent();
                        }
                        
                        writer.append(n2);
                        writer.append(omitWhitespace ? ":" : ": ");
                        
                        if (!omitWhitespace && breakLines && alignFieldValues && (!isObject(v) && (!isArray(v) || arrayIsEffectivelyEmpty(v)))) {
                            for (var q = n2.length; q < maxFieldLength; q++) {
                                writer.append(" ");
                            }
                        }
                        
                        path.unshift({ field: n });
                        f(v, contextualize(context, path), writer);
                        path.shift();
                        
                        count--;
                        if (count > 0) {
                            writer.append(',');
                        }
                        
                        if (breakLines) {
                            writer.appendLineBreak();
                        } else if (!omitWhitespace) {
                            writer.append(" ");
                        }
                    }
                }
                
                if (breakLines) {
                    writer.unindent();
                    writer.appendIndent();
                }
                writer.append('}');
            }
        },
        'string': function (x, context, writer) {
            writer.append('"' + context.getProperty("encodeJavascriptString")(x) + '"');
        },
        'null': function(x, context, writer) {
            writer.append('null');
        }
    };

    function dontBreakLinesForFields() {
        var m = {};
        for (var i = 0; i < arguments.length; i++) {
            m[arguments[i]] = true;
        }
        return function(context, path) {
            if (path.length > 0 && path[0].field in m) {
                var context2 = context.create();
                context2.setProperty("breakLines", false);
                return context2;
            } else {
                return context;
            }
        };
    }

    function dontBreakLinesAfterDepth(d) {
        return function(context, path) {
            if (path.length == d) {
                var context2 = context.create();
                context2.setProperty("breakLines", false);
                return context2;
            } else {
                return context;
            }
        };
    }
})();
/** queue.js **/
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

CueCard.JsonpQueue = {
    pendingCallIDs: {},
    callInProgress: 0
};

CueCard.JsonpQueue.cancelAll = function() {
    CueCard.JsonpQueue.pendingCallIDs = {};
};

CueCard.JsonpQueue.call = function(url, onDone, onError, debug) {
    if (CueCard.JsonpQueue.callInProgress == 0) {
        document.body.style.cursor = "progress";
    }
    CueCard.JsonpQueue.callInProgress++;
    
    var callbackID = new Date().getTime() + "x" + Math.floor(Math.random() * 1000);
    var script = document.createElement("script");
    script.setAttribute('onerror', 'err' + callbackID + '();');
    
    url += (url.indexOf("?") < 0 ? "?" : "&") + "callback=cb" + callbackID;
    script.setAttribute('src', url);
    
    var cleanup = function() {
        CueCard.JsonpQueue.callInProgress--;
        if (CueCard.JsonpQueue.callInProgress == 0) {
            document.body.style.cursor = "auto";
        }
        
        if (!(debug)) {
            script.parentNode.removeChild(script);
        }
        
        try {
            delete window["cb" + callbackID];
            delete window["err" + callbackID];
        } catch (e) {
            // IE doesn't seem to allow calling delete on window
            window["cb" + callbackID] = undefined;
            window["err" + callbackID] = undefined;
        }
        
        if (callbackID in CueCard.JsonpQueue.pendingCallIDs) {
            delete CueCard.JsonpQueue.pendingCallIDs[callbackID];
            return true;
        } else {
            return false;
        }
    };
    
    var callback = function(o) {
        if (cleanup()) {
            try {
                onDone(o);
            } catch (e) {
                //console.log(e);
            }
        }
    };
    var error = function() {
        if (cleanup()) {
            if (typeof onError == "function") {
                try {
                    onError(url);
                } catch (e) {
                    //console.log(e);
                }
            }
        }
    };
    
    window["cb" + callbackID] = callback;
    window["err" + callbackID] = error;
    
    CueCard.JsonpQueue.pendingCallIDs[callbackID] = true;
    document.getElementsByTagName("head")[0].appendChild(script);
};

CueCard.JsonpQueue.queryOne = function(query, onDone, onError, debug) {
    CueCard.JsonpQueue.queryOneEnvelope({ "query" : query }, onDone, onError, debug);
};

CueCard.JsonpQueue.queryOneEnvelope = function(queryEnvelope, onDone, onError, debug) {
    var q = CueCard.jsonize({ "q1" : queryEnvelope }, { breakLines: false });
    var url = CueCard.freebaseServiceUrl + 'api/service/mqlread?queries=' + encodeURIComponent(q);
    var onDone2 = function(o) {
        if (o.q1.code == "/api/status/error") {
            if (typeof onError == "function") {
                onError(o.q1);
            }
        } else {
            onDone(o.q1);
        }
    };
    var onError2 = function() {
        if (typeof onError == "function") {
            onError("Unknown");
        }
    }
    CueCard.JsonpQueue.call(url, onDone2, onError2, debug);
};

/** query-parser.js **/
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
/** query-model.js **/
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
/** ui.js **/
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

CueCard.UI = {};

CueCard.UI.reportError = function(msg) {
    try {
        console.log(msg);
    } catch (e) {
        alert(msg);
    }
};

CueCard.UI.createBlockingContinuations = function(onDone, onError) {
    return new CueCard.UI.Cont(onDone, onError);
};

CueCard.UI.Cont = function(onDone, onError) {
    var self = this;
    
    this._onDone = onDone;
    this._onError = onError || CueCard.UI.reportError;
    this._progressUI = null;
    
    this._canceled = false;
    this._cleanedUp = false;
    
    this.cleanUp = function() {
        if (!self._cleanedUp) {
            self._cleanedUp = true;
            if (self._progressUI != null) {
                self._progressUI.remove();
                self._progressUI = null;
            }
        }
    };
    this.cancel = function() {
        if (!self._canceled) {
            self._canceled = true;
            self.cleanUp();
        }
    };
    this.onError = function() {
        self.cleanUp();
        self._onError();
    };
    this.onDone = function() {
        var delayCleanUp = false;
        if (!self._canceled) {
            var args = [ self ];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            delayCleanUp = self._onDone.apply(null, args);
        }
        
        if (!(delayCleanUp)) {
            self.cleanUp();
        }
    };
    
    window.setTimeout(function() {
        if (!self._cleanedUp) {
            self._progressUI = $('<div class="cuecard-progress">Working...</div>').appendTo($(document.body));
        }
    }, 300);
};

CueCard.UI.Cont.prototype.isCanceled = function() {
    return this._canceled;
};

CueCard.UI.Cont.prototype.extend = function(onDone, onError) {
    this._onDone = onDone;
    this._onError = onError || this._onError;
    return this;
};

/** popup.js **/
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

CueCard.Popup = function(left, top, height, windows, handlers) {
    this._left = left;
    this._top = top;
    this._height = height;
    this._windows = windows;
    this._handlers = handlers || {};
    
    this._pendingContinuations = [];
    
    this.elmt = $('<div class="cuecard-popup-container"></div>')
        .css("top", (this._top + this._height) + "px")
        .css("left", this._left + "px")
        .appendTo('body');
        
    this._addEventHandlers();
};

CueCard.Popup.prototype.addPendingContinuation = function(cont) {
    this._pendingContinuations.push(cont);
};

CueCard.Popup.prototype.reposition = function() {
    var ourHeight = this.elmt.height();
    var ourWidth = this.elmt.width();
    
    if (this._top + this._height + ourHeight >= $(window).height()) {
        this.elmt.css("top", (this._top - ourHeight - 5) + "px");
    } else {
        this.elmt.css("top", (this._top + this._height) + "px");
    }
    if (this._left + ourWidth >= $(window).width()) {
        this.elmt.css("left", ($(window).width() - ourWidth - 25) + "px");
    } else {
        this.elmt.css("left", (this._left) + "px");
    }
};

CueCard.Popup.prototype.close = function() {
    this._remove();
    this._pendingContinuations = null;
};

CueCard.Popup.prototype.cancel = function() {
    if (this.elmt != null) {
        this._remove();
        this._cancelPendingContinuations();
        this._pendingContinuations = null;
    }
};

CueCard.Popup.prototype._remove = function() {
    this._removeEventHandlers();
    
    this.elmt.remove();
    this.elmt = null;
};

CueCard.Popup.prototype._cancelPendingContinuations = function() {
    for (var i = 0; i < this._pendingContinuations.length; i++) {
        try {
            this._pendingContinuations[i].cancel();
        } catch (e) {
            //console.log(e);
        }
    }
    this._pendingContinuations = [];
};

CueCard.Popup.prototype._addEventHandlers = function() {
    var self = this;
    this._handleKeyDown = function(evt) {
        return self._onKeyDown(evt);
    };
    this._handleMouseDown = function(evt) {
        return self._onMouseDown(evt);
    };
    
    for (var i = 0; i < this._windows.length; i++) {
        var win = this._windows[i];
        try {
            $(win.document).keydown(this._handleKeyDown).mousedown(this._handleMouseDown);
        } catch (e) {
            alert("Unable to install keyup handler on codemirror window");
        }
    }
};

CueCard.Popup.prototype._removeEventHandlers = function() {
    var self = this;
    for (var i = 0; i < this._windows.length; i++) {
        var win = this._windows[i];
        try {
            $(win.document).unbind("keydown", this._handleKeyDown).unbind("mousedown", this._handleMouseDown);
        } catch (e) {
            alert("Unable to install keyup handler on codemirror window");
        }
    }
};

CueCard.Popup.prototype._onKeyDown = function(evt) {
    if (evt.keyCode == 27) { // esc
        this.cancel();
        if ("onCancel" in this._handlers) {
            this._handlers["onCancel"]("key");
        }
    }
};

CueCard.Popup.prototype._onMouseDown = function(evt) {
    if (this.mouseEventOutsidePopup(evt)) {
        this.cancel();
        if ("onCancel" in this._handlers) {
            this._handlers["onCancel"]("mouse");
        }
    }
};

CueCard.Popup.prototype.mouseEventOutsidePopup = function(evt) {
    if (evt.currentTarget != this.elmt[0].ownerDocument) {
        return true;
    } else {
        var offset = this.elmt.offset();
        if (evt.pageX < offset.left || evt.pageX > offset.left + this.elmt.width() ||
            evt.pageY < offset.top || evt.pageY > offset.top + this.elmt.height()) {
            return true;
        }
    }
    return false;
};
/** topic-suggestors.js **/
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

CueCard.TypeBasedTopicSuggestor = function(popup, defaultSuggestions, expectedTypes, desiredProperty, onCommit) {
    this._popup = popup;
    this._defaultSuggestions = defaultSuggestions;
    this._expectedTypes = expectedTypes;
    this._desiredProperty = desiredProperty;
    this._onCommit = onCommit;
    
    this._popup.elmt.addClass("cuecard-popup-container-wide");
};

CueCard.TypeBasedTopicSuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    if (prefix.length == 0) {
        var entries = [];
        
        for (var i = 0; i < this._defaultSuggestions.length; i++) {
            entries.push(this._defaultSuggestions[i]);
        }
        
        onDone(entries);
    } else {
        var self = this;
        var cont = CueCard.UI.createBlockingContinuations(function(cont2, o) {
            var entries = [];
            
            for (var i = 0; i < o.result.length; i++) {
                var topic = o.result[i];
                var imageURL = null;
                if ("/common/topic/image" in topic && topic["/common/topic/image"] != null && topic["/common/topic/image"].length > 0) {
                    imageURL = CueCard.freebaseServiceUrl + "api/trans/image_thumb" + topic["/common/topic/image"][0].id + "?mode=fillcrop&maxwidth=40&maxheight=40";
                }
                
                entries.push({
                    result: topic[self._desiredProperty],
                    elmt: $(
                        '<a class="cuecard-suggestion-entry" href="javascript:{}"><table cellpadding="0" cellspacing="0"><tr valign="top">' + 
                            '<td valign="top">' + 
                                (imageURL == null ? 
                                    '<div class="cuecard-suggestion-thumbnail-empty"> </div>' :
                                    ('<img src="' + imageURL + '" />')) + 
                            '</td>' +
                            '<td valign="top">' +
                                topic.name + 
                                '<div class="cuecard-suggestion-id">' + topic[self._desiredProperty] + '</div>' +
                            '</td>' +
                        '</tr></table></a>'
                    )
                });
            }
            
            onDone(entries);
        });
        this._popup.addPendingContinuation(cont);
            
        var url = CueCard.helper + "suggest-values-of-types?t=" +
                encodeURIComponent(this._expectedTypes.join(",")) + "&q=" + encodeURIComponent(prefix);
        
        CueCard.JsonpQueue.call(
            url,
            cont.onDone,
            cont.onError
        );
    }
};

CueCard.TypeBasedTopicSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};

/** static-choices-suggestor.js **/
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

CueCard.StaticChoicesSuggestor = function(defaultSuggestions, onCommit) {
    this._defaultSuggestions = defaultSuggestions;
    this._onCommit = onCommit;
};

CueCard.StaticChoicesSuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    var entries = [];
    
    for (var i = 0; i < this._defaultSuggestions.length; i++) {
        var entry = this._defaultSuggestions[i];
        if (prefix.length == 0 || entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        }
    }
    
    onDone(entries);
};

CueCard.StaticChoicesSuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};

/** property-suggestor.js **/
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

CueCard.PropertySuggestor = function(popup, defaultSuggestions, propertyEntries, onCommit) {
    this._popup = popup;
    this._defaultSuggestions = defaultSuggestions;
    this._entries = propertyEntries;
    this._onCommit = onCommit;
};

CueCard.PropertySuggestor.prototype.getSuggestions = function(prefix, onDone) {
    prefix = prefix.toLowerCase();
    
    var entries = [];
    var propertyMap = {};
    
    for (var i = 0; i < this._entries.length; i++) {
        var entry = this._entries[i];
        if (prefix.length == 0) {
            entries.push(entry);
        } else if (entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        } else {
            for (var j = 0; j < entry.expectedTypes.length; j++) {
                var expectedType = entry.expectedTypes[j];
                if (expectedType.name.toLowerCase().indexOf(prefix) >= 0) {
                    entries.push({
                        label:              entry.label,
                        hint:               entry.hint + " &rarr; type " + expectedType.id,
                        qualifiedProperty:  entry.qualifiedProperty,
                        result:             entry.result,
                        offset:             entry["offset"],
                        extent:             entry["extent"]
                    });
                    propertyMap[entry.qualifiedProperty] = true;
                    
                    break;
                }
            }
        }
    }
    
    for (var i = 0; i < this._defaultSuggestions.length; i++) {
        var entry = this._defaultSuggestions[i];
        if (prefix.length == 0 || entry.label.toLowerCase().indexOf(prefix) >= 0) {
            entries.push(entry);
        }
    }
    
    if (prefix.length < 3 && entries.length > 3) {
        onDone(entries);
    } else {
        var self = this;
        var cont = CueCard.UI.createBlockingContinuations(function(cont2, o) {
            for (var i = 0; i < o.result.length; i++) {
                var property = o.result[i];
                if (!(property.id in propertyMap) && 
                    "/type/property/schema" in property && 
                    property["/type/property/schema"] != null && 
                    property["/type/property/schema"].length > 0 &&
                    "key" in property &&
                    property.key != null &&
                    property.key.length > 0
                ) {
                    
                    var expectedTypes = "/type/property/expected_type" in property && property["/type/property/expected_type"] != null ?
                        property["/type/property/expected_type"] : [];
                        
                    var entry = {
                        label:              property.key[0],
                        hint:               "of type " + property["/type/property/schema"][0].id,
                        qualifiedProperty:  property.id,
                        expectedTypes:      expectedTypes
                    };
                    
                    var resultPrefix = '"' + property.id + '" : ';
                    CueCard.QueryEditor.setPropertySuggestionSuffix(expectedTypes.length > 0 ? expectedTypes[0] : "", entry, entry["/type/property/unique"], resultPrefix);
                    
                    entries.push(entry);
                }
            }
            onDone(entries);
        });
        this._popup.addPendingContinuation(cont);
            
        var url = CueCard.helper + "suggest-arbitrary-properties?q=" + encodeURIComponent(prefix);
        
        CueCard.JsonpQueue.call(
            url,
            cont.onDone,
            cont.onError
        );
    }
};

CueCard.PropertySuggestor.prototype.commit = function(entry) {
    this._onCommit(entry);
};

/** type-suggestor.js **/
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

CueCard.TypeSuggestor = function(defaultSuggestions) {
};

CueCard.TypeSuggestor.prototype.getSuggestions = function(prefix) {
};

/** suggestion-controller.js **/
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

CueCard.SuggestionController = function(popup, parent, suggestor, text) {
    this._popup = popup;
    this._suggestor = suggestor;
    this._lastText = text;
    this._selectedIndex = -1;
    this._suggestions = [];
    
    this._input = $('<input value="' + text + '" />');
    this._suggestionContainer = $('<div class="cuecard-suggestion-container"></div>');
    
    $(parent)
        .append($('<div class="cuecard-suggestion-input-container"></div>').append(this._input))
        .append(this._suggestionContainer);
        
    var self = this;
    this._onKeyUp = function(evt) {
        if (!evt.shiftKey && !evt.metaKey && !evt.ctrlKey) {
            if (evt.keyCode == 36 || evt.keyCode == 38 || evt.keyCode == 40) { // up down arrow movements
                return self._cancelEvent(evt);
            }
            
            var newText = self._input[0].value;
            if (newText != self._lastText) {
                self._lastText = newText;
                self._updateSuggestions();
            }
        }
    };
    this._onKeyDown = function(evt) {
        while (!evt.shiftKey && !evt.metaKey && !evt.ctrlKey) {
            if (evt.keyCode == 13 || evt.keyCode == 9) { // enter or tab
                self._commitSelectedSuggestion();
            } else if (evt.keyCode == 36) { // home
                if (self._suggestions.length > 0) {
                    self._selectSuggestion(0, true);
                }
            } else if (evt.keyCode == 38) { // arrow up
                if (self._selectedIndex > 0) {
                    self._selectSuggestion(self._selectedIndex - 1, true);
                }
            } else if (evt.keyCode == 40) { // arrow down
                if (self._selectedIndex < self._suggestions.length - 1) {
                    self._selectSuggestion(self._selectedIndex + 1, true);
                }
            } else {
                break; // skip the remaining code in the loop
            }
            return self._cancelEvent(evt);
        }
        
        if ("onKeyDown" in self._suggestor) {
            return self._suggestor.onKeyDown(evt, self._input[0].value);
        }
    };
    
    this._input.keyup(this._onKeyUp).keydown(this._onKeyDown);
    
    var input = this._input[0];
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(text.length, text.length);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', text.length);
        range.moveStart('character', text.length);
        range.select();
    }
    this._input[0].focus();
    
    this._updateSuggestions();
};

CueCard.SuggestionController.prototype._updateSuggestions = function() {
    this._suggestionContainer.empty();
    this._suggestionContainer.html('<div class="cuecard-suggestion-progress">Please wait...</div>');
    this._selectedIndex = -1;
    this._suggestions.length = 0;
    
    var self = this;
    this._suggestor.getSuggestions(this._lastText, function(suggestions) {
        self._renderSuggestions(suggestions, self._lastText);
    });
};

CueCard.SuggestionController.prototype._renderSuggestions = function(suggestions, text) {
    var container = this._suggestionContainer;
    container.empty();
    
    var self = this;
    var addSuggestionEntry = function(entry, index) {
        var elmt = "elmt" in entry ? entry.elmt : 
            $('<a class="cuecard-suggestion-entry" href="javascript:{}">' + entry.label + 
                ("hint" in entry ? (' <span class="cuecard-suggestion-hint">' + entry.hint + '</span>') : '') + 
              '</a>');
            
        elmt
            .mouseover(function(evt) { self._selectSuggestion(index, false); })
            .click(function(evt) { self._commitSelectedSuggestion(); })
            .appendTo(container);
    };
    
    this._suggestions = suggestions;
    for (var i = 0; i < suggestions.length; i++) {
        addSuggestionEntry(suggestions[i], i);
    }
    
    if (this._suggestions.length > 0) {
        this._selectSuggestion(0, false);
    } else {
        $('<div class="cuecard-suggestion-noEntryMessage">No suggestion available.<br/>Press Enter to keep what you have typed,<br/>ESC to discard it.</div>').appendTo(container);
    }
    
    this._popup.reposition();
};

CueCard.SuggestionController.prototype._selectSuggestion = function(index, byKey) {
    var container = this._suggestionContainer;
    
    if (this._selectedIndex >= 0) {
        this._getSuggestion(this._selectedIndex).removeClass("cuecard-suggestion-selected");
    }
    
    this._selectedIndex = index;
    this._getSuggestion(this._selectedIndex).addClass("cuecard-suggestion-selected");
    if (byKey) {
        this._getSuggestion(this._selectedIndex)[0].scrollIntoView(false);
    }
};

CueCard.SuggestionController.prototype._commitSelectedSuggestion = function() {
    if (this._selectedIndex >= 0) {
        this._suggestor.commit(this._suggestions[this._selectedIndex]);
    } else {
        this._suggestor.commit(this._input[0].value);
    }
};

CueCard.SuggestionController.prototype._getSuggestion = function(index) {
    return $(this._suggestionContainer.children()[index]);
};

CueCard.SuggestionController.prototype._cancelEvent = function(evt) {
    evt.returnValue = false;
    evt.cancelBubble = true;
    if ("preventDefault" in evt) {
        evt.preventDefault();
    }
    return false;
}

/** query-editor.js **/
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

/** output-pane.js **/
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

CueCard.OutputPane = function(elmt, options) {
    this._elmt = $(elmt);
    this._options = options || {};
    
    this._jsonResult = null;
    this._lastJsonOutputMode = $.cookie("cc_op_mode") == "text" ? "text" : "tree";
    this._treeConstructed = false;
    
    this._constructUI();
};

CueCard.OutputPane.prototype.dispose = function() {
    // TODO
};

CueCard.OutputPane.prototype._constructUI = function() {
    var self = this;
    var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());
    
    this._elmt.acre(fb.acre.apps.cuecard + "/output-pane", "tabs", [idPrefix, this]);
    
    var tabs = $('#' + idPrefix + " > .section-tabset");
    tabs.tabs('#' + idPrefix + " > .tabbed-content > .cuecard-outputPane-tabBody", {
      "initialIndex": (this._lastJsonOutputMode == "tree") ? 0 : 1,
      "onBeforeClick": function(event, index) {
        window.__cc_tree_disposePopup();
        if (index == 0) { // tree
            self._lastJsonOutputMode = "tree";
            if (self._jsonResult != null && !self._treeConstructed) {
                self._constructTree();
            }
        } else if (index == 1) {
            self._lastJsonOutputMode = "text";
        }
        
        $.cookie("cc_op_mode", self._lastJsonOutputMode, { expires: 365 });
      }
    });
    this._tabs = tabs.data("tabs");
    
    this._tree = this._getTab("tree").find("div");
    this._textarea = this._getTab("text").find("textarea");
    this._status = this._getTab("status").find("div");
};

CueCard.OutputPane.prototype._getTab = function(name) {
    return $("#" + this._idPrefix + "-" + name);
};

CueCard.OutputPane.prototype.setJSONContent = function(o, jsonizingSettings) {
    this._jsonResult = o;
    this._textarea[0].value = CueCard.jsonize(o, jsonizingSettings || { indentCount: 2 });
    
    var tabToSelect;
    if (this._lastJsonOutputMode == "tree") {
        this._constructTree();
        tabToSelect = 0;
    } else {
        this._tree.empty();
        this._treeConstructed = false;
        tabToSelect = 1;
    }
    
    var self = this;
    var selectTab = function() {
        self._tabs.click(tabToSelect);
    };
    
    // tabs have to be selected asynchronously or Chrome will crash.
    window.setTimeout(selectTab, 100);
};

CueCard.OutputPane.prototype.setStatus = function(html) {
    this._tabs.click(2);
    this._status.html(html);
    
    this._jsonResult = null;
    this._textarea.val("");
    this._tree.empty();
    this._treeConstructed = false;
};

CueCard.OutputPane.prototype.getJson = function() {
    return this._jsonResult;
};

CueCard.OutputPane.prototype.renderResponseHeaders = function(headers) {
    this.setStatus($.acre(fb.acre.apps.cuecard + "/output-pane", "status", [headers]));
};

CueCard.OutputPane.prototype._constructTree = function() {
    var self = this;
    
    /*
     *  WARNING: Unless you know what you're doing, the code in this function
     *  is very fragile. Do not change it.
     */
    
    this._treeConstructed = true;
    
    var html = [];
    var makeImage = function(url, visible) {
        return '<img class="cuecard-outputPane-tree-toggle" onclick="__cc_tree_toggle(this);" src="' + CueCard.urlPrefix + url + '" ' + (visible ? '' : ' style="display: none;"') +'/>';
    };
    var append = function(s) {
        html.push(s);
    };
    var makeExploreLink = function(id) {
        return "<a class='cuecard-outputPane-tree-explore' target='_blank' href='" + CueCard.freebaseServiceUrl + "tools/explore" + id + "'>xp</a>";
    };
    var makeTopicLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverTopic(this)' onmouseout='__cc_tree_mouseOutTopic(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeImageLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverImage(this)' onmouseout='__cc_tree_mouseOutImage(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeRawImageLink = function(url) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + url +
                "' onmouseover='__cc_tree_mouseOverImage(this)' onmouseout='__cc_tree_mouseOutImage(this)'>" + 
                JSON.stringify(url) + 
            "</a>");
    };
    var makeBlurbLink = function(id, label) {
        append(
            "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + "view" + id +
                "' onmouseover='__cc_tree_mouseOverArticle(this)' onmouseout='__cc_tree_mouseOutArticle(this)' fbid='" + id + "'>" + 
                label + 
            "</a>" + 
            makeExploreLink(id));
    };
    var makeSpecialLink = function(superFieldName, id, label) {
        if (superFieldName == "image" || superFieldName == "/common/topic/image") {
            makeImageLink(id, label);
        } else if (superFieldName == "article" || superFieldName == "/common/topic/article") {
            makeBlurbLink(id, label);
        } else {
            makeTopicLink(id, label);
        }
    };
    var startsWith = function(big, small) {
        return big.length > small.length && big.substr(0, small.length) == small;
    };
    var constructNode = function(o, appenders, path) {
        if (o == null) {
            appenders.startBody(false);
            append("<span>" + JSON.stringify(o) + "</span>");
            appenders.endBody(false);
        } else if (typeof o != "object") {
            appenders.startBody(false);
            
            var fieldName = path[0];
            var superFieldName = path.length > 1 ? path[1] : "";
            if (fieldName == "id" || fieldName == "/type/object/id") {
                makeSpecialLink(superFieldName, o, JSON.stringify(o));
            } else if (fieldName == "guid" || fieldName == "/type/object/guid") {
                makeSpecialLink(superFieldName, "/guid/" + o.substr(1), JSON.stringify(o));
            } else if (fieldName == "type" || fieldName == "/type/object/type") {
                append("<a target='_blank' href='" + CueCard.freebaseServiceUrl + "type/schema" + o + "'>" + JSON.stringify(o) + "</a>" + makeExploreLink(o));
            } else if (typeof o == "string" && (startsWith(o, "http://") || startsWith(o, "https://") || startsWith(o, "ftp://"))) {
                if (startsWith(o, "http://chart.apis.google.com/chart?")) {
                    makeRawImageLink(o);
                } else {
                    append("<a target='_blank' href='" + o + "'>" + JSON.stringify(o) + "</a>");
                }
            } else {
                append("<span>" + JSON.stringify(o) + "</span>");
            }
            appenders.endBody(false);
        } else if (o instanceof Array) {
            if (o.length == 0) {
                appenders.startBody(false);
                append("<span>[]</span>");
                appenders.endBody(false);
            } else {
                var style = (o.length > 1 && typeof o[0] == 'object') ? '' : ' style="display: none;"';
                
                appenders.startBody(true, 
                    '<span cc:mode="normal">[ ' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_expandAll(this);"' + style + '>expand all</a><span class="cuecard-outputPane-tree-toggles"' + style + '> &bull; </span>' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_collapseAll(this);"' + style + '>collapse all</a><span class="cuecard-outputPane-tree-toggles"' + style + '> &bull; </span>' +
                        '<a href="javascript:{}" class="cuecard-outputPane-tree-all" onclick="__cc_tree_flip(this);"' + style + '>1-by-1</a>' +
                    '</span>', 
                    '<span style="display: none;">[ ' + (o.length > 1 ? (o.length + ' elements') : '1 element') + ' ]</span>');
                append('<div class="cuecard-outputPane-tree-arrayBody cuecard-outputPane-tree-normalMode">');
                
                var makeAppenders = function(index, canGoBack, canGoForward) {
                    return {
                        startBody: function(collapsible, expandedHeader, collapsedHeader) {
                            if (collapsible) {
                                append('<div class="cuecard-outputPane-tree-arrayElement">' +
                                    makeImage('expanded.png', true) + makeImage('collapsed.png', false) +
                                    '<span class="cuecard-outputPane-tree-memberName">' + index + ':</span> ' +
                                    expandedHeader + 
                                    collapsedHeader +
                                    '<span>' +
                                        (canGoBack ? '<a href="javascript:{}" class="cuecard-outputPane-tree-flipControl" onclick="__cc_tree_flipPrevious(this);">previous</a> ' : '') +
                                        (canGoForward ? '<a href="javascript:{}" class="cuecard-outputPane-tree-flipControl" onclick="__cc_tree_flipNext(this);">next</a>' : '') +
                                    '</span>'
                                );
                            } else {
                                append('<div class="cuecard-outputPane-tree-arrayElement"><span class="cuecard-outputPane-tree-memberName">' + index + ':</span> ');
                            }
                        },
                        endBody: function(collapsible) {
                            append('</div>');
                        }
                    };
                };
                
                for (var i = 0; i < o.length; i++) {
                    constructNode(o[i], makeAppenders(i, i > 0, i < o.length - 1), path);
                }
                
                append('</div>');
                appenders.endBody(true);
            }
        } else {
            appenders.startBody(true, 
                '<span>{</span>', 
                '<span style="display: none;">{...}</span>');
            append('<div class="cuecard-outputPane-tree-objectBody cuecard-outputPane-tree-normalMode">');
            
            var makeAppenders = function(fieldName) {
                return {
                    startBody: function(collapsible, expandedHeader, collapsedHeader) {
                        if (collapsible) {
                            append('<div class="cuecard-outputPane-tree-objectField">' +
                                makeImage('expanded.png', true) + makeImage('collapsed.png', false) +
                                '<span class="cuecard-outputPane-tree-memberName">' + fieldName + ':</span> ' +
                                expandedHeader + 
                                collapsedHeader + 
                                '<span></span>'
                            );
                        } else {
                            append('<div class="cuecard-outputPane-tree-objectField"><span class="cuecard-outputPane-tree-memberName">' + fieldName + ':</span> ');
                        }
                    },
                    endBody: function(collapsible) {
                        append('</div>');
                    }
                };
            };
            
            for (var n in o) {
                constructNode(o[n], makeAppenders(n), [ n ].concat(path));
            }
            
            append('</div>');
            appenders.endBody(true);
        }
    };
    
    constructNode(this._jsonResult, {
        startBody: function(collapsible) {},
        endBody: function() {}
    }, [ "__root__" ]);
    this._tree.html(html.join(""));
};

window.__cc_tree_toggle = function(img) {
    var expanded = img.src.indexOf("expanded.png") > 0;
    var parent = img.parentNode;
    if (expanded) {
        window.__cc_tree_collapse(parent);
    } else {
        window.__cc_tree_expand(parent);
    }
};

window.__cc_tree_expand = function(elmt) {
    if (elmt.firstChild.tagName.toLowerCase() == "img") {
        var body = elmt.lastChild;
        body.style.display = "block";
        
        elmt.childNodes[0].style.display = "inline";
        elmt.childNodes[1].style.display = "none";
        
        var collapsedHeader = body.previousSibling.previousSibling;
        var expandedHeader = collapsedHeader.previousSibling;
        expandedHeader.style.display = "inline";
        collapsedHeader.style.display = "none";
    }
};

window.__cc_tree_collapse = function(elmt) {
    if (elmt.firstChild.tagName.toLowerCase() == "img") {
        var body = elmt.lastChild;
        body.style.display = "none";
        
        elmt.childNodes[0].style.display = "none";
        elmt.childNodes[1].style.display = "inline";
        
        var collapsedHeader = body.previousSibling.previousSibling;
        var expandedHeader = collapsedHeader.previousSibling;
        expandedHeader.style.display = "none";
        collapsedHeader.style.display = "inline";
    }
};

(function() {
    var restoreNormalMode = function(link) {
        var mode = link.parentNode.getAttribute("cc:mode");
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        if (mode == "flip") {
            for (var i = 0; i < body.childNodes.length; i++) {
                body.childNodes[i].style.display = "block";
            }
            link.parentNode.setAttribute("cc:mode", "normal");
            $(link.parentNode.parentNode).find("> div.cuecard-outputPane-tree-arrayBody")
                .addClass("cuecard-outputPane-tree-normalMode")
                .removeClass("cuecard-outputPane-tree-flipMode");
        }
    };
    
    window.__cc_tree_expandAll = function(link) {
        restoreNormalMode(link);
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        for (var i = 0; i < body.childNodes.length; i++) {
            __cc_tree_expand(body.childNodes[i]);
        }
    };

    window.__cc_tree_collapseAll = function(link) {
        restoreNormalMode(link);
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        for (var i = 0; i < body.childNodes.length; i++) {
            __cc_tree_collapse(body.childNodes[i]);
        }
    };
    
    window.__cc_tree_flip = function(link) {
        var mode = link.parentNode.getAttribute("cc:mode");
        var body = link.parentNode.nextSibling.nextSibling.nextSibling;
        if (mode == "normal") {
            for (var i = 0; i < body.childNodes.length; i++) {
                var child = body.childNodes[i];
                child.style.display = i == 0 ? "block" : "none";
                __cc_tree_expand(child);
            }
            link.parentNode.setAttribute("cc:mode", "flip");
            $(link.parentNode.parentNode).find("> div.cuecard-outputPane-tree-arrayBody")
                .removeClass("cuecard-outputPane-tree-normalMode")
                .addClass("cuecard-outputPane-tree-flipMode");
        }
    };
    
    window.__cc_tree_flipPrevious = function(link) {
        var parent = link.parentNode.parentNode;
        parent.style.display = "none";
        parent.previousSibling.style.display = "block";
    };
    
    window.__cc_tree_flipNext = function(link) {
        var parent = link.parentNode.parentNode;
        parent.style.display = "none";
        parent.nextSibling.style.display = "block";
    };
    
    window.__cc_tree_mouseOverTopic = function(elmt) {
        var id = elmt.getAttribute("fbid");
        $.getJSON("http://hotshot.dfhuynh.user.dev.freebaseapps.com/html?id=" + id + "&callback=?",
            function(html) {
                var div = __cc_tree_createPopup(elmt);
                $(div).addClass("cuecard-outputPane-tree-popup-topic").html(html);
            }
        );
    };
    window.__cc_tree_mouseOutTopic = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_mouseOverImage = function(elmt) {
        var id = elmt.getAttribute("fbid");
        if (id != null && id.length > 0) {
            var url = CueCard.freebaseServiceUrl + "api/trans/image_thumb" + id + "?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100";
        } else {
            var url = elmt.href;
        }
        var div = __cc_tree_createPopup(elmt);
        div.innerHTML = "<img src='" + url + "' />";
    };
    window.__cc_tree_mouseOutImage = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_mouseOverArticle = function(elmt) {
        var id = elmt.getAttribute("fbid");
        $.getJSON(CueCard.freebaseServiceUrl + "api/trans/blurb" + id + "?callback=?",
            function(data) {
                var text = data.result.body;
                var div = __cc_tree_createPopup(elmt);
                $(div).addClass("cuecard-outputPane-tree-popup-article").html(text);
            }
        );
    };
    window.__cc_tree_mouseOutArticle = function(elmt) {
        __cc_tree_disposePopup();
    };
    
    window.__cc_tree_createPopup = function(elmt) {
        var div = document.getElementById("cuecard-outputPane-tree-popup");
        if (div == null) {
            div = document.createElement("div");
            div.id = "cuecard-outputPane-tree-popup";
            div.className = "cuecard-outputPane-tree-popup";
            div.onmouseover = window.__cc_tree_disposePopup;
            
            document.body.appendChild(div);
        }
        
        var pos = $(elmt).offset();
        div.style.top = (pos.top + elmt.offsetHeight + 10) + "px";
        div.style.left = (pos.left) + "px";
        
        return div;
    };
    window.__cc_tree_disposePopup = function() {
        var div = document.getElementById("cuecard-outputPane-tree-popup");
        if (div != null) {
            div.parentNode.removeChild(div);
        }
    };
})();
/** control-pane.js **/
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

CueCard.ControlPane = function(elmt, options) {
    this._elmt = $(elmt);
    this._options = options || {};
    
    this._constructUI();
};

CueCard.ControlPane.prototype.dispose = function() {
    // TODO
};

CueCard.ControlPane.prototype._constructUI = function() {
    var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());
    this._elmt.acre(fb.acre.apps.cuecard + "/control-pane", "tabs", [idPrefix, this]);
    $('#' + idPrefix + " > .section-tabset").tabs('#' + idPrefix + " > .tabbed-content > .cuecard-controlPane-tabBody", { initialIndex: 0 });
};

CueCard.ControlPane.prototype._getDefaults = function() {
    var opts = this._options;
    var env = opts.env || {};
    
    var defaults = {};
    
    defaults.extended = opts.extended || env.extended;
    defaults.extended = (defaults.extended === 1) ? true : false;
    defaults.as_of_time = opts.as_of_time || env.as_of_time || null;
    defaults.use_permission_of = opts.use_permission_of || env.use_permission_of || null;
    
    delete env["extended"];
    delete env["as_of_time"];
    delete env["use_permission_of"];
    
    return defaults;
};

CueCard.ControlPane.prototype._getTab = function(name) {
    return $("#" + this._idPrefix + "-" + name);
};

CueCard.ControlPane.prototype._redangle = function() {
    var self = this;
    
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model;
    q.toInsideOutQueryJson(m.context, CueCard.UI.createBlockingContinuations(function(cont, q2) {
        self._setOutputJSON(q2);
    }));
};

CueCard.ControlPane.prototype._qualify = function() {
    var self = this;
    
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model;
    q.qualifyAllProperties(CueCard.UI.createBlockingContinuations(
        function(cont) {
            self._setOutputJSON(q.toQueryJson({qualifyAllProperties:true}));
        }
    ));
};

CueCard.ControlPane.prototype._generateCode = function() {
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    var t = CueCard.CodeGeneration.generate(q, CueCard.CodeGeneration.serializers["acre-template"], { variables: this.getVariables() });
    
    CueCard.showDialog("acre_template", t);
};

CueCard.ControlPane.prototype._oneLiner = function() {
    var m = this._options.queryEditor.getQueryModelAndContext();
    var q = m.model.toQueryJson();
    var variables = this.getVariables();
    
    var options = this.getJsonizingSettings({ variables: variables, resolveVariables: false });
    options.breakLines = false;
    
    this._options.queryEditor.content(CueCard.jsonize(q, options));
};

CueCard.ControlPane.prototype._setOutputJSON = function(o) {
    switch (this._getTab("tools").find("input[name='tools-result']:checked").val()) {
        case "replace":
            this._options.queryEditor.content(CueCard.jsonize(o, this.getJsonizingSettings()));
            break;
        case "output":
            this._options.outputPane.setJSONContent(o, this.getJsonizingSettings());
            break;
        }
};

CueCard.ControlPane.prototype._runPage = function(increment) {
    var input = this._getTab("envelope").find("input[name='page']");
    var pageString = input.val();
    var page = parseInt(pageString) || 1;
    page += increment;

    if (page < 1) {
        input.val("1");
        return;
    } else {
        input.val(page);
        if (this._options.queryEditor != null) {
            this._options.queryEditor.run();
        }
    }
};

CueCard.ControlPane.prototype._runCursor = function(auto_run) {
    if (this._options.outputPane != null) {
        var o = this._options.outputPane.getJson();
        if (o !== undefined && o !== null && "cursor" in o) {
            this._getTab("envelope").find("input[name='cursor']").val(o.cursor);
            this._getTab("envelope").find("input[name='cursor-opt'][value='custom']").attr("checked", "checked");

            if (this._options.queryEditor != null && auto_run) {
                this._options.queryEditor.run();
            }
        }
    }
};

CueCard.ControlPane.prototype.getQueryEnvelopeSetting = function(name) {
    switch (name) {
        case "extended":
            return this._getTab("envelope").find("input[name='extended']").attr("checked") ? 1 : 0;
        case "as_of_time":
            var asOfTime = this._getTab("envelope").find("input[name='as_of_time']").val();
            if (asOfTime.length > 0) {
                return asOfTime;
            }
            break;
    }
    return null;
};

CueCard.ControlPane.prototype.getQueryEnvelope = function(e, ignorePaging) {
    e = e || {};
    
    var extended = this.getSetting("extended");
    if (extended == 1) {
        e.extended = 1;
    }
    var asOfTime = this._getTab("envelope").find("input[name='as_of_time']").val();
    if (asOfTime.length > 0) {
        e.as_of_time = asOfTime;
    }
    var usePermissionOf = this._getTab("envelope").find("input[name='use_permission_of']").val();
    if (usePermissionOf.length > 0) {
        e.use_permission_of = usePermissionOf;
    }
    
    var selects = this._getTab("envelope").find("select");
    var getSelectValue = function(i) {
        return selects[i].options[selects[i].selectedIndex].value;
    };
    
    var lang = getSelectValue(0);
    if (lang.length > 0) {
        e.lang = lang;
    }
    
    var escape = getSelectValue(1);
    if (escape.length > 0) {
        e.escape = (escape == "false") ? false : escape;
    }
    
    var uniquenessFailure = getSelectValue(2);
    if (uniquenessFailure.length > 0) {
        e.uniqueness_failure = uniquenessFailure;
    }
    
    if (!(ignorePaging)) {
        var page = this._getTab("envelope").find("input[name='page']").val();
        if (page.length > 0) {
            try {
                e.page = parseInt(page);
            } catch (e) {}
        }
    
        switch (this._getTab("envelope").find("input[name='cursor-opt']:checked").val()) {
            case "true":
                e.cursor = true;
                break;
            case "custom":
                e.cursor = this._getTab("envelope").find("input[name='cursor']").val();
                break;
            }
    }
    
    this.getCustomEnvelope(e); // customize it
    
    return e;
};

CueCard.ControlPane.prototype.getCustomEnvelope = function(env) {
    env = env || {};
    
    var table = this._getTab("customEnvelope").find('table')[0];
    for (var i = 1; i < table.rows.length; i++) {
        var tr = table.rows[i];
        var name = tr.cells[0].firstChild.value;
        var value = tr.cells[1].firstChild.value;
        if (name.length > 0) {
            try {
                value = JSON.parse(value);
            } catch (e) {
            }
            env[name] = value;
        }
    }
    return env;
};

CueCard.ControlPane.prototype.getSetting = function(name) {
    var checkboxes = this._getTab("settings").find("input");
    switch (name) {
        case "cleanup" :
            var r = checkboxes[0].checked;
            $.cookie('cc_cp_clean', r ? "1" : "0", { expires: 365 });
            return r;
        case "alignJSONPropertyValues" :
            var r = checkboxes[1].checked;
            $.cookie('cc_cp_align', r ? "1" : "0", { expires: 365 });
            return r;
        case "liveQuery" :
            var r = checkboxes[2].checked;
            $.cookie('cc_cp_live', r ? "1" : "0", { expires: 365 });
            return r;
        case "multilineErrorMessages" :
            var r = checkboxes[3].checked;
            $.cookie('cc_cp_multi', r ? "1" : "0", { expires: 365 });
            return r;
        case "extended" :
            var extended = this._getTab("envelope").find("input[name='extended']").attr("checked") ? 1 : 0;
            $.cookie('cc_cp_extended', extended, { expires: 365 });
            return extended;
    }
    return false;
};

CueCard.ControlPane.prototype.getJsonizingSettings = function(o) {
    o = o || {};
    o.indentCount = 2;
    o.alignFieldValues = this.getSetting("alignJSONPropertyValues");
    
    return o;
};

CueCard.ControlPane.prototype.getVariables = function() {
    var r = {};
    var table = this._getTab("variables").find('table')[0];
    for (var i = 1; i < table.rows.length; i++) {
        var tr = table.rows[i];
        var name = tr.cells[0].firstChild.value;
        var value = tr.cells[1].firstChild.value;
        try {
            value = JSON.parse(value);
        } catch (e) {
        }
        r[name] = value;
    }
    return r;
};

/** code-generation.js **/
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

CueCard.CodeGeneration = { serializers: {} };

CueCard.CodeGeneration.generate = function(queryJSON, serializer, options) {
    var result = "";
    
    var utils = {
        _variables: {},
        createVariable: function(prefix) {
            if (prefix in this._variables) {
                return prefix + this._variables[prefix]++;
            } else {
                this._variables[prefix] = 1;
                return prefix;
            }
        }
    };
    var qVar = utils.createVariable("q");
    var oVar = utils.createVariable("o");
    
    var context = new CueCard.SerializingContext(null);
    context.setProperty("indentString", "indentString" in options ? options.indentString : "  ");
    context.setProperty("indentLevel", "indentLevel" in options ? options.indentLevel : 0);
    context.setProperty("stream", {
        append: function(s) {
            result += s;
        }
    });
    serializer.prepareRootContext(context, options);
    
    var writer = new CueCard.IndentWriter(context);
    var resultExpr = serializer.generateQueryCall(context, writer, utils, queryJSON, options.variables, qVar, oVar);
    context.setProperty("start", function() {
        return resultExpr;
    });
    context.setProperty("stop", function() {
    });
    
    CueCard.CodeGeneration._processNode(queryJSON, serializer, context, writer, utils);
    
    return result;
};

CueCard.CodeGeneration._deriveElementName = function(type, context) {
    if (type == null) {
        var path = context.getProperty("path");
        if (path != null) {
            if (path.charAt(0) == "!") {
                var segments = path.substr(Math.max(path.indexOf(":") + 1, 1)).split("/");
                return segments[Math.max(0, segments.length - 2)];
            } else {
                var segments = path.substr(path.indexOf(":") + 1).split("/");
                return segments[segments.length - 1];
            }
        }
    } else {
        var segments = type.split("/");
        return segments[segments.length - 1];
    }

    return "entry";
};

CueCard.CodeGeneration._isImagePath = function(path) {
    if (path.charAt(0) == "!") {
        return false;
    }
    path = path.substr(path.indexOf(":") + 1);
    return path == "/common/topic/image" || path == "image";
};

CueCard.CodeGeneration._isImageNode = function(node) {
    if (node == null || typeof node != "object") {
        return false;
    }
    if (node instanceof Array) {
        if (node.length == 1 && typeof node[0] == "object") {
            node = node[0];
        } else {
            return false;
        }
    }
    
    for (var n in node) {
        if (n != "id" && n != "guid" && !CueCard.QueryNode.isMqlKeyword(n)) {
            return false;
        }
    }
    return true;
};

CueCard.CodeGeneration._processNode = function(node, serializer, context, writer, utils) {
    if (node == null) {
        var expr = context.getProperty("start")(true, false);
        serializer.outputSimpleFieldValue(expr, context, writer);
        context.getProperty("stop")(true, false);
    } else if (typeof node != "object") {
        // A constraint value
        return;
    } else if (node instanceof Array) {
        if (node.length == 0) {
            var elementName = CueCard.CodeGeneration._deriveElementName(null, context);
            var elementVar = utils.createVariable(elementName);
            var indexVar = utils.createVariable(elementName.charAt(0));
            
            var expr = context.getProperty("start")(false, false);
            serializer.openNodeArray(context, writer, utils, expr, elementVar, indexVar, "values");
            
            serializer.outputSimpleFieldValue(elementVar, context, writer);
            
            serializer.closeNodeArray(context, writer, utils, expr, elementVar, indexVar, "values");
            context.getProperty("stop")(false, false);
            
        } else if (node.length > 1 || typeof node[0] != "object" || "__identifier__" in node) {
            // An array of constraint values
            return;
        } else {
            var context2 = new CueCard.SerializingContext(context);
            context2.setProperty("in-array", true);
            
            arguments.callee(node[0], serializer, context2, writer, utils);
        }
    } else if (node["optional"] != "forbidden") {
        var type = null;
        
        var fieldCount = 0;
        for (var n in node) {
            if (node.hasOwnProperty(n) && n != "*" && !CueCard.QueryNode.isMqlKeyword(n)) {
                fieldCount++;
                
                var v = node[n];
                if (n.charAt(0) != "!") {
                    var n2 = n.substr(n.indexOf(":") + 1);
                    if (n2 == "type" || n2 == "/type/object/type") {
                        if (v != null && typeof v == "string") {
                            type = v;
                        }
                    }
                }
            }
        }
        
        CueCard.CodeGeneration._processTypedObjectNode(node, type, fieldCount, serializer, context, writer, utils);
    }
};

CueCard.CodeGeneration._processTypedObjectNode = function(node, type, fieldCount, serializer, context, writer, utils) {
    var expr = null;
    var elementVar = null;
    var indexVar = null;
    var start, stop;
    var optional = ("optional" in node && node.optional === true);
    
    function prepareVariables() {
        // This is only called when we really need it, or we will waste variable names.
        
        var elementName = CueCard.CodeGeneration._deriveElementName(type, context);
        elementVar = utils.createVariable(elementName);
        if (context.getProperty("in-array")) {
            indexVar = utils.createVariable(elementName.charAt(0));
        }
    };
    
    if (context.getProperty("in-array")) {
        var elementsAreObjects = (fieldCount > 0 && !("*" in node));
        var start = function() {
            if (expr == null) {
                expr = context.getProperty("start")(false, optional);
                prepareVariables();
                serializer.openNodeArray(context, writer, utils, expr, elementVar, indexVar, elementsAreObjects ? "fields" : "object");
            }
            return elementVar;
        };
        var stop = function() {
            if (expr != null) {
                serializer.closeNodeArray(context, writer, utils, expr, elementVar, indexVar, elementsAreObjects ? "fields" : "object");
                context.getProperty("stop")(false, optional);
            }
        };
    } else {
        var start = function() {
            if (expr == null) {
                expr = context.getProperty("start")(false, optional);
                prepareVariables();
                serializer.openNode(context, writer, utils, expr, elementVar);
            }
            return elementVar;
        };
        var stop = function() {
            if (expr != null) {
                serializer.closeNode(context, writer, utils, expr, elementVar);
                context.getProperty("stop")(false, optional);
            }
        };
    }
    
    if (fieldCount == 0 || "*" in node) {
        serializer.generateEmptyObjectNode(context, writer, utils, start());
    } else {
        for (var n in node) {
            if (node.hasOwnProperty(n) && n != "*" && !CueCard.QueryNode.isMqlKeyword(n)) {
                var v = node[n];
                if (CueCard.CodeGeneration._isImagePath(n) && CueCard.CodeGeneration._isImageNode(v)) {
                    serializer.generateImageField(context, writer, utils, n, v, start);
                } else {
                    var context2 = serializer.createFieldContext(context, writer, utils, n, start);
                    context2.setProperty("path", n);
                    
                    CueCard.CodeGeneration._processNode(v, serializer, context2, writer, utils);
                }
            }
        }
        if ("*" in node) {
            var v = node["*"];
            var context2 = serializer.openWildcardField(context, writer, utils, start, v);
            
            CueCard.CodeGeneration._processNode(v, serializer, context2, writer, utils);
            
            serializer.closeWildcardField(context, writer, utils, start, v);
        }
    }
    stop();
};

CueCard.CodeGeneration.serializers["acre-template"] = {
    prepareRootContext: function(context, options) {
        
    },
    generateQueryCall: function(context, writer, utils, queryJSON, variables, qVar, oVar) {
        writer.appendIndent(); writer.append("<acre:script>"); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('var ' + qVar + ' = ');
            CueCard.jsonize(queryJSON, { context: context, variables: variables, resolveVariables: false });
            writer.append(";"); writer.appendLineBreak();
        writer.appendIndent(); writer.appendLineBreak();
        writer.appendIndent(); writer.append('var ' + oVar + ' = acre.freebase.mqlread(' + qVar +');'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append("</acre:script>"); writer.appendLineBreak();
        
        return oVar + ".result";
    },
    outputSimpleFieldValue: function(expression, context, writer) {
        writer.append("${" + expression + "}");
    },
    openNodeArray: function(context, writer, utils, expr, elementVar, indexVar, mode) {
        writer.appendLineBreak();
        
        writer.appendIndent(); writer.append('<ul acre:if="' + expr + '.length != 0">'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<li acre:for="' + indexVar + ', ' + elementVar + ' in ' + expr + '">');
        if (mode == "fields") {
            writer.append('<table>');
        }
        if (mode == "fields" || mode == "object") {
            writer.appendLineBreak();
            writer.indent();
        }
    },
    closeNodeArray: function(context, writer, utils, expr, elementVar, indexVar, mode) {
        if (mode == "fields" || mode == "object") {
            writer.unindent();
            writer.appendIndent();
        }
        if (mode == "fields") {
            writer.append('</table>');
        }
        writer.append('</li>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</ul>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<div acre:else=""><ins>[no element]</ins></div>'); writer.appendLineBreak();
        
        writer.appendLineBreak();
    },
    openNode: function(context, writer, utils, expr, elementVar) {
        writer.appendIndent(); writer.append('<acre:script>var ' + elementVar + ' = ' + expr + ';</acre:script>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<table>'); writer.appendLineBreak();
        writer.indent();
    },
    closeNode: function(context, writer, utils, expr, elementVar) {
        writer.unindent();
        writer.appendIndent(); writer.append('</table>'); writer.appendLineBreak();
    },
    createFieldContext: function(context, writer, utils, fieldPath, start) {
        var context2 = new CueCard.SerializingContext(context);
        context2.setProperty("in-array", false);
        context2.setProperty("start", function(valueIsSimple, optional) {
            var objectVar = start();
            
            writer.appendIndent(); writer.append('<tr><th>' + fieldPath + ':</th>'); writer.appendLineBreak();
            writer.indent();
            
            writer.appendIndent(); writer.append('<td' + 
                (optional ? ' acre:if="\'' + fieldPath + '\' in ' + objectVar + ' && ' + objectVar + '[\'' + fieldPath + '\'] != null"' : '') +
                '>');
            if (!valueIsSimple) {
                writer.appendLineBreak();
                writer.indent();
            }
            return objectVar + '[\'' + fieldPath + '\']';
        });
        context2.setProperty("stop", function(valueIsSimple, optional) {
            if (!valueIsSimple) {
                writer.unindent();
                writer.appendIndent(); 
            }
            writer.append('</td>'); writer.appendLineBreak();
            if (optional) {
                writer.appendIndent(); writer.append('<td acre:else=""><ins>[no value]</ins></td>'); writer.appendLineBreak();
            }
            
            writer.unindent();
            writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
        });
        
        return context2;
    },
    generateImageField: function(context, writer, utils, fieldPath, queryNode, start) {
        var objectVar = start();
        var expr = objectVar + '[\'' + fieldPath + '\']';
        
        writer.appendIndent(); writer.append('<tr><th>' + fieldPath + ':</th>'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<td acre:if="\'' + fieldPath + '\' in ' + objectVar + ' && ' + expr + ' != null">'); writer.appendLineBreak();
        writer.indent();
        
        var multiple = (queryNode instanceof Array);
        
        writer.appendIndent();
        if (multiple) {
            queryNode = queryNode[0];
            
            var imageNodeVar = utils.createVariable("image");
            var imageIndexVar = utils.createVariable("i");
            var fieldExpr = ("guid" in queryNode) ? ('/guid/' + '${' + imageNodeVar + ".guid.substr(1)}") : ('${' + imageNodeVar + '.id}');
            
            writer.append(
                '<img acre:for="' + imageIndexVar + ', ' + imageNodeVar + ' in ' + expr + '" ' +
                    'src="${acre.environ.freebase_service_url}/api/trans/image_thumb' + fieldExpr + '?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100" /></td>');
        } else {
            var fieldExpr = ("guid" in queryNode) ? ('/guid/' + '${' + expr + ".guid.substr(1)}") : ('${' + expr + '.id}');
            writer.append(
                '<img src="${acre.environ.freebase_service_url}/api/trans/image_thumb' + fieldExpr + '?mode=fillcrop&amp;maxwidth=100&amp;maxheight=100" /></td>');
        }
        writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('<td acre:else=""><ins>[no image]</ins></td>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
    },
    openWildcardField: function(context, writer, utils, start, valueNode) {
        var objectVar = start();
        var fieldVar = utils.createVariable("field");
        var valueVar = utils.createVariable("value");
        
        writer.appendIndent(); writer.append('<tr acre:for="' + fieldVar + ', ' + valueVar + ' in ' + objectVar + '"><td>${' + fieldVar + '}:</td>'); writer.appendLineBreak();
        writer.indent();
        
        var fieldValueExpr = valueVar;
        
        var context2 = new CueCard.SerializingContext(context);
        context2.setProperty("in-array", false);
        context2.setProperty("start", function(valueIsSimple, optional) {
            writer.appendIndent(); writer.append('<td>');
            if (!valueIsSimple) {
                writer.appendLineBreak();
                writer.indent();
            }
            return fieldValueExpr;
        });
        context2.setProperty("stop", function(valueIsSimple, optional) {
            if (!valueIsSimple) {
                writer.unindent();
                writer.appendIndent(); 
            }
            writer.append('</td>'); writer.appendLineBreak();
        });
        
        return context2;
    },
    closeWildcardField: function(context, writer, utils, start, valueNode) {
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
    },
    generateEmptyObjectNode: function(context, writer, utils, expr) {
        var fieldVar = utils.createVariable("field");
        var valueVar = utils.createVariable("value");
        
        writer.appendIndent(); writer.append('<table>'); writer.appendLineBreak();
        writer.indent();

        var fieldValueExpr = valueVar;
        writer.appendIndent(); writer.append('<tr acre:for="' + fieldVar + ', ' + valueVar + ' in ' + expr + '">' +
            '<th>${' + fieldVar + '}:</th>'); writer.appendLineBreak();
        writer.indent();
        
        writer.appendIndent(); writer.append('<td acre:if="' + fieldValueExpr + ' instanceof Array">${' + fieldValueExpr + '.join(\', \')}</td>'); writer.appendLineBreak();
        writer.appendIndent(); writer.append('<td acre:else="">${' + fieldValueExpr + '}</td>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</tr>'); writer.appendLineBreak();
        
        writer.unindent();
        writer.appendIndent(); writer.append('</table>'); writer.appendLineBreak();
    }
};


/** examples.js **/
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

CueCard.ExampleTechniques = [
    "all",
    "basic",
    "sorting",
    "text search",
    "range constraint",
    "date query",
    "multiple constraints on same property",
    "limiting number of results",
    "geographic location",
    "compound value type (CVT)",
    "schema inspection",
    "attribution",
    "adding data"
];

CueCard.Examples = [
    {   name: "Vietnamese restaurants in Aspen, Colorado",
        query: [{
            "/business/business_location/address" : {
              "citytown" : "Aspen",
              "state_province_region" : "Colorado"
            },
            "cuisine" : "Vietnamese",
            "name" : null,
            "id" : null,
            "type" : "/dining/restaurant"
        }],
        techniques: [ "basic", "geographic location" ]
    },
    {   name: "Properties of /music/artist",
        query: [{
            "id" : "/music/artist",
            "properties" : [{}],
            "type" : "/type/type"
        }],
        techniques: [ "schema inspection" ]
    },
    {   name: "All types created by the user jamie",
        query: [{
            "creator" : "/user/jamie",
            "name" : null,
            "id" : null,
            "type" : "/type/type"
        }],
        techniques: [ "attribution" ]
    },
    {   name: "Cloud classifications sorted by name",
        query: [{
            "clouds" : [],
            "name" : null,
            "id" : null,
            "sort" : "name",
            "type" : "/meteorology/cloud_classification"
        }],
        techniques: [ "basic", "sorting" ]
    },
    {   name: "U.S. states containing cities whose names start with 'Blue' or 'Red'",
        query: [{
            "a:contains" : [{
                "name" : null,
                "id" : null,
                "name~=" : "^Red",
                "type" : "/location/citytown"
            }],
            "b:contains" : [{
                "name" : null,
                "id" : null,
                "name~=" : "^Blue",
                "type" : "/location/citytown"
            }],
            "b:type" : "/location/us_state",
            "name" : null,
            "id" : null,
            "type" : "/location/location"
        }],
        techniques: [ "text search", "multiple constraints on same property" ]
    },
    {   name: "2 of The Police's albums and their tracks",
        query: {
          "album" : [{
              "id" : null,
              "limit" : 2,
              "name" : null,
              "track" : []
          }],
          "id" : null,
          "name" : "The Police",
          "type" : "/music/artist"
        },
        techniques: [ "basic", "limiting number of results" ]
    },
    {   name: "25 Songs with the word 'love' in their titles, with release date, album and artist",
        query: [{
            "album" : {
              "artist" : [],
              "name" : null,
              "id" : null,
              "release_date" : null
            },
            "limit" : 25,
            "name" : null,
            "name~=" : "Love*",
            "type" : "/music/track"
        }],
        techniques: [ "text search", "limiting number of results", "date query" ]
    },
    {   name: "Films starring both Joe Pesci and Robert de Niro, showing their full cast",
        query: [{
            "a:starring" : [{
                "actor" : "Joe Pesci"
            }],
            "b:starring" : [{
                "actor" : "Robert de Niro"
            }],
            "name" : null,
            "id" : null,
            "starring" : [{
                "actor" : null
            }],
            "type" : "/film/film"
        }],
        techniques: [ "multiple constraints on same property", "compound value type (CVT)" ]
    },
    {   name: "32 actors born in the 1960s, with two films of each actor",
        query: [{
            "/people/person/date_of_birth" : null,
            "/people/person/date_of_birth<" : "1970",
            "/people/person/date_of_birth>=" : "1960",
            "film" : [{
                "film" : null,
                "id" : null,
                "limit" : 2
            }],
            "limit" : 35,
            "name" : null,
            "id" : null,
            "type" : "/film/actor"
        }],
        techniques: [ "multiple constraints on same property", "date query", "limiting number of results", "range constraint" ]
    },
    {   name: "Directors who have directed both Parker Posey and any actor named Robert (in possibly different films)",
        query: [{
            "a:film" : [{
                "name" : null,
                "id" : null,
                "starring" : {
                  "actor" : "Parker Posey"
                }
            }],
            "b:film" : [{
                "name" : null,
                "id" : null,
                "starring" : {
                  "actor" : null,
                  "actor~=" : "Robert*"
                }
            }],
            "name" : null,
            "id" : null,
            "type" : "/film/director"
        }],
        techniques: [ "multiple constraints on same property", "text search", "compound value type (CVT)" ]
    },
    {   name: "Music artists with albums containing a track called 'One Tree Hill'",
        query: [{
            "album" : [{
                "name" : null,
                "id" : null,
                "track" : [{
                    "length" : null,
                    "name" : "One Tree Hill"
                }]
            }],
            "name" : null,
            "id" : null,
            "type" : "/music/artist"
        }],
        techniques: [ "compound value type (CVT)", "basic" ]
    },
    {   name: "Everything about 'Jimi Hendrix'",
        query: {
          "*" : null,
          "name" : "Jimi Hendrix",
          "type" : "/music/artist"
        },
        techniques: [ "basic" ]
    },
    {   name: "Kevin Bacon's films, with cast, producers, music, etc.",
        query: [{
            "film" : [{
                "film" : {
                  "imdb_id" : [],
                  "music" : [],
                  "name" : null,
                  "id" : null,
                  "produced_by" : [],
                  "starring" : [{
                      "actor" : [{}]
                  }],
                  "type" : []
                }
            }],
            "name" : "Kevin Bacon",
            "type" : "/film/actor"
        }],
        techniques: [ "basic", "compound value type (CVT)" ]
    },
    {   name: "When 'Star Wars Episode IV' was added to the database, and by whom",
        query: [{
            "creator" : null,
            "id" : "/wikipedia/en/Star_Wars_Episode_IV",
            "name" : null,
            "timestamp" : null,
            "type" : "/film/film"
        }],
        techniques: [ "attribution" ]
    },
    {   name: "Tracks on Synchronicity longer than 300 seconds",
        query: [{
            "artist" : "The Police",
            "name" : "Synchronicity",
            "track" : [{
                "length" : null,
                "length>" : 300,
                "name" : null
            }],
            "type" : "/music/album"
        }],
        techniques: [ "range constraint" ]
    },
    {   name: "Properties of a particular type (/government/politician)",
        query: {
          "id" : "/government/politician",
          "properties" : [],
          "type" : "/type/type"
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Properties of a particular property (/type/object/name)",
        query: {
          "*" : null,
          "id" : "/type/object/name",
          "type" : "/type/property"
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Types in a particular domain (/music)",
        query: {
          "id" : "/music",
          "type" : "/type/domain",
          "types" : []
        },
        techniques: [ "schema inspection" ]
    },
    {   name: "Creating a new topic given a name and a type",
        query: {
          "create" : "unless_exists",
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "guid" : null
        },
        techniques: [ "adding data" ]
    },
    {   name: "Setting a basic unique property to a topic",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "basic_property" : {
            "value" : 42,
            "connect" : "update"
          }
        },
        techniques: [ "adding data" ]
    },
    {   name: "Connecting one topic to another",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "link_to_topic" : {
            "name" : "Test Object 2",
            "type" : "/base/mqlexamples/testobject",
            "id" : null,
            "connect" : "insert"
          }
        },
        techniques: [ "adding data" ]
    },
    {   name: "Deleting a link between two topics",
        query: {
          "name" : "Test Object 1",
          "type" : "/base/mqlexamples/testobject",
          "id" : null,
          "link_to_topic" : {
            "name" : "Test Object 2",
            "type" : "/base/mqlexamples/testobject",
            "id" : null,
            "connect" : "delete"
          }
        },
        techniques: [ "adding data" ]
    }
];

CueCard.ExampleTechniqueMap = {
    "all" : []
};

for (var i=0; i < CueCard.Examples.length; i++) {
    var example = CueCard.Examples[i];
    CueCard.ExampleTechniqueMap["all"].push(i);
    for (var x = 0; x < example.techniques.length; x++) {
        var technique = example.techniques[x];
        if (technique in CueCard.ExampleTechniqueMap) {
            CueCard.ExampleTechniqueMap[technique].push(i);
        } else {
            CueCard.ExampleTechniqueMap[technique] = [ i ];
        }
    }
}
/** languages.js **/
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

CueCard.Languages = [
    { name: "Afrikaans", id: "/lang/af" },
    { name: "Akkadian", id: "/lang/kk" },
    { name: "Albanian", id: "/lang/sq" },
    { name: "Amharic", id: "/lang/am" },
    { name: "Arabic", id: "/lang/ar" },
    { name: "Armenian", id: "/lang/hy" },
    { name: "Artificial", id: "/lang/art" },
    { name: "Asturian", id: "/lang/ast" },
    { name: "Australian languages", id: "/lang/aus" },
    { name: "Azerbaijani", id: "/lang/az" },
    { name: "Balinese", id: "/lang/ban" },
    { name: "Bambara", id: "/lang/bm" },
    { name: "Bantu", id: "/lang/bnt" },
    { name: "Basque", id: "/lang/eu" },
    { name: "Batak", id: "/lang/btk" },
    { name: "Belarusian", id: "/lang/be" },
    { name: "Bengali", id: "/lang/bn" },
    { name: "Bhojpuri", id: "/lang/bho" },
    { name: "Bosnian", id: "/lang/bs" },
    { name: "Breton", id: "/lang/br" },
    { name: "Bulgarian", id: "/lang/bg" },
    { name: "Buriat", id: "/lang/bua" },
    { name: "Catalan", id: "/lang/ca" },
    { name: "Cebuano", id: "/lang/ceb" },
    { name: "Cherokee", id: "/lang/chr" },
    { name: "Chichewa", id: "/lang/ny" },
    { name: "Chinese", id: "/lang/zh" },
    { name: "Cornish", id: "/lang/kw" },
    { name: "Corsican", id: "/lang/co" },
    { name: "Cree", id: "/lang/cr" },
    { name: "Creoles", id: "/lang/cpf" },
    { name: "Croatian", id: "/lang/hr" },
    { name: "Czech", id: "/lang/cs" },
    { name: "Danish", id: "/lang/da" },
    { name: "Duala", id: "/lang/dua" },
    { name: "Dutch", id: "/lang/nl" },
    { name: "English", id: "/lang/en" },
    { name: "Esperanto", id: "/lang/eo" },
    { name: "Estonian", id: "/lang/et" },
    { name: "Faroese", id: "/lang/fo" },
    { name: "Filipino", id: "/lang/fil" },
    { name: "Finnish", id: "/lang/fi" },
    { name: "French", id: "/lang/fr" },
    { name: "Frisian", id: "/lang/fy" },
    { name: "Friulian", id: "/lang/fur" },
    { name: "Fulah", id: "/lang/ff" },
    { name: "Ga", id: "/lang/gaa" },
    { name: "Gaelic", id: "/lang/gd" },
    { name: "Gallegan", id: "/lang/gl" },
    { name: "Georgian", id: "/lang/ka" },
    { name: "German", id: "/lang/de" },
    { name: "Germanic", id: "/lang/gem" },
    { name: "Greek", id: "/lang/el" },
    { name: "Guarani", id: "/lang/gn" },
    { name: "Haitian", id: "/lang/ht" },
    { name: "Hausa", id: "/lang/ha" },
    { name: "Hawaiian", id: "/lang/haw" },
    { name: "Hebrew", id: "/lang/he" },
    { name: "Hindi", id: "/lang/hi" },
    { name: "Hungarian", id: "/lang/hu" },
    { name: "Icelandic", id: "/lang/is" },
    { name: "Indonesian", id: "/lang/id" },
    { name: "Inuktitut", id: "/lang/ku" },
    { name: "Inuktitut", id: "/lang/iu" },
    { name: "Irish", id: "/lang/ga" },
    { name: "Italian", id: "/lang/it" },
    { name: "Japanese", id: "/lang/ja" },
    { name: "Judeo-Arabic", id: "/lang/jrb" },
    { name: "Kalaallisut", id: "/lang/kl" },
    { name: "Khmer", id: "/lang/km" },
    { name: "Kinyarwanda", id: "/lang/rw" },
    { name: "Klingon", id: "/lang/tlh" },
    { name: "Kongo", id: "/lang/kg" },
    { name: "Korean", id: "/lang/ko" },
    { name: "Ladino", id: "/lang/lad" },
    { name: "Latin", id: "/lang/la" },
    { name: "Latvian", id: "/lang/lv" },
    { name: "Limburgan", id: "/lang/li" },
    { name: "Lingala", id: "/lang/ln" },
    { name: "Lithuanian", id: "/lang/lt" },
    { name: "Low German", id: "/lang/nds" },
    { name: "Luxembourgish", id: "/lang/lb" },
    { name: "Macedonian", id: "/lang/mk" },
    { name: "Malagasy", id: "/lang/mg" },
    { name: "Malay", id: "/lang/ms" },
    { name: "Malayalam", id: "/lang/ml" },
    { name: "Maltese", id: "/lang/mt" },
    { name: "Mandingo", id: "/lang/man" },
    { name: "Manx", id: "/lang/gv" },
    { name: "Maori", id: "/lang/mi" },
    { name: "Marathi", id: "/lang/mr" },
    { name: "Mohawk", id: "/lang/moh" },
    { name: "Moldavian", id: "/lang/mo" },
    { name: "Mongolian", id: "/lang/mn" },
    { name: "Nahuatl", id: "/lang/nah" },
    { name: "Navajo", id: "/lang/nv" },
    { name: "Neapolitan", id: "/lang/nap" },
    { name: "Nepali", id: "/lang/ne" },
    { name: "Norse,", id: "/lang/non" },
    { name: "Northern Sami", id: "/lang/se" },
    { name: "Norwegian", id: "/lang/no" },
    { name: "Norwegian Nynorsk", id: "/lang/nn" },
    { name: "Occitan", id: "/lang/oc" },
    { name: "Panjabi", id: "/lang/pa" },
    { name: "Papiamento", id: "/lang/pap" },
    { name: "Persian", id: "/lang/fa" },
    { name: "Polish", id: "/lang/pl" },
    { name: "Portuguese", id: "/lang/pt" },
    { name: "Pushto", id: "/lang/ps" },
    { name: "Quechua", id: "/lang/qu" },
    { name: "Raeto-Romance", id: "/lang/rm" },
    { name: "Romanian", id: "/lang/ro" },
    { name: "Romany", id: "/lang/rom" },
    { name: "Russian", id: "/lang/ru" },
    { name: "Sakha", id: "/lang/sah" },
    { name: "Sanskrit", id: "/lang/sa" },
    { name: "Sardinian", id: "/lang/sc" },
    { name: "Scots", id: "/lang/sco" },
    { name: "Serbian", id: "/lang/sr" },
    { name: "Shona", id: "/lang/sn" },
    { name: "Sicilian", id: "/lang/scn" },
    { name: "Slovak", id: "/lang/sk" },
    { name: "Slovenian", id: "/lang/sl" },
    { name: "Songhai", id: "/lang/son" },
    { name: "Spanish", id: "/lang/es" },
    { name: "Sundanese", id: "/lang/su" },
    { name: "Swahili", id: "/lang/sw" },
    { name: "Swedish", id: "/lang/sv" },
    { name: "Syriac", id: "/lang/syr" },
    { name: "Tagalog", id: "/lang/tl" },
    { name: "Tahitian", id: "/lang/ty" },
    { name: "Tajik", id: "/lang/tg" },
    { name: "Tamashek", id: "/lang/tmh" },
    { name: "Tamil", id: "/lang/ta" },
    { name: "Telugu", id: "/lang/te" },
    { name: "Thai", id: "/lang/th" },
    { name: "Tibetan", id: "/lang/bo" },
    { name: "Tonga", id: "/lang/to" },
    { name: "Turkish", id: "/lang/tr" },
    { name: "Turkmen", id: "/lang/tk" },
    { name: "Tuvinian", id: "/lang/tyv" },
    { name: "Ukrainian", id: "/lang/uk" },
    { name: "Urdu", id: "/lang/ur" },
    { name: "Uzbek", id: "/lang/uz" },
    { name: "Vietnamese", id: "/lang/vi" },
    { name: "Welsh", id: "/lang/cy" },
    { name: "Wolof", id: "/lang/wo" },
    { name: "Xhosa", id: "/lang/xh" },
    { name: "Yiddish", id: "/lang/yi" },
    { name: "Yoruba", id: "/lang/yo" },
    { name: "Zulu", id: "/lang/zu" }
];
/** x-metaweb-costs.js **/
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

CueCard.XMetawebCosts = {
    'tu': { meaning: 'time/user', subsystem: 'graphd' },
    'ts': { meaning: 'time/system', subsystem: 'graphd' },
    'tr': { meaning: 'time/real', subsystem: 'graphd' },
    'te': { meaning: 'time/overall', subsystem: 'graphd' },
    'pr': { meaning: 'page reclaims', subsystem: 'graphd' },
    'pf': { meaning: 'page faults', subsystem: 'graphd' },
    'dw': { meaning: 'primitive data writes', subsystem: 'graphd' },
    'dr': { meaning: 'primitive data reads', subsystem: 'graphd' },
    'in': { meaning: 'index size reads', subsystem: 'graphd' },
    'ir': { meaning: 'index element reads', subsystem: 'graphd' },
    'iw': { meaning: 'index element write', subsystem: 'graphd' },
    'va': { meaning: 'value allocation', subsystem: 'graphd' },
    
    'dt': { meaning: 'total time spent in the session', subsystem: 'client/me' },
    'mr': { meaning: 'number of mql requests (independent of caches)', subsystem: 'client/me' },
    'ch': { meaning: 'cache/hit (memcache, not Squid)', subsystem: 'client/me', important: true },
    'cm': { meaning: 'cache/miss (memcache, not Squid)', subsystem: 'client/me' },
    'cr': { meaning: 'cache/read (memcache, not Squid)', subsystem: 'client/me' },
    'cs': { meaning: 'cache skip (browser shift+reload skips memcache)', subsystem: 'client/me' },
    'lh': { meaning: 'lojson-cache/hit', subsystem: 'client/me' },
    'lm': { meaning: 'lojson-cache/miss', subsystem: 'client/me' },
    'lr': { meaning: 'lojson-cache/read', subsystem: 'client/me' },
    'nreqs': { meaning: 'graph requests', subsystem: 'client/me', important: true },
    'tf': { meaning: 'time/formatted', subsystem: 'client/me' },
    'tg': { meaning: 'time/graph', subsystem: 'client/me', important: true },
    'rt': { meaning: 'relevance/time', subsystem: 'client/me' },
    'cc': { meaning: 'cpu time (utime + stime)', subsystem: 'client/me' },
    'mcu': { meaning: 'mql user time', subsystem: 'client/me' },
    'mcs': { meaning: 'mql system time', subsystem: 'client/me' },
    'tm': { meaning: 'mql real time', subsystem: 'client/me', important: true },
    'utime': { meaning: 'time in user mode (float)', subsystem: 'client/me' },
    'stime': { meaning: 'time in system mode (float)', subsystem: 'client/me' },
    'maxrss': { meaning: 'maximum resident set size', subsystem: 'client/me' },
    'ixrss': { meaning: 'shared memory size', subsystem: 'client/me' },
    'idrss': { meaning: 'unshared memory size', subsystem: 'client/me' },
    'isrss': { meaning: 'unshared stack size', subsystem: 'client/me' },
    'minflt': { meaning: 'page faults not requiring I/O', subsystem: 'client/me' },
    'majflt': { meaning: 'page faults requiring I/O', subsystem: 'client/me' },
    'nswap': { meaning: 'number of swap outs', subsystem: 'client/me' },
    'inblock': { meaning: 'block input operations', subsystem: 'client/me' },
    'oublock': { meaning: 'block output operations', subsystem: 'client/me' },
    'msgsnd': { meaning: 'messages sent', subsystem: 'client/me' },
    'msgrcv': { meaning: 'messages received', subsystem: 'client/me' },
    'nsignals': { meaning: 'signals received', subsystem: 'client/me' },
    'nvcsw': { meaning: 'voluntary context switches', subsystem: 'client/me' },
    'nivcsw': { meaning: 'involuntary context switches', subsystem: 'client/me' },
    'br': { meaning: 'number of blob requests', subsystem: 'client/me' },
    'bctn': { meaning: 'cdb thumbnail time - from blobclient POV', subsystem: 'client/me' },
    
    'rt': { meaning: 'relevance/time (FIX: same name, different semantics?)', subsystem: 'gix' },
    'pt': { meaning: 'postgres time', subsystem: 'gix' },
    'qt': { meaning: 'actual postgres query time', subsystem: 'gix' },
    'ct': { meaning: 'postgres connect time', subsystem: 'gix' },
    'mt': { meaning: 'MQL time', subsystem: 'gix' },
    
    'tt': { meaning: 'total time', subsystem: 'other' },
    'mt': { meaning: 'total MQL time: mql_output + mql_filter', subsystem: 'other' },
    'mft': { meaning: 'MQL filter time (total time, ie. not per invocation)', subsystem: 'other' },
    'mfc': { meaning: 'number of mql_filter invocations', subsystem: 'other' },
    
    'sh': { meaning: 'squid/hit', subsystem: 'cache' },
    'st': { meaning: 'squid/total time', subsystem: 'cache' },
    'so': { meaning: 'squid/origin server time', subsystem: 'cache' }
};
/** dialogs **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/dialogs', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
// mjt.def=acre_template(t)
var acre_template = function (t) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 
                                                  //   <div class="modal-inner">
                                                  //     <h1 class="modal-title">
                                                  //       <span>Generated Acre Template</span>
                                                  //     </h1>
                                                  //     <div class="modal-content">
                                                  //       <textarea id="template-code" wrap="off">
__m[__n++]=t;
__m[__n++]=__ts[2];                               // </textarea>
                                                  //     </div>
                                                  //   </div>
                                                  //   <div class="modal-buttons">
                                                  //     <button class="button button-cancel">OK</button>
                                                  //   </div>
return __m;
};
acre_template = __pkg.runtime.tfunc_factory("acre_template(t)", acre_template, __pkg, undefined, false);
exports.acre_template = acre_template;
acre_template.source_microdata = null;
__m[__n++]=__ts[3];                               // 
// mjt.def=examples(opts)
var examples = function (opts) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[4];                               // 
// mjt.def=list_techniques(selected_technique)
var list_techniques = function (selected_technique) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[5];                               // 
__pkg.runtime.foreach(this, (CueCard.ExampleTechniques), function (technique_index_1, technique) {
var once_1 = 1;
while (once_1) {
__m[__n++]=__ts[6];                               // 
                                                  //     <a class="
__m[__n++]=__pkg.runtime.make_attr_safe((technique === selected_technique) ? 'cuecard-examples-technique-selected' : 'cuecard-examples-technique');
__m[__n++]=__ts[7];                               // " href="javascript:selectTechnique('
__m[__n++]=__pkg.runtime.make_attr_safe(technique);
__m[__n++]=__ts[8];                               // ')">
                                                  //       
__m[__n++]=technique;
__m[__n++]=__ts[9];                               //  (
__m[__n++]=(CueCard.ExampleTechniqueMap[technique].length);
__m[__n++]=__ts[10];                              // )
                                                  //     </a>
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[11];                              // 
return __m;
};
list_techniques = __pkg.runtime.tfunc_factory("list_techniques(selected_technique)", list_techniques, __pkg, undefined, false);
list_techniques.source_microdata = null;
__m[__n++]=__ts[12];                              // 
// mjt.def=list_examples(technique)
var list_examples = function (technique) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[13];                              // 
__pkg.runtime.foreach(this, (CueCard.Examples), function (index, example) {
var once_2 = 1;
while (once_2) {
if (((technique !== 'all') ? (example.techniques.indexOf(technique) !== -1) : true)) {
__m[__n++]=__ts[14];                              // 
                                                  //     <a class="cuecard-examples-example" href="javascript:selectExample('
__m[__n++]=__pkg.runtime.make_attr_safe(index);
__m[__n++]=__ts[15];                              // ')" id="cuecard-example-
__m[__n++]=__pkg.runtime.make_attr_safe(index);
__m[__n++]=__ts[16];                              // ">
                                                  //       
__m[__n++]=example.name;
__m[__n++]=__ts[17];                              // 
                                                  //     </a>
}
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[18];                              // 
return __m;
};
list_examples = __pkg.runtime.tfunc_factory("list_examples(technique)", list_examples, __pkg, undefined, false);
list_examples.source_microdata = null;
__m[__n++]=__ts[19];                              // 
                                                  // 
                                                  //   <div class="modal-inner">
                                                  //     <h1 class="modal-title">
                                                  //       <span>Examples</span>
                                                  //     </h1>
                                                  //     <div class="modal-content" id="cuecard-examples-dialog">
                                                  //       <div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-0">Techniques</div>
                                                  //       <div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-1">Examples</div>
                                                  //       <div class="cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-2">Query</div>
                                                  //       <div class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-0"></div>
                                                  //       <div class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-1"></div>
                                                  //       <textarea class="cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-2 cuecard-examples-query" readonly="true" wrap="off">
                                                  //     </textarea></div>
                                                  //   </div>
                                                  //   
                                                  //   <div class="modal-buttons">
                                                  //     <button class="button button-submit" id="examples-submit" type="submit">Paste &amp; Run</button>
                                                  //     <button class="button button-cancel">Cancel</button>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    var height = $("#dialog-examples").height() - $("#dialog-examples .modal-title").height() - $("#dialog-examples .modal-buttons").height();
    $("#cuecard-examples-dialog").height(height - 50);
  
    selectTechnique = function(technique) {
      technique = technique || 'all';
      $(".cuecard-examples-dialog-columnBody.cuecard-examples-dialog-column-0").acre(list_techniques(technique));
      $(".cuecard-examples-dialog-columnBody.cuecard-examples-dialog-column-1").acre(list_examples(technique));
      return false;
    }
  
    selectExample = function(index) {
      $(".cuecard-examples-example").removeClass("cuecard-examples-example-selected");
      $("#cuecard-example-" + index).addClass("cuecard-examples-example-selected");
      $("#cuecard-examples-dialog").find("textarea").val(CueCard.jsonize(CueCard.Examples[index].query, { indentCount: 2 }));
      return false;
    }
  
    selectTechnique();
    
    $("#examples-submit").click(function(){
      var q = $('#cuecard-examples-dialog').find('textarea').val();
      opts.onDone(q);
    });
  
}, this);
__m[__n++]=__ts[20];                              // 
return __m;
};
examples = __pkg.runtime.tfunc_factory("examples(opts)", examples, __pkg, undefined, false);
exports.examples = examples;
examples.source_microdata = null;
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/dialogs","stringtable":["","\n  <div class=\"modal-inner\">\n    <h1 class=\"modal-title\">\n      <span>Generated Acre Template</span>\n    </h1>\n    <div class=\"modal-content\">\n      <textarea id=\"template-code\" wrap=\"off\">","</textarea>\n    </div>\n  </div>\n  <div class=\"modal-buttons\">\n    <button class=\"button button-cancel\">OK</button>\n  </div>","","","","\n    <a class=\"","\" href=\"javascript:selectTechnique('","')\">\n      "," (",")\n    </a>","","","","\n    <a class=\"cuecard-examples-example\" href=\"javascript:selectExample('","')\" id=\"cuecard-example-","\">\n      ","\n    </a>","","\n\n  <div class=\"modal-inner\">\n    <h1 class=\"modal-title\">\n      <span>Examples</span>\n    </h1>\n    <div class=\"modal-content\" id=\"cuecard-examples-dialog\">\n      <div class=\"cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-0\">Techniques</div>\n      <div class=\"cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-1\">Examples</div>\n      <div class=\"cuecard-examples-dialog-columnHeader cuecard-examples-dialog-column-2\">Query</div>\n      <div class=\"cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-0\"></div>\n      <div class=\"cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-1\"></div>\n      <textarea class=\"cuecard-examples-dialog-columnBody cuecard-examples-dialog-column-2 cuecard-examples-query\" readonly=\"true\" wrap=\"off\">\n    </textarea></div>\n  </div>\n  \n  <div class=\"modal-buttons\">\n    <button class=\"button button-submit\" id=\"examples-submit\" type=\"submit\">Paste &amp; Run</button>\n    <button class=\"button button-cancel\">Cancel</button>\n  </div>",""],"debug_locs":[1,1,1,1,1,1,6,6,6,6,12,12,12,12,12,12,12,12,18,18,18,18,18,18,18,18,18,18,18,20,20,20,20,22,22,22,22,24,24,24,24,24,24,24,24,24,25,25,25,25,25,26,26,26,26,26,26,27,27,27,27,27,29,29,29,29,31,31,31,31,31,31,31,31,31,31,32,32,32,33,33,33,33,33,33,33,34,34,34,34,34,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,81,81,81,81,81,81,81,81],"output_mode":"html"}}
});
}

/** query-editor **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/query-editor', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
// mjt.def=query_editor(queryEditor, codeMirrorOptions)
var query_editor = function (queryEditor, codeMirrorOptions) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 
                                                  // 
                                                  //   <div class="cuecard-queryEditor-inner">
                                                  //     <div class="cuecard-queryEditor-controls-top">
                                                  //       <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                                  //         <td class="cuecard-queryEditor-controls-leftAligned">
var onclick_cb_1 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_1] = function (event) {
queryEditor._showExamples()}
__m[__n++]=__ts[2];                               // 
                                                  //           <button class="button cuecard-queryEditor-examples" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_1);
__m[__n++]=__ts[3];                               // .apply(this, [event])">
                                                  //             Examples...
                                                  //           </button>
                                                  //         </td>
                                                  //         <td class="cuecard-queryEditor-controls-leftAligned">
                                                  //           <span>
                                                  //             <a href="http://www.freebase.com/docs/data" target="_blank">MQL Tutorial</a> • <a href="http://www.freebase.com/docs/mql" target="_blank">MQL Reference</a>
                                                  //           </span>
                                                  //         </td>
                                                  //         <td width="99%"></td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_2 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_2] = function (event) {
queryEditor._editor.editor.history.undo()}
__m[__n++]=__ts[4];                               // 
                                                  //           <button class="button cuecard-queryEditor-undo" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_2);
__m[__n++]=__ts[5];                               // .apply(this, [event])">
                                                  //             Undo
                                                  //           </button>
                                                  //         </td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_3 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_3] = function (event) {
queryEditor._editor.editor.history.redo()}
__m[__n++]=__ts[6];                               // 
                                                  //           <button class="button cuecard-queryEditor-redo" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_3);
__m[__n++]=__ts[7];                               // .apply(this, [event])">
                                                  //             Redo
                                                  //           </button>
                                                  //         </td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_4 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_4] = function (event) {
queryEditor.content(''); queryEditor.focus();}
__m[__n++]=__ts[8];                               // 
                                                  //           <button class="button cuecard-queryEditor-redo" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_4);
__m[__n++]=__ts[9];                               // .apply(this, [event])">
                                                  //             Clear
                                                  //           </button>
                                                  //         </td>
                                                  //       </tr></table>
                                                  //     </div>
                                                  //     <div class="cuecard-queryEditor-content"></div>
                                                  //     <div class="cuecard-queryEditor-controls-bottom">
                                                  //       <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                                  //         <td class="cuecard-queryEditor-controls-leftAligned">
var onclick_cb_5 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_5] = function (event) {
queryEditor.startAssistAtCursor()}
__m[__n++]=__ts[10];                              // 
                                                  //           <button class="button button-primary cuecard-queryEditor-queryAssist" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_5);
__m[__n++]=__ts[11];                              // .apply(this, [event])">
                                                  //             Query Assist
                                                  //           </button>
                                                  //           <span class="cuecard-queryEditor-buttonHint">Tab</span>
                                                  //         </td>
                                                  //         <td width="90%"></td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_6 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_6] = function (event) {
queryEditor._onCleanUp()}
__m[__n++]=__ts[12];                              // 
                                                  //           <button class="button cuecard-queryEditor-cleanUp" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_6);
__m[__n++]=__ts[13];                              // .apply(this, [event])">
                                                  //             Clean Up
                                                  //           </button>
                                                  //         </td>
                                                  //         <td class="cuecard-queryEditor-controls-rightAligned">
var onclick_cb_7 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_7] = function (event) {
queryEditor._onRun(false)}
__m[__n++]=__ts[14];                              // 
                                                  //           <button class="button button-primary cuecard-queryEditor-run" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_7);
__m[__n++]=__ts[15];                              // .apply(this, [event])">
                                                  //             Run
                                                  //           </button>
                                                  //           <span class="cuecard-queryEditor-buttonHint">Ctrl-Enter</span>
                                                  //         </td>
                                                  //       </tr></table>
                                                  //     </div>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    var el = $(queryEditor._container);
    queryEditor._controlTopContainer = el.find(".cuecard-queryEditor-controls-top");
    queryEditor._iframeContainer = el.find(".cuecard-queryEditor-content");
    queryEditor._controlBottomContainer = el.find(".cuecard-queryEditor-controls-bottom");
    queryEditor._addCodemirror(el.find(".cuecard-queryEditor-content"), codeMirrorOptions);
    
    queryEditor.layout = function(){
      var height = el.height() - 
                   queryEditor._controlTopContainer[0].offsetHeight - 
                   queryEditor._controlBottomContainer[0].offsetHeight;

      queryEditor._iframeContainer.height(height).css("top", queryEditor._controlTopContainer[0].offsetHeight);
    };    
    queryEditor.layout();
  
}, this);
__m[__n++]=__ts[16];                              // 
return __m;
};
query_editor = __pkg.runtime.tfunc_factory("query_editor(queryEditor, codeMirrorOptions)", query_editor, __pkg, undefined, false);
exports.query_editor = query_editor;
query_editor.source_microdata = null;
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/query-editor","stringtable":["","\n\n  <div class=\"cuecard-queryEditor-inner\">\n    <div class=\"cuecard-queryEditor-controls-top\">\n      <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr>\n        <td class=\"cuecard-queryEditor-controls-leftAligned\">","\n          <button class=\"button cuecard-queryEditor-examples\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Examples...\n          </button>\n        </td>\n        <td class=\"cuecard-queryEditor-controls-leftAligned\">\n          <span>\n            <a href=\"http://www.freebase.com/docs/data\" target=\"_blank\">MQL Tutorial</a> • <a href=\"http://www.freebase.com/docs/mql\" target=\"_blank\">MQL Reference</a>\n          </span>\n        </td>\n        <td width=\"99%\"></td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button cuecard-queryEditor-undo\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Undo\n          </button>\n        </td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button cuecard-queryEditor-redo\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Redo\n          </button>\n        </td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button cuecard-queryEditor-redo\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Clear\n          </button>\n        </td>\n      </tr></table>\n    </div>\n    <div class=\"cuecard-queryEditor-content\"></div>\n    <div class=\"cuecard-queryEditor-controls-bottom\">\n      <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr>\n        <td class=\"cuecard-queryEditor-controls-leftAligned\">","\n          <button class=\"button button-primary cuecard-queryEditor-queryAssist\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Query Assist\n          </button>\n          <span class=\"cuecard-queryEditor-buttonHint\">Tab</span>\n        </td>\n        <td width=\"90%\"></td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button cuecard-queryEditor-cleanUp\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Clean Up\n          </button>\n        </td>\n        <td class=\"cuecard-queryEditor-controls-rightAligned\">","\n          <button class=\"button button-primary cuecard-queryEditor-run\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n            Run\n          </button>\n          <span class=\"cuecard-queryEditor-buttonHint\">Ctrl-Enter</span>\n        </td>\n      </tr></table>\n    </div>\n  </div>",""],"debug_locs":[1,1,1,1,1,1,7,7,7,7,14,14,14,14,14,14,14,14,14,14,14,14,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,32,32,32,32,32,32,32,32,32,32,32,38,38,38,38,38,38,38,38,38,38,38,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,57,57,57,57,57,57,57,57,57,57,57,57,57,63,63,63,63,63,63,63,63,63,63,63,72,72,72,72,72,72,72,72,72,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,90,90,90,90,90,90,90,90,90],"output_mode":"html"}}
});
}

/** control-pane **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/control-pane', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
// mjt.def=tabs(id, controlPane)
var tabs = function (id, controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 

    var TABS = [
      { name: 'Tools', template: tools, key: "tools"},
      { name: 'Variables', template: variables, key: "variables"}, 
      { name: 'Envelope', template: envelope, key: "envelope"}, 
      { name: 'Custom Envelope', template: custom_envelope, key: "customEnvelope"}, 
      { name: 'Settings', template: settings, key: "settings"}
    ];
  
__m[__n++]=__ts[2];                               // 
                                                  // 
                                                  //   <div class="cuecard-controlPane section-tabs">
                                                  //     <div id="
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[3];                               // ">
                                                  //       <ul class="section-tabset clear">
__pkg.runtime.foreach(this, (TABS), function (index, tab) {
var once_1 = 1;
while (once_1) {
__m[__n++]=__ts[4];                               // 
                                                  //         <li class="section-tab tab">
                                                  //           <a href="#
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[5];                               // -
__m[__n++]=__pkg.runtime.make_attr_safe(tab.key);
__m[__n++]=__ts[6];                               // "><span>
__m[__n++]=tab.name;
__m[__n++]=__ts[7];                               // </span></a>
                                                  //         </li>
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[8];                               // 
                                                  //       </ul>
                                                  //       <div class="tabbed-content">
__pkg.runtime.foreach(this, (TABS), function (tab_index_1, tab) {
var once_2 = 1;
while (once_2) {
__m[__n++]=__ts[9];                               // 
                                                  //         <div class="cuecard-controlPane-tabBody" id="
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[10];                              // -
__m[__n++]=__pkg.runtime.make_attr_safe(tab.key);
__m[__n++]=__ts[11];                              // ">
                                                  //           
__m[__n++]=(tab.template(controlPane));
__m[__n++]=__ts[12];                              // 
                                                  //         </div>
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[13];                              // 
                                                  //       </div>
                                                  //     </div>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    controlPane.layout = function(){
      var el = this._elmt;
      var height = el.find('.section-tabs').innerHeight() - el.find('.section-tabset').outerHeight();
      el.find('.cuecard-controlPane-tabBody').css("height", height);      
    }
    controlPane.layout();
  
}, this);
__m[__n++]=__ts[14];                              // 
return __m;
};
tabs = __pkg.runtime.tfunc_factory("tabs(id, controlPane)", tabs, __pkg, undefined, false);
exports.tabs = tabs;
tabs.source_microdata = null;
__m[__n++]=__ts[15];                              // 
// mjt.def=tools(controlPane)
var tools = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[16];                              // 

    var BUTTONS = [
      {
        label: 'Qualify All Properties',
        command: '_qualify',
        hint: 'Expand all properties to their full IDs (e.g., "id" → "/type/object/id").'
      },
      {
        label: 'Turn Inside Out',
        command: '_redangle',
        hint: 'Take the inner most query node {...} that contains the text cursor and make it the outermost query node.'
      },
      {
        label: 'Generate Acre Template',
        command: '_generateCode',
        hint: 'Generate an ACRE template that can render the result of this query.'
      },
      {
        label: 'One-liner',
        command: '_oneLiner', 
        hint: 'Reformat query into a one-liner.'
      }
    ];
  
__m[__n++]=__ts[17];                              // 
                                                  // 
                                                  //   <div class="cuecard-controlPane-section">
                                                  //     <table><tr valign="top">
                                                  //       <td>
__pkg.runtime.foreach(this, (BUTTONS), function (b_index_1, b) {
var once_3 = 1;
while (once_3) {
__m[__n++]=__ts[18];                              // 
                                                  //         <div class="cuecard-controlPane-powerTool">
var onclick_cb_1 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_1] = function (event) {
controlPane[b.command]()}
__m[__n++]=__ts[19];                              // 
                                                  //           <input class="button" type="submit" value="
__m[__n++]=__pkg.runtime.make_attr_safe(b.label);
__m[__n++]=__ts[20];                              // " onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_1);
__m[__n++]=__ts[21];                              // .apply(this, [event])">
                                                  //           <div class="cuecard-controlPane-powerTool-hint">
__m[__n++]=b.hint;
__m[__n++]=__ts[22];                              // </div>
                                                  //         </div>
once_3--;
} /* while once */
return once_3 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[23];                              // 
                                                  //       </td>
                                                  //       <td width="40%">
                                                  //         Results of tools<br>
                                                  //         <input checked="true" name="tools-result" type="radio" value="replace"> replace query (undo-able)<br>
                                                  //         <input name="tools-result" type="radio" value="output"> go into output pane
                                                  //       </td>
                                                  //     </tr></table>
                                                  //   </div>
return __m;
};
tools = __pkg.runtime.tfunc_factory("tools(controlPane)", tools, __pkg, undefined, false);
exports.tools = tools;
tools.source_microdata = null;
__m[__n++]=__ts[24];                              // 
// mjt.def=variables(controlPane)
var variables = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[25];                              // 
                                                  //   <table class="cuecard-controlPane-variables">
                                                  //     <tr>
                                                  //       <th width="30%">name</th>
                                                  //       <th width="50%">value</th>
                                                  //       <th></th>
                                                  //     </tr>
// mjt.def=add_row()
var add_row = function () {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[26];                              // <tr class="cuecard-controlPane-variables-row"
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[27];                              // >
                                                  //       <td><input></td>
                                                  //       <td><input></td>
                                                  //       <td>
var onclick_cb_2 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_2] = function (event) {
$(this).closest('.cuecard-controlPane-variables-row').remove()}
__m[__n++]=__ts[28];                              // 
                                                  //         <input class="button" type="submit" value="Remove" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_2);
__m[__n++]=__ts[29];                              // .apply(this, [event])">
                                                  //       </td>
                                                  //     </tr>
return __m;
};
add_row = __pkg.runtime.tfunc_factory("add_row()", add_row, __pkg, undefined, false);
add_row.source_microdata = null;
__m[__n++]=__ts[30];                              // 
                                                  //     
__m[__n++]=(add_row());
__m[__n++]=__ts[31];                              // 
                                                  //   </table>
                                                  //   <div>
var onclick_cb_3 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_3] = function (event) {
controlPane._getTab('variables').find('.cuecard-controlPane-variables').append($.acre(add_row()))}
__m[__n++]=__ts[32];                              // 
                                                  //     <input class="button" type="submit" value="Add" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_3);
__m[__n++]=__ts[33];                              // .apply(this, [event])">
                                                  //   </div>
return __m;
};
variables = __pkg.runtime.tfunc_factory("variables(controlPane)", variables, __pkg, undefined, false);
exports.variables = variables;
variables.source_microdata = null;
__m[__n++]=__ts[34];                              // 
// mjt.def=envelope(controlPane)
var envelope = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[35];                              // 

    var ENV = [
      {name: 'extended', hint: 'Enable MQL extensions'},
      {name: 'as_of_time', hint: 'Resolve the query based on data in Freebase as of the given time in ISO8601 format, e.g., 2009-02-28, 2009-03-13T22:16:40'},
      {name: 'use_permission_of', hint: 'Specify the id of an object (typically a user, domain or type) whose permission you want to copy (<a href="http://freebaseapps.com/docs/mql/ch06.html#id2972357" target="_blank">more details</a>).'},
      {name: 'page', hint: 'Page number starting from 1 if there is a "limit" property in the top level query node.'},
      {name: 'cursor', hint: ''},
      {name: 'lang', hint: 'Return text values in the given language (specified with the language\'s Freebase ID)'},
      {name: 'escape', hint: ''},
      {name: 'uniqueness_failure', hint: ''}
    ];
    
    var def = controlPane._getDefaults();
  
__m[__n++]=__ts[36];                              // 
                                                  //   
                                                  //   <div class="cuecard-controlPane-explanation">
                                                  //     The query envelope contains directives to the query engine, specifying how to execute the query or how to return the results.
                                                  //   </div>
                                                  //   <table class="cuecard-controlPane-configurations">
__pkg.runtime.foreach(this, (ENV), function (e_index_1, e) {
var once_4 = 1;
while (once_4) {
__m[__n++]=__ts[37];                              // 
                                                  //     <tr>
                                                  //       <td>
__m[__n++]=e.name;
__m[__n++]=__ts[38];                              // </td>
                                                  //       <td>
switch (e.name) {
case "extended":
__m[__n++]=__ts[39];                              // <input
var dattrs_1 = (def.extended ? {'checked':''} : {});
var sattrs_1 = {};
if (!("name" in dattrs_1)) {__m[__n++]=__ts[40];                              //  name="extended"
 }
if (!("type" in dattrs_1)) {__m[__n++]=__ts[41];                              //  type="checkbox"
 }
for (var di_1 in dattrs_1) {
__m[__n++]=' ' + di_1;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_1[di_1]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[42];                              // >
break;
case "as_of_time":
__m[__n++]=__ts[43];                              // <input name="as_of_time" value="
__m[__n++]=__pkg.runtime.make_attr_safe(def.as_of_time||'');
__m[__n++]=__ts[44];                              // ">
break;
case "use_permission_of":
__m[__n++]=__ts[45];                              // <input name="use_permission_of" value="
__m[__n++]=__pkg.runtime.make_attr_safe(def.use_permission_of||'');
__m[__n++]=__ts[46];                              // ">
break;
case "page":
__m[__n++]=__ts[47];                              // <div class="cuecard-controlPane-configurations-page">
                                                  //             <input name="page" type="text">
var onclick_cb_4 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_4] = function (event) {
controlPane._runPage(-1)}
__m[__n++]=__ts[48];                              // 
                                                  //             <input class="button" type="submit" value="Previous" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_4);
__m[__n++]=__ts[49];                              // .apply(this, [event])">
var onclick_cb_5 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_5] = function (event) {
controlPane._runPage(1)}
__m[__n++]=__ts[50];                              // 
                                                  //             <input class="button" type="submit" value="Next" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_5);
__m[__n++]=__ts[51];                              // .apply(this, [event])">
                                                  //           </div>
break;
case "cursor":
__m[__n++]=__ts[52];                              // 
                                                  //             <div>
                                                  //               <input checked="" name="cursor-opt" type="radio" value="">
                                                  //               unspecified (return all results, possibly time-out)
                                                  //             </div>
                                                  //             <div>
                                                  //               <input name="cursor-opt" type="radio" value="true">
                                                  //               true (start pagination with page size equal "limit" option in query)
                                                  //             </div>
                                                  //             <div>
                                                  //               <input name="cursor-opt" type="radio" value="custom">
                                                  //               continue from cursor: 
                                                  //               <div class="cuecard-controlPane-configurations-cursor">
var onchange_cb_1 = __pkg.runtime.uniqueid("onchange");
mjt._eventcb[onchange_cb_1] = function (event) {
controlPane._getTab('envelope').find('input[name=\'cursor\'][value=\'custom\']').attr('checked','checked')}
__m[__n++]=__ts[53];                              // 
                                                  //                 <input name="cursor" type="text" onchange="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onchange_cb_1);
__m[__n++]=__ts[54];                              // .apply(this, [event])">
var onclick_cb_6 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_6] = function (event) {
controlPane._runCursor(false)}
__m[__n++]=__ts[55];                              // 
                                                  //                 <input class="button" type="submit" value="Paste from Last Result" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_6);
__m[__n++]=__ts[56];                              // .apply(this, [event])"> 
var onclick_cb_7 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_7] = function (event) {
controlPane._runCursor(true)}
__m[__n++]=__ts[57];                              // 
                                                  //                 <input class="button" type="submit" value="Paste &amp; Run" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_7);
__m[__n++]=__ts[58];                              // .apply(this, [event])">
                                                  //               </div>
                                                  //             </div>
break;
case "lang":
__m[__n++]=__ts[59];                              // <select class="cuecard-controlPane-configurations-languages">
                                                  //             <option value="">--</option>
__pkg.runtime.foreach(this, (CueCard.Languages), function (l_index_1, l) {
var once_5 = 1;
while (once_5) {
__m[__n++]=__ts[60];                              // 
                                                  //             <option value="
__m[__n++]=__pkg.runtime.make_attr_safe(l.id);
__m[__n++]=__ts[61];                              // ">
__m[__n++]=l.name;
__m[__n++]=__ts[62];                              //  (
__m[__n++]=l.id;
__m[__n++]=__ts[63];                              // )</option>
once_5--;
} /* while once */
return once_5 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[64];                              // 
                                                  //           </select>
break;
case "escape":
__m[__n++]=__ts[65];                              // <select>
                                                  //             <option value="">--</option>
                                                  //             <option value="html">html</option>
                                                  //             <option value="false">false</option>
                                                  //           </select>
break;
case "uniqueness_failure":
__m[__n++]=__ts[66];                              // <select>
                                                  //             <option value="">--</option>
                                                  //             <option value="soft">soft</option>
                                                  //           </select>
break;
};
__m[__n++]=__ts[67];                              // 
if (e.hint.length > 0) {
__m[__n++]=__ts[68];                              // 
                                                  //         <div class="cuecard-controlPane-hint">
__m[__n++]=(mjt.bless(e.hint));
__m[__n++]=__ts[69];                              // </div>
}
__m[__n++]=__ts[70];                              // 
                                                  //       </td>
                                                  //     </tr>
once_4--;
} /* while once */
return once_4 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[71];                              // 
                                                  //   </table>
return __m;
};
envelope = __pkg.runtime.tfunc_factory("envelope(controlPane)", envelope, __pkg, undefined, false);
exports.envelope = envelope;
envelope.source_microdata = null;
__m[__n++]=__ts[72];                              // 
// mjt.def=custom_envelope(controlPane)
var custom_envelope = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[73];                              // 

    var env = "env" in controlPane._options ? controlPane._options.env : {};
    var has_env = false;
  
__m[__n++]=__ts[74];                              // 
                                                  //   
                                                  //   <table class="cuecard-controlPane-customEnvelope">
                                                  //     <tr>
                                                  //       <th width="30%">name</th>
                                                  //       <th width="50%">value</th>
                                                  //       <th></th>
                                                  //     </tr>
// mjt.def=add_row(dontFocus, name, value)
var add_row = function (dontFocus, name, value) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[75];                              // <tr class="cuecard-controlPane-customEnvelope-row"
if (this.subst_id) { __m[__n++]=__pkg.runtime.bless(' id="' + this.subst_id + '"'); }
__m[__n++]=__ts[76];                              // >
                                                  //       <td><input value="
__m[__n++]=__pkg.runtime.make_attr_safe(name||'');
__m[__n++]=__ts[77];                              // "></td>
                                                  //       <td><input value="
__m[__n++]=__pkg.runtime.make_attr_safe(value||'');
__m[__n++]=__ts[78];                              // "></td>
                                                  //       <td>
var onclick_cb_8 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_8] = function (event) {
$(this).closest('.cuecard-controlPane-customEnvelope-row').remove()}
__m[__n++]=__ts[79];                              // 
                                                  //         <input class="button" type="submit" value="Remove" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_8);
__m[__n++]=__ts[80];                              // .apply(this, [event])">
                                                  //       </td>
if (!dontFocus) {
__pkg.runtime.ondomready(function () {

        
      
}, this);
}
__m[__n++]=__ts[81];                              // 
                                                  //     </tr>
return __m;
};
add_row = __pkg.runtime.tfunc_factory("add_row(dontFocus, name, value)", add_row, __pkg, undefined, false);
add_row.source_microdata = null;
__m[__n++]=__ts[82];                              // 
__pkg.runtime.foreach(this, (env), function (key, value) {
var once_6 = 1;
while (once_6) {
__m[__n++]=__ts[83];                              // 
has_env = true;
__m[__n++]=__ts[84];                              // 
                                                  //       
__m[__n++]=(add_row(true, key, JSON.stringify(value)));
__m[__n++]=__ts[85];                              // 
once_6--;
} /* while once */
return once_6 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[86];                              // 
if (!has_env) {
__m[__n++]=__ts[87];                              // 
                                                  //       
__m[__n++]=(add_row(true));
__m[__n++]=__ts[88];                              // 
}
__m[__n++]=__ts[89];                              // 
                                                  //   </table>
                                                  //   <div>
var onclick_cb_9 = __pkg.runtime.uniqueid("onclick");
mjt._eventcb[onclick_cb_9] = function (event) {
controlPane._getTab('customEnvelope').find('.cuecard-controlPane-customEnvelope').append($.acre(add_row()))}
__m[__n++]=__ts[90];                              // 
                                                  //     <input class="button" type="submit" value="Add" onclick="return mjt._eventcb.
__m[__n++]=__pkg.runtime.make_attr_safe(onclick_cb_9);
__m[__n++]=__ts[91];                              // .apply(this, [event])">
                                                  //   </div>
return __m;
};
custom_envelope = __pkg.runtime.tfunc_factory("custom_envelope(controlPane)", custom_envelope, __pkg, undefined, false);
exports.custom_envelope = custom_envelope;
custom_envelope.source_microdata = null;
__m[__n++]=__ts[92];                              // 
// mjt.def=settings(controlPane)
var settings = function (controlPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[93];                              // 
                                                  //   <div>
                                                  //     <input
var dattrs_2 = (($.cookie('cc_cp_clean') == '1') ? {'checked' : ''} : {});
var sattrs_2 = {};
if (!("type" in dattrs_2)) {__m[__n++]=__ts[94];                              //  type="checkbox"
 }
for (var di_2 in dattrs_2) {
__m[__n++]=' ' + di_2;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_2[di_2]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[95];                              // >
                                                  //     Always clean up query before running
                                                  //   </div>
                                                  //   <div>
                                                  //     <input
var dattrs_3 = (($.cookie('cc_cp_align') == '1') ? {'checked' : ''} : {});
var sattrs_3 = {};
if (!("type" in dattrs_3)) {__m[__n++]=__ts[96];                              //  type="checkbox"
 }
for (var di_3 in dattrs_3) {
__m[__n++]=' ' + di_3;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_3[di_3]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[97];                              // >
                                                  //     Align JSON property values with spaces
                                                  //   </div>
                                                  //   <div style="display: none;">
                                                  //     <input type="checkbox">
                                                  //     Try running query as you edit
                                                  //   </div>
                                                  //   <div>
                                                  //     <input
var dattrs_4 = (($.cookie('cc_cp_multi') == '1') ? {'checked' : ''} : {});
var sattrs_4 = {};
if (!("type" in dattrs_4)) {__m[__n++]=__ts[98];                              //  type="checkbox"
 }
for (var di_4 in dattrs_4) {
__m[__n++]=' ' + di_4;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_4[di_4]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[99];                              // >
                                                  //     Show error messages with multiple lines on multiple lines
                                                  //   </div>
return __m;
};
settings = __pkg.runtime.tfunc_factory("settings(controlPane)", settings, __pkg, undefined, false);
exports.settings = settings;
settings.source_microdata = null;
__m[__n++]=__ts[100];                             // 
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/control-pane","stringtable":["","","\n\n  <div class=\"cuecard-controlPane section-tabs\">\n    <div id=\"","\">\n      <ul class=\"section-tabset clear\">","\n        <li class=\"section-tab tab\">\n          <a href=\"#","-","\"><span>","</span></a>\n        </li>","\n      </ul>\n      <div class=\"tabbed-content\">","\n        <div class=\"cuecard-controlPane-tabBody\" id=\"","-","\">\n          ","\n        </div>","\n      </div>\n    </div>\n  </div>","","","","\n\n  <div class=\"cuecard-controlPane-section\">\n    <table><tr valign=\"top\">\n      <td>","\n        <div class=\"cuecard-controlPane-powerTool\">","\n          <input class=\"button\" type=\"submit\" value=\"","\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n          <div class=\"cuecard-controlPane-powerTool-hint\">","</div>\n        </div>","\n      </td>\n      <td width=\"40%\">\n        Results of tools<br>\n        <input checked=\"true\" name=\"tools-result\" type=\"radio\" value=\"replace\"> replace query (undo-able)<br>\n        <input name=\"tools-result\" type=\"radio\" value=\"output\"> go into output pane\n      </td>\n    </tr></table>\n  </div>","","\n  <table class=\"cuecard-controlPane-variables\">\n    <tr>\n      <th width=\"30%\">name</th>\n      <th width=\"50%\">value</th>\n      <th></th>\n    </tr>","<tr class=\"cuecard-controlPane-variables-row\"",">\n      <td><input></td>\n      <td><input></td>\n      <td>","\n        <input class=\"button\" type=\"submit\" value=\"Remove\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n      </td>\n    </tr>","\n    ","\n  </table>\n  <div>","\n    <input class=\"button\" type=\"submit\" value=\"Add\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n  </div>","","","\n  \n  <div class=\"cuecard-controlPane-explanation\">\n    The query envelope contains directives to the query engine, specifying how to execute the query or how to return the results.\n  </div>\n  <table class=\"cuecard-controlPane-configurations\">","\n    <tr>\n      <td>","</td>\n      <td>","<input"," name=\"extended\""," type=\"checkbox\"",">","<input name=\"as_of_time\" value=\"","\">","<input name=\"use_permission_of\" value=\"","\">","<div class=\"cuecard-controlPane-configurations-page\">\n            <input name=\"page\" type=\"text\">","\n            <input class=\"button\" type=\"submit\" value=\"Previous\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">","\n            <input class=\"button\" type=\"submit\" value=\"Next\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n          </div>","\n            <div>\n              <input checked=\"\" name=\"cursor-opt\" type=\"radio\" value=\"\">\n              unspecified (return all results, possibly time-out)\n            </div>\n            <div>\n              <input name=\"cursor-opt\" type=\"radio\" value=\"true\">\n              true (start pagination with page size equal \"limit\" option in query)\n            </div>\n            <div>\n              <input name=\"cursor-opt\" type=\"radio\" value=\"custom\">\n              continue from cursor: \n              <div class=\"cuecard-controlPane-configurations-cursor\">","\n                <input name=\"cursor\" type=\"text\" onchange=\"return mjt._eventcb.",".apply(this, [event])\">","\n                <input class=\"button\" type=\"submit\" value=\"Paste from Last Result\" onclick=\"return mjt._eventcb.",".apply(this, [event])\"> ","\n                <input class=\"button\" type=\"submit\" value=\"Paste &amp; Run\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n              </div>\n            </div>","<select class=\"cuecard-controlPane-configurations-languages\">\n            <option value=\"\">--</option>","\n            <option value=\"","\">"," (",")</option>","\n          </select>","<select>\n            <option value=\"\">--</option>\n            <option value=\"html\">html</option>\n            <option value=\"false\">false</option>\n          </select>","<select>\n            <option value=\"\">--</option>\n            <option value=\"soft\">soft</option>\n          </select>","","\n        <div class=\"cuecard-controlPane-hint\">","</div>","\n      </td>\n    </tr>","\n  </table>","","","\n  \n  <table class=\"cuecard-controlPane-customEnvelope\">\n    <tr>\n      <th width=\"30%\">name</th>\n      <th width=\"50%\">value</th>\n      <th></th>\n    </tr>","<tr class=\"cuecard-controlPane-customEnvelope-row\"",">\n      <td><input value=\"","\"></td>\n      <td><input value=\"","\"></td>\n      <td>","\n        <input class=\"button\" type=\"submit\" value=\"Remove\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n      </td>","\n    </tr>","","","\n      ","","","\n      ","","\n  </table>\n  <div>","\n    <input class=\"button\" type=\"submit\" value=\"Add\" onclick=\"return mjt._eventcb.",".apply(this, [event])\">\n  </div>","","\n  <div>\n    <input"," type=\"checkbox\"",">\n    Always clean up query before running\n  </div>\n  <div>\n    <input"," type=\"checkbox\"",">\n    Align JSON property values with spaces\n  </div>\n  <div style=\"display: none;\">\n    <input type=\"checkbox\">\n    Try running query as you edit\n  </div>\n  <div>\n    <input"," type=\"checkbox\"",">\n    Show error messages with multiple lines on multiple lines\n  </div>",""],"debug_locs":[1,1,1,1,1,1,7,7,7,7,9,9,10,11,12,13,14,15,16,17,20,20,20,20,20,22,22,22,22,22,23,23,23,23,23,23,23,23,24,24,24,24,24,24,27,27,27,27,27,27,27,27,27,27,27,28,28,28,29,29,29,29,29,29,34,34,34,34,34,34,35,36,37,38,39,40,41,42,44,44,44,44,44,44,46,46,46,46,48,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,76,76,76,76,76,76,76,76,77,77,77,77,77,77,77,77,77,77,78,78,78,79,79,79,79,79,79,89,89,89,89,89,89,89,89,89,89,89,89,89,89,92,92,92,92,99,99,99,99,99,99,99,99,99,99,99,99,104,104,104,104,104,104,104,104,104,104,106,106,106,106,106,106,106,107,107,107,111,111,111,111,111,111,111,111,111,113,113,113,113,113,113,113,116,116,116,116,118,118,119,120,121,122,123,124,125,126,127,128,129,130,131,137,137,137,137,137,137,137,137,137,138,138,138,138,140,140,140,140,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,142,144,144,144,144,144,146,146,146,146,146,150,150,150,150,150,150,150,150,151,151,151,151,151,151,151,152,152,152,152,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,168,168,168,168,168,168,168,169,169,169,169,169,169,169,172,172,172,172,172,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,177,177,177,177,183,183,183,183,183,183,183,188,188,188,188,188,188,191,191,191,191,191,191,191,193,193,193,193,193,193,193,196,196,196,196,196,196,196,199,199,199,199,200,200,201,202,203,211,211,211,211,211,211,211,211,211,211,211,211,211,212,212,212,213,213,213,216,216,216,216,216,216,216,216,218,218,218,218,218,219,220,221,221,222,222,222,222,222,222,222,222,222,222,223,223,225,225,225,226,226,226,226,226,226,226,227,227,227,228,228,232,232,232,232,232,232,232,232,232,234,234,234,234,234,234,234,237,237,237,237,239,239,239,239,239,239,239,239,239,239,239,239,239,243,243,243,243,243,243,243,243,243,243,243,243,243,243,243,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,251,254,254,254,254,254,254,254,254,255,255,255,255],"output_mode":"html"}}
});
}

/** output-pane **/
if (jQuery) {
jQuery(window).trigger('acre.template.register', {pkgid: '//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/output-pane', source: {def: (function () {// mjt.def=rawmain()
var rawmain = function () {
var __pkg = this.tpackage;
var exports = this.exports;
var __ts=__pkg._template_fragments;
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[0];                               // 
// mjt.def=tabs(id, outputPane)
var tabs = function (id, outputPane) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[1];                               // 

    var TABS = [
      { name: 'Tree', key: "tree"},
      { name: 'Text', key: "text"}, 
      { name: 'Status', key: "status"}
    ];
  
__m[__n++]=__ts[2];                               // 
                                                  //   
                                                  //   <div class="cuecard-outputPane section-tabs">
                                                  //     <div id="
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[3];                               // ">
                                                  //       <ul class="section-tabset clear">
__pkg.runtime.foreach(this, (TABS), function (index, tab) {
var once_1 = 1;
while (once_1) {
__m[__n++]=__ts[4];                               // 
                                                  //         <li class="section-tab tab">
                                                  //           <a href="#
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[5];                               // -
__m[__n++]=__pkg.runtime.make_attr_safe(tab.key);
__m[__n++]=__ts[6];                               // "><span>
__m[__n++]=tab.name;
__m[__n++]=__ts[7];                               // </span></a>
                                                  //         </li>
once_1--;
} /* while once */
return once_1 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[8];                               // 
                                                  //       </ul>
                                                  //       <div class="tabbed-content">
__pkg.runtime.foreach(this, (TABS), function (tab_index_1, tab) {
var once_2 = 1;
while (once_2) {
__m[__n++]=__ts[9];                               // 
                                                  //         <div class="cuecard-outputPane-tabBody" id="
__m[__n++]=__pkg.runtime.make_attr_safe(id);
__m[__n++]=__ts[10];                              // -
__m[__n++]=__pkg.runtime.make_attr_safe(tab.key);
__m[__n++]=__ts[11];                              // ">
switch (tab.key) {
case "tree":
__m[__n++]=__ts[12];                              // <div class="cuecard-outputPane-tree"></div>
break;
case "text":
__m[__n++]=__ts[13];                              // <textarea class="cuecard-outputPane-textarea" readonly="true" wrap="off"></textarea>
break;
case "status":
__m[__n++]=__ts[14];                              // <div class="cuecard-outputPane-status"></div>
break;
};
__m[__n++]=__ts[15];                              // 
                                                  //         </div>
once_2--;
} /* while once */
return once_2 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[16];                              // 
                                                  //       </div>
                                                  //     </div>
                                                  //   </div>
__pkg.runtime.ondomready(function () {

    outputPane.layout = function(){
      var el = this._elmt;
      var fullHeight = el.innerHeight() - el.find('.section-tab').outerHeight() - (outputPane._options.verticalPadding || 12);
      var fullWidth = el.find('.section-tabs').innerWidth() - (outputPane._options.horizontalPadding || 0);

      var padding = 10;
      var height = fullHeight - (2 * padding);
      var width = fullWidth - (2 * padding);

      el.find('.cuecard-outputPane-tabBody, .cuecard-outputPane-textarea').height(fullHeight).width(fullWidth);
      el.find('.cuecard-outputPane-status, .cuecard-outputPane-tree').css("padding", padding).height(height).width(width);
    }
    outputPane.layout();
  
}, this);
__m[__n++]=__ts[17];                              // 
return __m;
};
tabs = __pkg.runtime.tfunc_factory("tabs(id, outputPane)", tabs, __pkg, undefined, false);
exports.tabs = tabs;
tabs.source_microdata = null;
__m[__n++]=__ts[18];                              // 
// mjt.def=status(headers)
var status = function (headers) {
var __m=__pkg.runtime.new_markuplist(),__n=0;
__m[__n++]=__ts[19];                              // 
                                                  //   <div class="cuecard-outputPane-responseHeaders">
if (headers['x-metaweb-tid']) {
__m[__n++]=__ts[20];                              // 
var tid = headers["x-metaweb-tid"];
__m[__n++]=__ts[21];                              // 
                                                  //       <h3>x-metaweb-tid (transaction ID)</h3>
                                                  //       <div>
                                                  //         <a href="http://stats.metaweb.com/query/transaction?tid=
__m[__n++]=__pkg.runtime.make_attr_safe(encodeURIComponent(tid));
__m[__n++]=__ts[22];                              // " target="_blank">
                                                  //           
__m[__n++]=tid;
__m[__n++]=__ts[23];                              // 
                                                  //         </a>
                                                  //       </div>
}
__m[__n++]=__ts[24];                              // 
if (headers['x-metaweb-cost']) {
__m[__n++]=__ts[25];                              // 

        var xmc = headers["x-metaweb-cost"].split(",");
        var odd = true;
      
__m[__n++]=__ts[26];                              // 
                                                  //       <h3>x-metaweb-cost header components</h3>
                                                  //       <table>
                                                  //         <tr><th>code</th><th>value</th><th>meaning</th><th>subsystem</th></tr>
__pkg.runtime.foreach(this, (xmc), function (index, entry) {
var once_3 = 1;
while (once_3) {
__m[__n++]=__ts[27];                              // 

            var pair = entry.split("=");
            pair[0] = pair[0].replace(/^\s+/, '').replace(/\s+$/, '');
            var cost = CueCard.XMetawebCosts[pair[0]];
            var rclass = (index % 2 ? "cuecard-outputPane-odd" : "cuecard-outputPane-even") + ((cost !== undefined && "important" in cost && cost.important) ? " cuecard-outputPane-cost-important" : "")
          
__m[__n++]=__ts[28];                              // 
                                                  //           <tr class="
__m[__n++]=__pkg.runtime.make_attr_safe(rclass);
__m[__n++]=__ts[29];                              // ">
                                                  //             <td>
__m[__n++]=(pair[0]);
__m[__n++]=__ts[30];                              // </td>
                                                  //             <td>
__m[__n++]=(pair[1]);
__m[__n++]=__ts[31];                              // </td>
if (cost !== undefined) {
__m[__n++]=__ts[32];                              // 
                                                  //             <td>
__m[__n++]=cost.meaning;
__m[__n++]=__ts[33];                              // </td>
}
else {
__m[__n++]=__ts[34];                              // <td>--</td>
}
__m[__n++]=__ts[35];                              // 
if (cost !== undefined) {
__m[__n++]=__ts[36];                              // 
                                                  //             <td>
__m[__n++]=cost.subsystem;
__m[__n++]=__ts[37];                              // </td>
}
else {
__m[__n++]=__ts[38];                              // <td>--</td>
}
__m[__n++]=__ts[39];                              // 
                                                  //           </tr>
once_3--;
} /* while once */
return once_3 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[40];                              // 
                                                  //       </table>
}
__m[__n++]=__ts[41];                              // 
                                                  // 
                                                  //     <h3>response headers</h3>
                                                  //     <table>
var odd = true;
__m[__n++]=__ts[42];                              // 
__pkg.runtime.foreach(this, (headers), function (key, value) {
var once_4 = 1;
while (once_4) {
if (key != 'x-metaweb-cost' && key != 'x-metaweb-tid') {
__m[__n++]=__ts[43];                              // 
                                                  //         <tr
var dattrs_1 = (odd ? {'class': 'cuecard-outputPane-odd'} : {'class': 'cuecard-outputPane-even'});
var sattrs_1 = {};
for (var di_1 in dattrs_1) {
__m[__n++]=' ' + di_1;
__m[__n++]=__pkg.runtime.bless('="');
__m[__n++]=__pkg.runtime.htmlencode(''+dattrs_1[di_1]);
__m[__n++]=__pkg.runtime.bless('"');
}
__m[__n++]=__ts[44];                              // >
                                                  //           <td>
__m[__n++]=key;
__m[__n++]=__ts[45];                              // </td>
                                                  //           <td>
__m[__n++]=value;
__m[__n++]=__ts[46];                              // </td>
                                                  //         </tr>
odd = !odd
__m[__n++]=__ts[47];                              // 
}
once_4--;
} /* while once */
return once_4 ? __pkg.runtime._break_token :  __pkg.runtime._continue_token;
}); /* foreach */
__m[__n++]=__ts[48];                              // 
                                                  //     </table>
                                                  // 
                                                  //   </div>
return __m;
};
status = __pkg.runtime.tfunc_factory("status(headers)", status, __pkg, undefined, false);
exports.status = status;
status.source_microdata = null;
__m[__n++]=__ts[49];                              // 
return __m;
};
rawmain.source_microdata = null;
; return rawmain;})(),
info:{"file":"//62b.cuecard.site.tags.svn.freebase-site.googlecode.dev/output-pane","stringtable":["","","\n  \n  <div class=\"cuecard-outputPane section-tabs\">\n    <div id=\"","\">\n      <ul class=\"section-tabset clear\">","\n        <li class=\"section-tab tab\">\n          <a href=\"#","-","\"><span>","</span></a>\n        </li>","\n      </ul>\n      <div class=\"tabbed-content\">","\n        <div class=\"cuecard-outputPane-tabBody\" id=\"","-","\">","<div class=\"cuecard-outputPane-tree\"></div>","<textarea class=\"cuecard-outputPane-textarea\" readonly=\"true\" wrap=\"off\"></textarea>","<div class=\"cuecard-outputPane-status\"></div>","\n        </div>","\n      </div>\n    </div>\n  </div>","","","\n  <div class=\"cuecard-outputPane-responseHeaders\">","","\n      <h3>x-metaweb-tid (transaction ID)</h3>\n      <div>\n        <a href=\"http://stats.metaweb.com/query/transaction?tid=","\" target=\"_blank\">\n          ","\n        </a>\n      </div>","","","\n      <h3>x-metaweb-cost header components</h3>\n      <table>\n        <tr><th>code</th><th>value</th><th>meaning</th><th>subsystem</th></tr>","","\n          <tr class=\"","\">\n            <td>","</td>\n            <td>","</td>","\n            <td>","</td>","<td>--</td>","","\n            <td>","</td>","<td>--</td>","\n          </tr>","\n      </table>","\n\n    <h3>response headers</h3>\n    <table>","","\n        <tr",">\n          <td>","</td>\n          <td>","</td>\n        </tr>","","\n    </table>\n\n  </div>",""],"debug_locs":[1,1,1,1,1,1,6,6,6,6,8,8,9,10,11,12,13,14,17,17,17,17,17,19,19,19,19,19,20,20,20,20,20,20,20,20,21,21,21,21,21,21,24,24,24,24,24,24,24,24,24,24,24,25,25,25,26,26,26,27,27,27,28,28,28,29,29,29,29,29,29,35,35,35,35,35,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,52,52,52,52,52,52,54,54,54,54,57,57,57,58,58,61,61,61,61,61,62,62,62,65,65,65,65,67,67,68,68,69,70,71,75,75,75,75,75,75,75,76,76,77,78,79,80,81,82,82,82,83,83,83,84,84,84,85,85,85,85,85,85,85,85,85,85,86,86,86,86,86,86,86,86,86,86,88,88,88,88,88,88,90,90,90,94,94,94,94,94,95,95,95,95,95,96,96,96,96,96,96,96,96,96,96,97,97,97,98,98,98,100,100,100,102,102,102,102,102,102,106,106,106,106,106,106,106,106,106,107,107,107,107],"output_mode":"html"}}
});
}
