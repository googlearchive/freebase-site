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

CueCard.helper = fb.h.ajax_url("lib/cuecard/");
CueCard.freebaseServiceUrl = fb.acre.freebase.service_url + "/";
CueCard.urlPrefix = CueCard.apiProxy.base = fb.h.ajax_url("lib/cuecard/");

var c = {};
var queryEditorOptions;

function onLoad() {
  var params = CueCard.parseURLParameters();
  var autorun = false;

  var outputPaneOptions = {
    toggle_callback: onToggleHeaders,
    stylesheet: $("#cuecard-outputPane-stylesheet").attr("href"),
    initial_tab: params.tab
  };
  
  var controlPaneOptions = {
    paneldrawer: {
      element: $("#qe-module"),
      drawer_height: 250,
      toggle_state: ($.localstore("cc_cp") == "1"),
      toggle_callback: onToggleControlPane,
      panel_content: "cuecard-queryEditor-content"
    },
    extended: 0, // Don't make this sticky: $.localstore("cc_cp_extended") == "1" ? 1 : 0,
    costs: $.localstore("cc_cp_costs") == "1" ? true : false
  };

  queryEditorOptions = {
    focusOnReady: true,
    onUnauthorizedMqlWrite: function() {
      if (window.confirm("Query editor needs to be authorized to write data on your behalf. Proceed to authorization?")) {
        saveQuery();

        var url = document.location.href;
        var hash = url.indexOf("#");
        if (hash > 0) {
          url = url.substr(0, hash);
        } else {
          var question = url.indexOf("?");
          if (question > 0) {
            url = url.substr(0, question);
          }
        }

        var url2 = "/signin/login?mw_cookie_scope=domain&onsignin=" + encodeURIComponent(url);

        document.location = url2;
      }
    },
    codeMirror: {
      parserfile: [$("#codemirror-js").attr("href")],
      stylesheet: [$("#codemirror-css").attr("href")]
    }
  };

  if ("q" in params || "query" in params) {
    var s = "q" in params ? params.q : params.query;
    try {
      var o = JSON.parse(s);
      if ("query" in o) {
        s = JSON.stringify(o.query);

        delete o.query;
        controlPaneOptions["env"] = o;
      }
    } catch (e) {
    }

    queryEditorOptions.content = s;
    queryEditorOptions.cleanUp = true;

    if ("extended" in params) {
      controlPaneOptions["extended"] = params["extended"] == "1" ? 1 : 0;
    }

    if ("as_of_time" in params) {
      controlPaneOptions["as_of_time"] = params["as_of_time"];
    }
    if ("env" in params) {
      try {
        controlPaneOptions["env"] = JSON.parse(params["env"]);
      } catch (e) {
      }
    }
  } else {
    try {
      var o = JSON.parse($.localstore("qe_initialQuery"));
      if ($.trim(o.t).length > 0) {
        queryEditorOptions.content = o.t;
      }
      controlPaneOptions.env = o.e;
    } catch (e) {}
  }

  if ("autorun" in params) {
    autorun = true;
  }
  
  queryEditorOptions.onReady = function() {
    $(".nicemenu").nicemenu();
    
    $("#links").prependTo("#the-output-pane .cuecard-outputPane-tabs");
    
    resizePanes();
    if (autorun) c.queryEditor.run(false);
    
    // fulhack to hide initial laying out
    setTimeout(function() {
      $("#qe-module, #the-output-pane").css("visibility", "visible");
    }, 1);
  };
  
  if (queryEditorOptions.content) {
    outputPaneOptions.queryLoaded = true;
  }

  c = CueCard.createComposition({
    queryEditorElement: $('#the-query-editor')[0],
    queryEditorOptions: queryEditorOptions,
    outputPaneElement: $('#the-output-pane')[0],
    outputPaneOptions: outputPaneOptions,
    controlPaneElement: $('#the-control-pane')[0],
    controlPaneOptions: controlPaneOptions
  });
  
  c.page_chrome_height =  $("#header").outerHeight() + 
                        $("#breadcrumb").outerHeight() + 
                        $("#footer").outerHeight() + 
                        ($("#content").outerHeight() - $("#content").height());
  
  $(window).bind("beforeunload", function(evt) {
    saveQuery();
  });
}

function resizePanes() {
  var innerHeight = $("body").outerHeight() - c.page_chrome_height;
  if (innerHeight) {
    $("#qe-module").height(innerHeight);
    if (c.outputPane) c.outputPane.layout(innerHeight);
    if (c.queryEditor) c.queryEditor.layout(innerHeight);
  }
};

function onResize() {
  resizePanes();
}

function onToggleControlPane(state) {
  $("span", this).addClass(state ? "remove-icon" : "add-icon").removeClass(state ? "add-icon" : "remove-icon");
  $.localstore("cc_cp", (state ? "1" : "0"), false);
}

function onToggleHeaders(state) {
  $("span", this).addClass(state ? "remove-icon" : "add-icon").removeClass(state ? "add-icon" : "remove-icon");
}

function computePermanentLink(a) {
  a.href = "?q=" + encodeURIComponent(c.queryEditor.content()) + getUrlFlags();
}

function computeCompactLink(a) {
  a.href = "?q=" + encodeURIComponent(c.queryEditor.getUnresolvedQuery()) + getUrlFlags();
}

function computeMqlReadLink(a) {
  a.href = c.queryEditor.getMqlReadURL();
}

function getUrlFlags() {
  var params = [];

  var env = c.controlPane.getQueryEnvelope({}, true);
  for (var n in env) {
    params.push("env=" + JSON.stringify(env));
    break;
  }

  if (queryEditorOptions.emql) {
    params.push("emql=1");
  }
  if ("debug" in queryEditorOptions) {
    params.push("debug=" + queryEditorOptions.debug);
  }
  if (queryEditorOptions.service != null) {
    params.push("service=" + encodeURIComponent(queryEditorOptions.service));
  }

  return params.length == 0 ? "" : ("&" + params.join("&"));
}

function saveQuery() {
  var q = CueCard.jsonize(
    {
      t: c.queryEditor.content(),
      e: c.controlPane.getQueryEnvelope({}, true, true)
    },
    {
      breakLines: false
    }
  );
  $.localstore("qe_initialQuery", q, false);
}

function computeTinyCompactLink() {
  var q = c.queryEditor.getUnresolvedQuery();
  var url = CueCard.helper + "tinyurl.ajax?q=" + encodeURIComponent(q) + getUrlFlags() + "&autorun=1";
  var cont = CueCard.UI.createBlockingContinuations(function(cont, o) {
    window.prompt("Tiny URL to copy", o.result.url);
  });

  $.post(url, {}, cont.onDone, "json");
}

function closeStartingMessage() {
  $("#starting-message-container").hide();
  $.localstore('cc_greeting', '0', false);
}

function refreshCache() {
  $.post(fb.acre.freebase.site_host + "/api/service/touch?mw_cookie_scope=domain", {}, null, function() {});
}


$(function(){
  onLoad();
  $(window).resize(onResize);
});
