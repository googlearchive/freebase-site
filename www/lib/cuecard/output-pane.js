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
  this._lastJsonOutputMode = $.cookie("cc_op_mode") == "json" ? "json" : "json";

  this._constructUI();
};

CueCard.OutputPane.prototype.dispose = function() {
  // TODO
};

CueCard.OutputPane.prototype._constructUI = function() {
  var self = this;
  var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());

  this._elmt.acre(fb.acre.current_script.app.path + "/cuecard/output-pane.mjt", "tabs", [idPrefix, this]);

  var tabs = $('#' + idPrefix + " > .cuecard-outputPane-tabs > .tab-nav");
  tabs.tabs('#' + idPrefix + " > .tabbed-content > .cuecard-outputPane-tabBody", {
    "initialIndex": this._options.hideHelp ? 1 : 2,
    "onBeforeClick": function(event, index) {
      if (index == 0) { // json
        self._lastJsonOutputMode = "json";
      }

      $.cookie("cc_op_mode", self._lastJsonOutputMode, { expires: 365 });
    }
  });
  this._tabs = tabs.data("tabs");

  this._json = this._getTab("json").find("div");
  this._status = this._getTab("status").find("div");
  this._help = this._getTab("help").find("div");

  // setup JSON iframe
  this._createIframe();
};

CueCard.OutputPane.prototype._getTab = function(name) {
  return $("#" + this._idPrefix + "-" + name);
};

CueCard.OutputPane.prototype.setJSONContent = function(o, jsonizingSettings) {
  this._jsonResult = o;
  this._setIFrameText(CueCard.jsonize(o, jsonizingSettings || { indentCount: 2 }));

  var tabToSelect;
  if (this._lastJsonOutputMode == "json") {
    tabToSelect = 0;
  } else {
    tabToSelect = 0;
  }

  var self = this;
  var selectTab = function() {
    self._tabs.click(tabToSelect);
  };

  // tabs have to be selected asynchronously or Chrome will crash.
  window.setTimeout(selectTab, 100);
};

CueCard.OutputPane.prototype.setStatus = function(html) {
  this._tabs.click(1);
  this._status.html(html);

  this._jsonResult = null;
  this._setIFrameText("");
};

CueCard.OutputPane.prototype.getJson = function() {
  return this._jsonResult;
};

CueCard.OutputPane.prototype.renderResponseHeaders = function(headers) {
  this.setStatus($.acre(fb.acre.current_script.app.path + "/cuecard/output-pane.mjt", "status", [headers]));
};

CueCard.OutputPane.prototype._setIFrameText = function(text) {
  var makeTopicLink = function(id) {
    return "<a target='_blank' class='cuecard-outputPane-tree-dataLink' href='" + CueCard.freebaseServiceUrl + 
    "view" + id + "' onmouseover='__cc_tree_mouseOverTopic(this)' onmouseout='__cc_tree_mouseOutTopic(this)' fbid='" + 
    id + "'>" + id + "</a>";
  };

  text = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  var buf = [],
      m,
      ///id_re = /\"m?id\"\s*\:\s*\[(?:s*\"([^\"]*)\"s*\,?)+\]?/gi;
      id_re = /\"m?id\"\s*\:\s*\"([^\"]*)\"/gi;

  text.split(/[\n\r\f]/).forEach(function(l) {
    buf.push(l.replace(id_re, function(m, id) {
      return m.replace(id, makeTopicLink(id, id));
    }));
  });

  text = "<pre style='white-space:pre-wrap;'>" + buf.join("\n") + "</pre>";
  this._json_iframe.document.body.innerHTML = text;
};

CueCard.OutputPane.prototype._createIframe = function() {
  var iframe = document.createElement('iframe');
  this._json.append(iframe);

  var __cc_tree_mouseOverTopic = function(elmt) {
    var id = elmt.getAttribute("fbid");
    $.getJSON("http://hotshot.dfhuynh.user.dev.freebaseapps.com/html?id=" + id + "&callback=?",
      function(html) {
        var div = __cc_tree_createPopup(elmt);
        $(div).addClass("cuecard-outputPane-tree-popup-topic").html(html);
      }
    );
  };
    
  var __cc_tree_mouseOutTopic = function(elmt) {
    __cc_tree_disposePopup();
  };

  var __cc_tree_createPopup = function(elmt) {
    var div = document.getElementById("cuecard-outputPane-tree-popup");
    if (div == null) {
      div = document.createElement("div");
      div.id = "cuecard-outputPane-tree-popup";
      div.className = "cuecard-outputPane-tree-popup";
      div.onmouseover = __cc_tree_disposePopup;

      document.body.appendChild(div);
    }

    var pos = $(elmt).position();
    var top = $(iframe).offset().top + pos.top - $(win.document).scrollTop() + $(elmt).height() + 10;
    var left = $(iframe).offset().left + pos.left - $(win.document).scrollLeft();
    $(div).css({top:top, left:left});

    return div;
  };
  
  var __cc_tree_disposePopup = function() {
    var div = document.getElementById("cuecard-outputPane-tree-popup");
    if (div != null) {
      div.parentNode.removeChild(div);
    }
  };

  var win = this._json_iframe = iframe.contentWindow || iframe.contentDocument;
  win.__cc_tree_mouseOverTopic = __cc_tree_mouseOverTopic;
  win.__cc_tree_mouseOutTopic  = __cc_tree_mouseOutTopic;
  win.__cc_tree_createPopup    = __cc_tree_createPopup;
  win.__cc_tree_disposePopup   = __cc_tree_disposePopup;
};
