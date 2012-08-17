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

var BespinEditor;

(function(){
    
    BespinEditor = function(env) {
        this.env = env;
        this.editor = env.editor;
        return this;
    };
    
    /* 
     *   A task for creating a new instance of Bespin
     *   NOTE: bespin itself is defined in bespin/
     */
    var CreateBespin = mjt.define_task(null, [{name: 'parent'},{name: 'editor_config'}]);
    CreateBespin.prototype._task_class = 'CreateBespin';
    CreateBespin.prototype.request = function() {
        var task = this;
        bespin.useBespin(this.parent, this.editor_config).then(function(env) {
            var editor = new BespinEditor(env);
            
            editor.get_state = function() {
              return { text: this.editor.value };
            };

            editor.set_state = function(obj) {
              this.editor.value = obj.text;
            };
            
            task.ready(editor);
        });
    };
    

    function determine_parser(file) {
        var parser = 'DummyParser'; // default
        
        var BESPIN_DOCTYPE_MAP = {
            'mqlquery': 'js',
            'acre_script': 'js',
            'mjt': 'html'
            // 'passthrough' : see BESPIN_MEDIATYPE_MAP
        };

        var BESPIN_MEDIATYPE_MAP = {
            'text/html'  : 'html',
            'text/css'   : 'js',
            'text/javascript'  : 'js',
            'application/json' : 'js'
            // otherwise use default 'DummyParser'
        };
        
        var acre_handler = file.get_acre_handler();
        var mime_type = file.get_mime_type();
        if (mime_type !== 'text/plain' ) {
            if (mime_type in BESPIN_MEDIATYPE_MAP) {
                parser = BESPIN_MEDIATYPE_MAP[mime_type];
            }
        } else if (acre_handler in BESPIN_DOCTYPE_MAP) {
            parser = BESPIN_DOCTYPE_MAP[acre_handler];
        }

        return parser;
    }
    
    BespinEditor.t_load = function(file, state) {
        /* CREATE EDITOR CONFIG */
        // make a deep copy of the default config object so that each file can have different settings

        var editor_config = $.extend(true,{},EDITORS.BespinEditor.config);
        
        editor_config.readOnly = !file.is_writable();
        if (editor_config.readOnly) { 
            $(file.get_element()).addClass('readonly').append("<div class='readonly-warning'>READ ONLY</div>");
        }
        
        editor_config.syntax = determine_parser(file);
        
        var top_element = document.createElement('div');
        $(top_element).css({height: '100%', width: '100%'});
        $(file.get_element()).append(top_element);
        
        var loadtask;
        var task = CreateBespin(top_element, editor_config)
            .onready(function(editor) {
                
                function init_state(state) {
                    editor.set_state(state);
                    editor.goto_line(1);
                }
                
                if (state) { init_state(state); }
                else if (loadtask) { init_state({text: loadtask.result.text}); }
                
                editor.editor.textChanged.add(function(oldRange, newRange, newText) {
                    file.trigger_editor_event('change', []);
                });

                editor.editor.selectionChanged.add(function(newSelection) {
                    file.trigger_editor_event('linechange',[newSelection.start.row + 1]);
                });
                
                editor._file = file;
                editor._top_element = top_element;
                $('>div',top_element).css('height','100%');
                //file.trigger_editor_event('newframe', [editor.frame]);
            });

        if (!state && file.has_been_saved()) {
            loadtask = file.t_get_revision();
            task.require(loadtask);
        }
    
        return task;
    };
    
    BespinEditor.prototype.destroy = function() {
        var editor = this;
        
        /*
        if ("_codeAssist" in editor) { 
            editor._codeAssist.dispose();
            editor._codeAssist = null;
        }
        */
        
        $(editor._top_element).remove();
        editor = null;
    };
    
    BespinEditor.prototype.show = function(prefs) {
        var editor = this;
        editor._prefs = prefs;
        $(editor._top_element).show();
        //editor.editor.focus = true;
        
        setTimeout(function(){
            editor.env.dimensionsChanged();
        }, 1);
        
        
        /*
        setTimeout(function() {
          editor.setLineNumbers(prefs.margin);
          editor.setTextWrapping(prefs.softwrap);
          editor._file.trigger_editor_event('linechange',[editor.currentLine()]);
          if (editor._codeAssist) { editor._codeAssist.putSetting("dotTrigger", prefs.dotTrigger); }


          $('iframe',editor._top_element).focus();
          
          // Firefox BUG: selection not preserved when iframe is hidden
          if (editor._last_selection) {
            var start = editor._last_selection.start;
            var end   = editor._last_selection.end;
            editor.selectLines(start.line, start.character, end.line, end.character);
            delete editor._last_selection;
          }
          
        },1);
        */
    };
    
    BespinEditor.prototype.hide = function() {
        var editor = this;

        // Firefox BUG: selection not preserved when iframe is hidden
        /*
        var start = editor.cursorPosition();
        var end   = editor.cursorPosition(false);
        editor._last_selection = {start:start,end:end};
        */
        
        $(editor._top_element).hide();
    };
    
    BespinEditor.prototype.goto_line = function(linenum) {
        this.editor.setLineNumber(linenum);
    };
    

})();

EDITORS.BespinEditor = {
    name                : "Bespin (experimental)",
    editor_class        : BespinEditor,
    supports            : {
        hotswap             : true,
        mimetype_change     : true,
        margin              : true,
        linenumbers         : true,
        softwrap            : true,
        undo                : false,
        indent              : true,
        codeassist          : false
    },
    config              : {
        settings : {
            theme :  "white",
            fontface : 'monospace',
            fontsize : 13,
            tabstop : 2
        }
    }
};
