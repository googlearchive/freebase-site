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

  this._TABS = [
    { name: 'List', key: "list"},
    { name: 'API',  key: "json"}
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
  this._container.height(height);
  var contentHeight = this._container.innerHeight() - this._tabsContainer.outerHeight();
  this._contentContainer.height(contentHeight);
  if (this._statusDrawer && contentHeight) {
    this._statusDrawer.set_height(contentHeight);
  }
};

CueCard.OutputPane.prototype._constructUI = function() {
  var self = this;
  var idPrefix = this._idPrefix = "t" + Math.floor(1000000 * Math.random());

  this._elmt.acre(fb.acre.current_script.app.path + "/cuecard/output-pane.mjt", "tabs", [idPrefix, this]);

  var initial_tab;
  if (this._options.initial_tab) {
    initial_tab = self.getTabIndex(this._options.initial_tab);
  } else if (this._options.hideHelp || this._options.queryLoaded) {
    initial_tab = self.getTabIndex(self._lastJsonOutputMode);
  } else {
    self.getTabIndex("help");
  }
                    
  var tabs = $('#' + idPrefix + " > .cuecard-outputPane-tabs > .tab-nav");
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

  this._list = this._getTab("list").find("div");
  this._json = this._getTab("json").find("div .panel-content");
  this._status = this._getTab("json").find("div .drawer-content");
  this._help = this._getTab("help").find("div");

  // setup JSON iframe
  var json_iframe = document.createElement('iframe');
  this._json.append(json_iframe);
  this._json_content = $(this._setupIframe(json_iframe));
  
  // setup list iframe
  var list_iframe = document.createElement('iframe');
  this._list.append(list_iframe);
  this._list_content = $(this._setupIframe(list_iframe));
  
  this._statusDrawer = this._elmt.find(".cuecard-outputPane-json").paneldrawer({
    toggle_state: 0,
    toggle_callback: this._options.toggle_callback,
    drawer_height: 250
  }).data("$.paneldrawer");
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

CueCard.OutputPane.prototype.setJSONContent = function(o, jsonizingSettings, constraints) {
  this._jsonResult = o;
  
  
  if (o.result) {
    this._setIFrameText(CueCard.jsonize(o, jsonizingSettings || { indentCount: 2 }));
    this._list_content.acre(fb.acre.current_script.app.path + "/cuecard/output-pane.mjt", "list", [o, constraints]);    
  } else if (o.messages) {
    var message = (typeof o.messages[0] == 'string') ?  o.messages[0] : o.messages[0].message;
    this._setIFrameText(message);
    this._list_content.acre(fb.acre.current_script.app.path + "/cuecard/output-pane.mjt", "list_error", [message]);
  }
  
  this._tabs.click(this.getTabIndex(this._lastJsonOutputMode));
}

CueCard.OutputPane.prototype.setStatus = function(html) {
  //this._tabs.click(1);
  this._status.html(html);

  this._jsonResult = null;
  this._setIFrameText("");
  this._list_content.html("");
};

CueCard.OutputPane.prototype.getJson = function() {
  return this._jsonResult;
};

CueCard.OutputPane.prototype.renderResponseHeaders = function(headers) {
  this.setStatus($.acre(fb.acre.current_script.app.path + "/cuecard/output-pane.mjt", "status", [headers]));
};

CueCard.OutputPane.prototype._setIFrameText = function(text) {
  var makeTopicLink = function(id) {
    return "<a target='_blank' class='cuecard-outputPane-dataLink' href='" + 
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
  this._json_content.html(text);
};

CueCard.OutputPane.prototype._setupIframe = function(iframe) {
  var self = this;
  
  var __cc_runPage = function(increment) {
    self._options.queryEditor._controlPane._runPage(increment);
  };

  var win = iframe.contentWindow || iframe.contentDocument;
  win.__cc_runPage             = __cc_runPage;
  var body = win.document.body;
  
  $(".cuecard-outputPane-dataLink", body)
    .live("mouseover", function() {
      var id = $(this).attr("href");
      var offset = $(iframe).offset();
      var pos = $(this).position();
      var top = offset.top + pos.top + $(this).height();
      var left = offset.left + pos.left;

      var div = $("<div id='cuecard-outputPane-topic-popup'></div>")
        .css({
          'position': "absolute",
          'z-index': 1000,
          'width': "30em",
          'top': top,
          'left': left
        })
        .appendTo("body");
        
      $.get(fb.h.legacy_fb_url("/private/flyout", id), function(r) {
        div.html(r.html);
      }, "jsonp");
    })
    .live("mouseout", function() {
      $("#cuecard-outputPane-topic-popup").remove();
    });
    
  return body;
};
