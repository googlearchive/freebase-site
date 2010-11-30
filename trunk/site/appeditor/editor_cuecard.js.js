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

var QueryEditor = function(parent, editor_config, task) {
   var cuecardComposition;
    parent.innerHTML =
        '<div style="position: relative">' +
            '<div style="position: absolute;"></div>' +
            '<div style="position: absolute;"></div>' +
        '</div>';
        
    var queryEditorDiv = parent.firstChild.childNodes[0];
    var outputPaneDiv = parent.firstChild.childNodes[1];
    var self = this;
    
    var resize = function() {
        var margin = 10;
        var spacing = 10;
        
        var width = Math.max(100, parent.offsetWidth);
        var halfWidth = Math.round((width - 2 * margin - spacing) / 2) + "px";
        var height = Math.max(100, parent.offsetHeight);
        
        parent.firstChild.style.width = "100%";
        parent.firstChild.style.height = height + "px";
            
        var innerHeight = height - 2 * margin;
        var queryEditorHeight = innerHeight;
        $(queryEditorDiv).css("top", margin + "px").css("height", queryEditorHeight + "px");
        $(queryEditorDiv).css("left", margin + "px").css("width", halfWidth);
        $(outputPaneDiv).css("right", margin + "px").css("width", halfWidth).css("top", margin + "px").css("height", innerHeight + "px");
        
        cuecardComposition.queryEditor.layout();
        cuecardComposition.outputPane.layout();
    };

    editor_config.focusOnReady = true;
    editor_config.onReady = function() {
        task.ready(self);
    };
    
    
    cuecardComposition = CueCard.createComposition({
        queryEditorElement: queryEditorDiv,
        queryEditorOptions: editor_config,
        outputPaneElement: outputPaneDiv,
        outputPaneOptions: { verticalPadding: 2, horizontalPadding: 2 }
    });
    this.composition = cuecardComposition;
    
    cuecardComposition.queryEditor._onRun = function(forceCleanUp) {
        this.run(true); // always clean up, even when invoked with keyboard shortcut
    };
    
    this.get_state = function() {
        return { text: cuecardComposition.queryEditor.content() };
    };
    
    this.set_state = function(obj) {
        cuecardComposition.queryEditor.content(obj.text);
    };
        
    this.destroy = function() {
        // TODO: do proper disposing in cuecard
        $(parent).hide();
        $(parent).remove();
    };
    
    this.show = function(prefs) {
        var self = this;
        // TODO: temp hack until I can do this better with David's help
        self._prefs = prefs;
        if (prefs.emql) {          
            this.composition.queryEditor._getQueryEnvelope = function() {
                return { extended : 1 };
            };
        }
        
        var editor = cuecardComposition.queryEditor._editor;
        setTimeout(function() {
          editor.setLineNumbers(prefs.margin);
          editor.setTextWrapping(prefs.softwrap);
          self._file.trigger_editor_event('linechange',[editor.currentLine()]);
          
          // Firefox BUG: selection not preserved when iframe is hidden
          if (editor._last_selection) {
            var start = editor._last_selection.start;
            var end   = editor._last_selection.end;
            editor.selectLines(start.line, start.character, end.line, end.character);
            delete editor._last_selection;
          }
          
        },1);
        
        $(window).bind('resize', resize);
        
        $('.cuecard-queryEditor-controls-bottom').acre("templates", "query_button_bar");
        $(self._file.get_element()).show();
        $(parent).show();
        
        resize();
    };
    this.hide = function() {
        $(parent).hide();
        
        $(window).unbind('resize', resize);
    };
    
    this.undo = function() {
        cuecardComposition.queryEditor._editor.editor.history.undo();
    };
    
    this.redo = function() {
        cuecardComposition.queryEditor._editor.editor.history.redo();
    };
    
    this.reindentSelection = function() {
        cuecardComposition.queryEditor._editor.editor.reindentSelection();
    };
    
    this.query_assist = function() {
        cuecardComposition.queryEditor.startAssistAtCursor();
    };
    
    this.query_run = function() {
        cuecardComposition.queryEditor.run(this._file.is_writable());
    };
    
    this.query_redangle = function() {
        var self = this;
        var qe = cuecardComposition.queryEditor;
        
        var m = qe.getQueryModelAndContext();
        var q = m.model;
        q.toInsideOutQueryJson(m.context, CueCard.UI.createBlockingContinuations(function(cont, q2) {
            qe.content(CueCard.jsonize(q2, qe.getJsonizingSettings()));
        }));
    };
    
    this.generate_template = function() {
        var self = this;
        
        var name = ui.get_app().get_untitled_file_name();
        var metadata = { acre_handler: 'mjt' };
        
        var m = cuecardComposition.queryEditor.getQueryModelAndContext();
        var q = m.model.toQueryJson();
        
        CueCard.CodeGeneration.serializers["acre-template"].generateQueryCall = function(context, writer, utils, queryJSON, variables, qVar, oVar) {
            writer.appendIndent(); writer.append("<acre:script>"); writer.appendLineBreak();
            writer.indent();

            writer.appendIndent(); writer.append('var ' + qVar + ' = acre.require("' + self._file.get_name() + '").query');
            writer.append(";"); writer.appendLineBreak();
            if (self._prefs.emql) {
                writer.appendIndent(); writer.append('var ' + oVar + ' = acre.freebase.mqlread(' + qVar +', {extended:1});'); writer.appendLineBreak();
            } else {
                writer.appendIndent(); writer.append('var ' + oVar + ' = acre.freebase.mqlread(' + qVar +');'); writer.appendLineBreak();
            }

            writer.unindent();
            writer.appendIndent(); writer.append("</acre:script>"); writer.appendLineBreak();

            return oVar + ".result";
        };
        
        var text = CueCard.CodeGeneration.generate(q, CueCard.CodeGeneration.serializers["acre-template"],{indentLevel: 1});
        text =
            '<html>\r' +
            '<head>\r\r' +
            '  <title>Query-Generated Template</title>\r\r' +
            '  <style type="text/css" media="screen">\r' +
            '    * { vertical-align: baseline; font-weight: inherit; font-family: inherit; \r' +
            '        font-style: inherit; font-size: inherit; border: 0 none; outline: 0; padding: 0; margin: 0; }\r' +
            '    body { margin: 15px; }\r' +
            '    ul { list-style: none; }\r' +
            '    li { padding: 3px; }\r' +
            '    table { border-collapse: collapse; border-spacing: 0; width: 100%; }\r' +
            '    th, td { border: 1px solid #ddd; vertical-align: top; padding: 6px; }\r' +
            '    th { width: 20%; text-align: right; font-size: 11px; font-weight: bold; padding: 6px; color: #666; background: #f5f5f5; }\r' +
            '    td { width: 80%; font-size: 12px; }\r' +
            '    img { padding: 1px; border: 1px solid #ccc;}\r' +
            '    ins { color: #aaa; text-decoration: none;}\r' +
            '  </style>\r\r' +
            '</head>\r\r' +
            '' +
            '<body>\r' + 
            text + 
            '  \r' +
            '  <!-- Freebase attribution template -->\r' +
            '  ${acre.require("/freebase/apps/attribution/templates").blanket()}\r' +
            '</body>\r' +
            '</html>\r';

        ui.do_file_create_new(name, metadata, {text: text});
    };
    
    CodeMirror.prototype.highlight_line = function() {
        var editor = this;
        var file =  editor._file;
        
        var linenum = editor.currentLine();
        var $lineNumbers = $(editor.lineNumbers);
        $lineNumbers.find('.Codemirror-current-line').removeClass('Codemirror-current-line');
        $lineNumbers
            .find('div')
            .eq(linenum)
            .addClass('Codemirror-current-line');
        file.trigger_editor_event('linechange',[linenum]); 
    };
    
    this.goto_line = function(linenum) {
        var cm = cuecardComposition.queryEditor._editor.editor;
        try {
            cm.jumpToLine(linenum);            
        } catch(e) {
            // catch out-of-range line number
            cm.selectLines(cm.prevLine(cm.lastLine()), 0);
        }
    };
};

(function(){
    
    /* 
     *   A task for creating a new instance of QueryEditor
     */
    var CreateQueryEditor = mjt.define_task(null, [{name: 'parent'},{name: 'editor_config'}]);
    CreateQueryEditor.prototype._task_class = 'CreateQueryEditor';
    CreateQueryEditor.prototype.request = function() {
        return new QueryEditor(this.parent, this.editor_config, this);
    };
    
    QueryEditor.t_load = function(file, state) {
        
        // Make sure CueCard is correctly initialized
		CueCard.helper = SERVER.acre.freebase.site_host + "/cuecard/";
		CueCard.freebaseServiceUrl = SERVER.acre.freebase.service_url + "/";
		CueCard.urlPrefix = "/cuecard/";
		CueCard.apiProxy.base = SERVER.acre.freebase.site_host + "/cuecard/";
        
        /* CREATE EDITOR CONFIG */
        // make a deep copy of the default config object so that each file can have different settings
        var editor_config = $.extend(true,{},EDITORS.QueryEditor.config);
        editor_config.readOnly = !file.is_writable();
                
        var top_element = document.createElement('div');
        $(top_element).css({height: '100%', width: '100%'});
        $(file.get_element()).hide().append(top_element);
        editor_config.codeMirror.onChange = function() {
            try {
                var editor = file._loaded_editors["QueryEditor"].composition.queryEditor._editor;
                var history = editor.historySize();
                file.trigger_editor_event('change', [ history.undo, history.redo ]);        
            } catch(e) {}
        };
        editor_config.codeMirror.cursorActivity = function() { 
            var editor = file._loaded_editors["QueryEditor"].composition.queryEditor._editor;
            editor.highlight_line();
        };
        
        var loadtask;
        var task = CreateQueryEditor(top_element, editor_config)
            .onready(function(editor) {
                editor.composition.queryEditor._editor.setParser('JSParser');     
                if (state) { editor.set_state(state); }
                else if (loadtask) { editor.set_state({text: loadtask.result.text}); }
                editor._file = editor.composition.queryEditor._editor._file = file;
                editor._top_element = top_element;
                $('>div',top_element).css('height','100%');
                $('.cuecard-queryEditor-controls-top').hide();
                if (editor_config.readOnly) { 
                    $(file.get_element()).addClass('readonly');
                    $('.cuecard-queryEditor-inner', file.get_element()).append("<div class='readonly-warning'>READ ONLY</div>");
                }
                $('<a class="cuecard-permalink" href="javascript:{}">Open in Query Editor</a>')
                    .click(function(evt) {
                        var url = "http://www.freebase.com/app/queryeditor?q=" + 
                            encodeURIComponent(editor.composition.queryEditor.getUnresolvedQuery());
                        window.open(url, "_blank");
                    })
                    .appendTo($(top_element).find('.cuecard-outputPane')[0]);
                
                file.trigger_editor_event('newframe', [editor.composition.queryEditor._editor.frame]);
            });

        if (!state && file.has_been_saved()) {
            loadtask = file.t_get_revision();
            task.require(loadtask);
        }
    
        return task;
    };
})();

EDITORS.QueryEditor = {
    editor_class        : QueryEditor,
    supports            : {
        margin              : true,
        linenumbers         : true,
        softwrap            : true,        
        undo                : true,
        indent              : true,
        inline_preview      : true,
        emql                : true
    },
    config              : {
        codeMirror: {
            parserConfig: {json: true},  //TODO: remove once cuecard version is greater than 1.3.4
            lineNumbers: false
        }
      /* HACK: David - are any of these options actually respected by cuecard/api/scripts/query-editor.js?
        height              : '100%',
        marginWidth         : 45,      // is actually used by QueryEditor?
        autoMatchParens     : true,
        passDelay           : 100,     // gap between highlighting runs (each run lasts 50ms - see passTime in codemirror.js)
        undoDelay           : 250,     // min time between onChange notifications (and undo history commit)
        // These options must match settings in build.sh
        path                : 'codemirror/js/',
        parserfile          : ['parsexml.js', 'parsecss.js', 'tokenizejavascript.js', 'parsejavascript.js', 'parsehtmlmixed.js', 'parsedummy.js'],
        stylesheet          : ['codemirror/css/xmlcolors_acrid.css', 'codemirror/css/jscolors_acrid.css', 'codemirror/css/csscolors_acrid.css'],
        lineNumbers         : true,
        tabMode             : "shift",
        emql                : false
        */
    }
};
