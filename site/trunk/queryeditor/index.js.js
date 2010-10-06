CueCard.helper = SERVER.acre.request.app_url + "/cuecard/";
CueCard.freebaseServiceUrl = SERVER.acre.freebase.service_url + "/";
CueCard.urlPrefix = "/cuecard/";
CueCard.apiProxy.base = SERVER.acre.request.app_url + "/cuecard/";


var c;
var queryEditorOptions;

function onLoad() {
    // This is only for debugging the development untagged version of the acre app
    // CueCard.apiProxy.base = "http://cuecard.dfhuynh.user.dev.freebaseapps.com/";

    if ($.cookie('cc_greeting') == '0') {
    	$("#starting-message-container").hide();
  	}

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
    var margin = 20;
    var spacing = 10;
    var controlPaneHeight = 250;
    var splitterHeight = 12;
    
    var width = ("innerWidth" in window ? window.innerWidth : document.body.offsetWidth);
    var halfWidth = Math.round((width - 2 * margin - spacing) / 2) + "px";
    var height = ("innerHeight" in window ? window.innerHeight : document.body.offsetHeight) - 
        $("#footer")[0].offsetHeight - $("#header")[0].offsetHeight;
    
    $("#body")
        .css("top", $("#header")[0].offsetHeight + "px")
        .css("height", height + "px");
        
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
  if (document.location.href.indexOf(".freebase.com/") > 0) {
    $.post("http://www.freebase.com/api/service/touch?mw_cookie_scope=domain", {}, null, function() {});
  } else if (document.location.href.indexOf(".sandbox-freebase.com/") > 0) {
    $.post("http://www.sandbox-freebase.com/api/service/touch?mw_cookie_scope=domain", {}, null, function() {});
  } else {
    $.get("/acre/touch", {}, null, function() {});
  }
}
