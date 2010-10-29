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

CueCard.helper = SERVER.acre.request.app_url + "/cuecard/";
CueCard.freebaseServiceUrl = SERVER.acre.freebase.service_url + "/";
CueCard.urlPrefix = "/cuecard/";
CueCard.apiProxy.base = SERVER.acre.request.app_url + "/cuecard/";


var c = {};
var queryEditorOptions;

function onLoad() {

    if ($.cookie("cc_cp") == "0") {
      $("#the-control-pane")[0].style.display = "none";
    }
  
    resizePanes();
    
    var params = CueCard.parseURLParameters();
        
    var outputPaneOptions = {};
    var controlPaneOptions = {
        extended: 0 // Don't make this sticky: $.cookie("cc_cp_extended") == "1" ? 1 : 0
    };
    
    queryEditorOptions = {
        focusOnReady: true,
        onUnauthorizedMqlWrite: function() {
            if (window.confirm("Query editor needs to be authorized to write data on your behalf. Proceed to authorization?")) {
                saveQueryInWindow();
                
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
        emql: "emql" in params && params["emql"] == "1",
        service: "service" in params ? params["service"] : null
    };
    
    if ("debug" in params) {
        queryEditorOptions.debug = params.debug;
    }
    
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
            var o = JSON.parse(window.name);
            if ($.trim(o.t).length > 0) {
                queryEditorOptions.content = o.t;
            }
            controlPaneOptions.env = o.e;
        } catch (e) {
            if ("initialQuery" in window) {
                queryEditorOptions.content = window.initialQuery;
            }
        }
    }
    
    c = CueCard.createComposition({
        queryEditorElement: $('#the-query-editor')[0],
        queryEditorOptions: queryEditorOptions,
        outputPaneElement: $('#the-output-pane')[0],
        outputPaneOptions: {},
        controlPaneElement: $('#the-control-pane')[0],
        controlPaneOptions: controlPaneOptions
    });
    
    $("#the-splitter").click(onToggleControlPane);
    
    $(window).bind("beforeunload", function(evt) {
        saveQueryInWindow();
    });
    
    if ("autorun" in params) {
    	queryEditorOptions.onReady = function() {
      c.queryEditor.run(false);
    };
  }
}

function resizePanes() {
    var margin = 0;
    var spacing = 10;
    var controlPaneHeight = 250;
    var splitterHeight = 12;
    
    var width = $("#content-main").width();
    var halfWidth = Math.round((width - 2 * margin - spacing) / 2);
    var height = $(window).height() - $("#page-header").outerHeight(true) - $(".page-header").outerHeight(true) - 
        $("#page-footer").outerHeight(true) - $("#devbar").outerHeight();
    
    $("#qe-container").height(height - 30); // the margin on 
        
    var innerHeight = height - 2 * margin;
    if ($("#the-control-pane")[0].style.display == "block") {
        var queryEditorHeight = innerHeight - splitterHeight - controlPaneHeight - 2 * spacing;
        $("#the-query-editor").css("top", margin + "px").css("height", queryEditorHeight + "px");
        $("#the-splitter").css("top", (margin + queryEditorHeight + spacing) + "px").css("height", splitterHeight + "px");
        $("#the-control-pane").css("top", (margin + queryEditorHeight + spacing + splitterHeight + spacing) + "px").css("height", controlPaneHeight + "px");
        $("#the-control-pane").css("left", margin + "px").css("width", halfWidth);
    } else {
        var queryEditorHeight = innerHeight - splitterHeight - spacing;
        $("#the-query-editor").css("top", margin + "px").css("height", queryEditorHeight + "px");
        $("#the-splitter").css("top", (margin + queryEditorHeight + spacing) + "px").css("height", splitterHeight + "px");
    }
    $("#the-splitter").css("left", margin + "px").css("width", halfWidth);
    $("#the-query-editor").css("left", margin + "px").css("width", halfWidth)
    $("#the-output-pane").css("right", margin + "px").css("width", halfWidth).css("top", margin + "px").css("height", innerHeight + "px");
};

function onResize() {
    resizePanes();
    
    c.queryEditor.layout();
    c.controlPane.layout();
    c.outputPane.layout();
}

function onToggleControlPane() {
    var cp = $("#the-control-pane")[0];
    cp.style.display = cp.style.display == "block" ? "none" : "block";
    
    onResize();
    
    $.cookie("cc_cp", $("#the-control-pane")[0].style.display == "none" ? "0" : "1", { expires: 365 });
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

function saveQueryInWindow() {
    window.name = CueCard.jsonize(
        {
            t: c.queryEditor.content(),
            e: c.controlPane.getQueryEnvelope({}, true)
        },
        {
            breakLines: false 
        }
    );
}

function computeTinyCompactLink() {
  var q = c.queryEditor.getUnresolvedQuery();
  var url = CueCard.helper + "tinyurl?q=" + encodeURIComponent(q) + getUrlFlags() + "&autorun=1";
  var cont = CueCard.UI.createBlockingContinuations(function(cont, o) {
    window.prompt("Tiny URL to copy", o);
  });
  
  $.post(url, {}, cont.onDone, "json");
}

function closeStartingMessage() {
  $("#starting-message-container").hide();
  $.cookie('cc_greeting', '0', { expires: 365 });
}

function refreshCache() {
  $.post(SERVER.acre.freebase.service_url + "/api/service/touch?mw_cookie_scope=domain", {}, null, function() {});
}


$(function(){
  onLoad();
  $(window).resize(onResize);
});
