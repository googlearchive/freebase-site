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

(function($, fb) {
  
  fb.query = {
    save: function(e, query_id) {
      window.alert("TODO - save "+ query_id);
    }
  };
  
  CueCard.helper = fb.h.ajax_url("lib/cuecard/");
  CueCard.freebaseServiceUrl = fb.acre.freebase.service_url + "/";
  CueCard.urlPrefix = CueCard.apiProxy.base = fb.h.ajax_url("lib/cuecard/");

  function onLoad() {
    var outputPaneOptions = {
      toggle_callback: onToggleHeaders,
      stylesheet: $("#cuecard-outputPane-stylesheet").attr("href"),
      initial_tab: "json"
    };

    var queryEditorOptions = {
      readOnly: !fb.permission.has_permission,
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

    if (fb.c && fb.c.query) {
      queryEditorOptions.content = JSON.stringify(fb.c.query);
      queryEditorOptions.cleanUp = true;
      autorun = true;
    }

    queryEditorOptions.onReady = function() {
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
      outputPaneOptions: outputPaneOptions
    });

    c.page_chrome_height =  $("#header").outerHeight() +
                          $("#breadcrumb").outerHeight() +
                          $("#page-header").outerHeight() +
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

  function saveQuery() {
    // pompt
    //window.alert("TO DO - implement save check");
  }

  function refreshCache() {
    $.post(fb.acre.freebase.site_host + "/api/service/touch?mw_cookie_scope=domain", {}, null, function() {});
  }
  
  onLoad();
  $(window).resize(onResize);
  
})(jQuery, window.freebase);

