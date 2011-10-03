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
  
  var qe = fb.queryeditor = {
    
    init: function() {
      
      CueCard.helper = fb.h.ajax_url("lib/cuecard/");
      CueCard.freebaseServiceUrl = fb.acre.freebase.service_url + "/";
      CueCard.urlPrefix = CueCard.apiProxy.base = fb.h.ajax_url("lib/cuecard/");

      var outputPaneOptions = {
        stylesheet: $("#cuecard-outputPane-stylesheet").attr("href"),
        initial_tab: "json"
      };

      var queryEditorOptions = {
        focusOnReady: true,
        codeMirror: {
          parserfile: [$("#codemirror-js").attr("href")],
          stylesheet: [$("#codemirror-css").attr("href")]
        }
      };

      if (!fb.permission.has_permission) {
        queryEditorOptions.readOnly = true;
        queryEditorOptions.hideControls = true;
      }

      if (fb.c && fb.c.query) {
        queryEditorOptions.content = JSON.stringify(fb.c.query);
        queryEditorOptions.cleanUp = true;
        autorun = true;
        outputPaneOptions.queryLoaded = true;
      }

      queryEditorOptions.onReady = function() {
        qe.resize();
        $(window).resize(qe.resize);
        if (autorun) qe.cuecard.queryEditor.run(false);

        // fulhack to hide initial laying out
        setTimeout(function() {
          $("#qe-module, #the-output-pane").css("visibility", "visible");
        }, 1);
      };

      qe.cuecard = CueCard.createComposition({
        queryEditorElement: $('#the-query-editor')[0],
        queryEditorOptions: queryEditorOptions,
        outputPaneElement: $('#the-output-pane')[0],
        outputPaneOptions: outputPaneOptions
      });

      qe.page_chrome_height =  $("#header").outerHeight() +
                               $("#page-header").outerHeight() +
                               $("#footer").outerHeight() + 
                               ($("#page-content").outerHeight(true) - $("#page-content").height()) +
                               $("#page-title").outerHeight(true);

      $(window).bind("beforeunload", function(evt) {
        // TODO - check whether query neeeds saving
      });
    },

    resize: function() {
      var innerHeight = $("body").outerHeight() - qe.page_chrome_height;
      if (innerHeight) {
        $("#qe-module").height(innerHeight);
        if (qe.cuecard.outputPane) qe.cuecard.outputPane.layout(innerHeight);
        if (qe.cuecard.queryEditor) qe.cuecard.queryEditor.layout(innerHeight);
      }
    },

    save: function(e, query_id) {
      window.alert("TODO: save "+ query_id);
    }
    
  };
  
  $(qe.init());
  
})(jQuery, window.freebase);

