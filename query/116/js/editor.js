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

(function($, fb) {

  var qe = fb.queryeditor = {

    init: function() {
      CueCard.helper = fb.h.ajax_url("lib/cuecard/");
      CueCard.freebaseServiceUrl = fb.acre.freebase.googleapis_url + "/";
      CueCard.urlPrefix = CueCard.apiProxy.base = fb.h.ajax_url("lib/cuecard/");

      var params = CueCard.parseURLParameters();
      var autorun = false;

      var outputPaneOptions = {
        toggle_callback: qe.toggleHeaders,
        initial_tab: params.tab
      };

      var controlPaneOptions = {
        paneldrawer: {
          element: $("#qe-module"),
          drawer_height: 250,
          toggle_state: ($.localstore("cc_cp") == "1"),
          toggle_callback: qe.toggleControlPane,
          panel_content: "cuecard-queryEditor-content"
        },
        extended: 0, // Don't make this sticky: $.localstore("cc_cp_extended") == "1" ? 1 : 0,
        costs: $.localstore("cc_cp_costs") == "1" ? true : false
      };

      queryEditorOptions = {
        focusOnReady: true,
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

      queryEditorOptions.onChange = function() {
        qe.is_dirty = true;
        $("#save-query").addClass("disabled");
      };

      queryEditorOptions.onRun = function(o) {
        if (o.result) {
          $("#save-query").removeClass("disabled");
        }
      };

      queryEditorOptions.onReady = function() {
        $(".cuecard-queryEditor-queryAssist").radiotoggle();

        $(".nicemenu").nicemenu();

        $("#links").prependTo("#the-output-pane .cuecard-outputPane-tabs");

        qe.resize();
        $(window).resize(qe.resize);

        qe.is_dirty = false;
        if (autorun) qe.cuecard.queryEditor.run(false);

        // fulhack to hide initial laying out
        setTimeout(function() {
          $("#qe-module, #the-output-pane").css("visibility", "visible");
        }, 1);
      };

      if (queryEditorOptions.content) {
        outputPaneOptions.queryLoaded = true;
      }

      qe.cuecard = CueCard.createComposition({
        queryEditorElement: $('#the-query-editor')[0],
        queryEditorOptions: queryEditorOptions,
        outputPaneElement: $('#the-output-pane')[0],
        outputPaneOptions: outputPaneOptions,
        controlPaneElement: $('#the-control-pane')[0],
        controlPaneOptions: controlPaneOptions
      });

      qe.page_chrome_height =  $("#header").outerHeight(true) +
                               ($("#page-content").outerHeight(true) - $("#page-content").height()) +
                               $("#page-title").outerHeight(true) +
                               $("#footer").outerHeight(true);

      $(window).bind("beforeunload", function(evt) {
        qe.store();
      });

      $(".cuecard-examples-technique").chosen();
    },

    resize: function() {
      var innerHeight = $(window).height() - qe.page_chrome_height;
      if (innerHeight) {
        $("#qe-module").height(innerHeight);
        if (qe.cuecard.outputPane) qe.cuecard.outputPane.layout(innerHeight);
        if (qe.cuecard.queryEditor) qe.cuecard.queryEditor.layout(innerHeight);
      }
    },

    toggleControlPane: function(state) {
      $.localstore("cc_cp", (state ? "1" : "0"), false);
    },

    toggleHeaders: function(state) {
      $("span", this).addClass(state ? "remove-icon" : "add-icon").removeClass(state ? "add-icon" : "remove-icon");
    },

    getUrlFlags: function() {
      var params = qe.cuecard.controlPane.getQueryEnvelope({}, true);

      if (queryEditorOptions.emql) {
        params.emql = 1;
      }

      if ("debug" in queryEditorOptions) {
        params.debug = queryEditorOptions.debug;
      }

      if (queryEditorOptions.service != null) {
        params.service = queryEditorOptions.service;
      }

      return params;
    },

    computeMqlReadLink: function(e) {
      $(this).attr("href", qe.cuecard.queryEditor.getMqlReadURL());
    },

    computePermanentLink: function(a) {
      var params = qe.getUrlFlags();
      params.q = qe.cuecard.queryEditor.content();
      $(this).attr("href", fb.h.fb_url("/queryeditor", params));
    },

    computeCompactLink: function(a) {
      var params = qe.getUrlFlags();
      params.q = qe.cuecard.queryEditor.getUnresolvedQuery();
      $(this).attr("href", fb.h.fb_url("/queryeditor", params));
    },

    computeTinyCompactLink: function() {
      var params = qe.getUrlFlags();
      params.q = qe.cuecard.queryEditor.getUnresolvedQuery();
      params.autorun = 1;
      var url = fb.h.fb_url(CueCard.helper + "tinyurl.ajax", params);
      var cont = CueCard.UI.createBlockingContinuations(function(cont, o) {
        window.prompt("Tiny URL to copy", o.result.url);
      });
      $.post(url, {}, cont.onDone, "json");
    },

    store: function() {
      var q = CueCard.jsonize(
        {
          t: qe.cuecard.queryEditor.content(),
          e: qe.cuecard.controlPane.getQueryEnvelope({}, true, true)
        },
        {
          breakLines: false
        }
      );
      $.localstore("qe_initialQuery", q, false);
    },

    save: function(e) {
      var trigger = $(this);
      fb.get_script(fb.h.static_url("query-edit.mf.js"), function() {
        qe.edit.create_begin(this);
      });
      return false;
    }

  };

  $(qe.init());

})(jQuery, window.freebase);
