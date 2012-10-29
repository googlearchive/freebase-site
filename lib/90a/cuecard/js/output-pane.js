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

CueCard.OutputPane = function(elmt, options) {
  this._elmt = $(elmt);
  this._options = options || {};
  
  this._TABS = options.tabs || [
    /* { name: 'List', key: "list"}, */
    { name: 'Results',  key: "json"}
  ];
  
  if (!this._options.hideHelp) {
    this._TABS.push({ name: 'Help', key: "help"});
  }

  this._jsonResult = null;
  this._lastJsonOutputMode = $.localstore("cc_op_mode") || this._TABS[0].key;

  this._constructUI();
};

CueCard.OutputPane.prototype.dispose = function() {
  // TODO
};

CueCard.OutputPane.prototype.layout = function(height, width) {
  if (height) {
    this._container.height(height);
    var contentHeight = this._container.innerHeight() - this._tabsContainer.outerHeight();
    this._contentContainer.height(contentHeight);
    $(".cuecard-outputPane-tabBody", this._contentContainer).height(contentHeight);
  }
  if (width) {
    this._container.width(width);
  }
};

CueCard.OutputPane.prototype._constructUI = function() {
  var self = this;
  var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());

  this._elmt.acre(fb.acre.current_script.app.path + "/cuecard/mjt/output-pane.mjt", "tabs", [idPrefix, this]);

  var initial_tab;
  if (this._options.initial_tab) {
    initial_tab = self.getTabIndex(this._options.initial_tab);
  } else {
    initial_tab = self.getTabIndex("help");
  }
                    
  var tabs = $('#' + idPrefix + " > .cuecard-outputPane-tabs > .section-tabset");
  tabs.tabs('#' + idPrefix + " > .tabbed-content > .cuecard-outputPane-tabBody", {
    "initialIndex": initial_tab,
    "onBeforeClick": function(event, index) {
      var key = self._TABS[index].key;
      if (key !== "help") {
        self._lastJsonOutputMode = key;
        $.localstore("cc_op_mode", key, false);
      }
    }
  });
  this._tabs = tabs.data("tabs");

  this._json = this._getTab("json");
  this._json = this._json.length ? this._json : false;

  this._help = this._getTab("help");
  this._help = this._help.length ? this._help : false;

  this.setStatus("Run query to see results here...");
};

CueCard.OutputPane.prototype._getTab = function(name) {
  return $("#" + this._idPrefix + "-" + name);
};

CueCard.OutputPane.prototype.prepareQuery = function(q) {
  if (this.__lastJsonOutputMode === "list") {
    // do list extension
  }
  return q;
};

CueCard.OutputPane.prototype.getTabIndex = function(key) {
  for (var m=0; m < this._TABS.length; m++) {
    if(this._TABS[m].key === key) {
      return m;
    }
  }
  return 0;
};

CueCard.OutputPane.prototype.setJSONContent = function(o, jsonizingSettings, query) {
  this._jsonResult = o;
    
  if ("result" in o) {
    this._setJsonText(CueCard.jsonize(o, jsonizingSettings || { indentCount: 2 }));
    query = JSON.parse(query);
    if (this._list) this._list_content.acre(fb.acre.current_script.app.path + "/cuecard/mjt/output-pane.mjt", "list", [o, query]);    
  } else if (o.message) {
    // googleapis error
    delete o.response;
    this._setJsonText(CueCard.jsonize(o, jsonizingSettings || { indentCount: 2 }));
    if (this._list) this._list_content.acre(fb.acre.current_script.app.path + "/cuecard/mjt/output-pane.mjt", "list_error", [o.message]);
  } else if (o.messages) {
    // metaweb error
    var message = (typeof o.messages[0] == 'string') ?  o.messages[0] : o.messages[0].message;
    this._setJsonText(message);
    if (this._list) this._list_content.acre(fb.acre.current_script.app.path + "/cuecard/mjt/output-pane.mjt", "list_error", [message]);
  }
  
  this._tabs.click(this.getTabIndex(this._lastJsonOutputMode));
}

CueCard.OutputPane.prototype.setStatus = function(html, switch_tabs) {
  this._jsonResult = null;
  this._setJsonText(html);
  if (switch_tabs) {
    this._tabs.click(this.getTabIndex(this._lastJsonOutputMode));
  }
};

CueCard.OutputPane.prototype.getJson = function() {
  return this._jsonResult;
};

CueCard.OutputPane.prototype._setJsonText = function(text) {
  var makeTopicLink = function(id) {
    return "<a target='_blank' class='property-value' data-id='" + id + "' href='" + 
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

  text = "<pre>" + buf.join("\n") + "</pre>";
  this._json.html(text);
};
