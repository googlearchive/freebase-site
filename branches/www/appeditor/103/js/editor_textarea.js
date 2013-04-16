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

////////////////////////////
//                        //
//   Editor Margin        //
//                        //
////////////////////////////

/* Line numbers for text area */

function EditorMargin(container, options) {
    this._container = container;
    this._container.innerHTML = '<div style=\'position: relative; left: 0; top: 0; width: 100%; height: 100%\'></div>';
    
    var lines = [];
    for (var i = 0; i < 100; i++) {
        lines.push('<div>0</div>');
    }
    
    this._lineMetricDiv = this._createLayer();
    this._lineMetricDiv.style.visibility = 'hidden';
    this._lineMetricDiv.innerHTML = lines.join('');
    
    this._fontMetricDiv = this._createLayer();
    this._fontMetricDiv.style.visibility = 'hidden';
    this._fontMetricDiv.style.height = '100em';
    
    this._lineNumberDiv = this._createLayer();
    this._lineNumberDiv.className = 'editor-margin-line-numbers';
    
    this._firstRenderedLine = 0;
    this._renderedLineCount = 0;
    this._currentLine = -1;
}

(function(){

    EditorMargin.get_layout_metrics = function(win, elmt) {
        var style;
        if (win.getComputedStyle) {
            style = win.getComputedStyle(elmt, null);
            return {
                paddingTop: style.getPropertyValue('padding-top'),
                marginTop:  style.getPropertyValue('margin-top')
            };
        } else {
            style = elmt.currentStyle;
            return {
                paddingTop: style.paddingTop,
                marginTop:  style.marginTop
            };
        }
    };
    
    EditorMargin.prototype = {
        dispose: function() {
        },
        redraw: function(layoutMetrics, scrollInfo) {
            var lineHeight = this._lineMetricDiv.offsetHeight / 100;
            var fontHeight = this._fontMetricDiv.offsetHeight / 100;
            var lineToFontHeightRatio = lineHeight / fontHeight;
        
            var maxLineCount = null;
            if (scrollInfo.contentHeight !== null) {
                maxLineCount = Math.floor(scrollInfo.contentHeight / lineHeight);
            }
        
            var newFirstVisibleLine = Math.floor(scrollInfo.scrollY / lineHeight);
                /*  [david]: If the user changes the font size on the fly (with Ctrl-+ and Ctrl--)
                    then the line numbers get mis-aligned, until they are redrawn again. To fix that,
                    we'd need to set newFirstVisibleLine to 0 and force drawing from the
                    beginning no matter what.
                */
            
            var newLastVisibleLine = Math.ceil((scrollInfo.scrollY + scrollInfo.visibleHeight) / lineHeight) - 1;
            if (maxLineCount !== null) {
                newLastVisibleLine = Math.min(newLastVisibleLine, maxLineCount - 1);
            }
        
            var renderedLastLine = this._firstRenderedLine + this._renderedLineCount;
            if (newFirstVisibleLine < this._firstRenderedLine || 
                newFirstVisibleLine >= renderedLastLine ||
                newLastVisibleLine >= renderedLastLine ||
                (maxLineCount !== null && maxLineCount < newLastVisibleLine)) {
            
                var newVisibleLineCount = newLastVisibleLine - newFirstVisibleLine + 1;
                var newFirstRenderedLine = Math.max(0, newFirstVisibleLine - newVisibleLineCount); // back one page's worth of lines
                var newLastRenderedLine = newLastVisibleLine + newVisibleLineCount; // forward one page's worth of lines
            
                if (maxLineCount !== null) {
                    newLastRenderedLine = Math.min(newLastRenderedLine, maxLineCount - 1);
                }
            
                this._lineNumberDiv.style.paddingTop = (lineToFontHeightRatio * newFirstRenderedLine) + 'em';
            
                var html = [];
                for (var i = newFirstRenderedLine; i <= newLastRenderedLine; i++) {
                    html.push('<div>' + (i + 1) + '</div>');
                }
                this._lineNumberDiv.innerHTML = html.join('');
            
                this._firstRenderedLine = newFirstRenderedLine;
                this._renderedLineCount = newLastRenderedLine - newFirstRenderedLine + 1;
            
                this._highlightCurrentLine();
            }
            
            var parseIntoPixels = function(s) {
                try {
                    if (s.indexOf("px") > 0) {
                        return parseInt(s.replace(/px$/g, ''), 10);
                    } else if (s.indexOf("em") > 0) {
                        return Math.round(parseFloat(s.replace(/em$/g, ''), 10) * fontHeight);
                    }
                } catch (e) {
                }
                return 0;
            };
        
            this._lineNumberDiv.style.top = 
                (-scrollInfo.scrollY + 
                    parseIntoPixels(layoutMetrics.paddingTop) + 
                    parseIntoPixels(layoutMetrics.marginTop)) + 'px';
        },
        _createLayer: function() {
            var layerDiv = document.createElement('div');
            layerDiv.style.position = 'absolute';
        
            this._container.firstChild.appendChild(layerDiv);
        
            return layerDiv;
        },
        setCurrentLine: function(line) {
            if (line !== this._currentLine) {
                this._unhighlightCurrentLine();
                this._currentLine = line;
                this._highlightCurrentLine();
            }
        },
        _unhighlightCurrentLine: function() {
            if (this._currentLine !== -1) {
                var childNodes = this._lineNumberDiv.childNodes;
                var index = this._currentLine - this._firstRenderedLine;
                if (index >= 0 && index < childNodes.length) {
                    childNodes[index].className = '';
                }
            }
        },
        _highlightCurrentLine: function() {
            if (this._currentLine !== -1) {
                var childNodes = this._lineNumberDiv.childNodes;
                var index = this._currentLine - this._firstRenderedLine;
                if (index >= 0 && index < childNodes.length) {
                    childNodes[index].className = 'edit-margin-current-line-number';
                }
            }
        }
    };

})();



///////////////////////////
//                       //
//    Textarea Editor    //
//                       //
///////////////////////////

var TextareaEditor;
(function(){
    
    TextareaEditor = function(options) {
        var self     = this;
                
        self._edit_element    = document.createElement('textarea');
        if (options.cssClassName) { self._edit_element.className = options.cssClassName; }
        
        if (options.readOnly) {
            $(self._edit_element).attr('readonly','yes').addClass('readonly');
            $(self._top_element).append("<div class='readonly-warning'>READ ONLY</div></div>");
        }

        if (options.on_change) {
            self.timeout_id=null;
            var handler = function(e) {
                if (self.timeout_id) { window.clearTimeout(self.timeout_id); }
                self.timeout_id = window.setTimeout(options.on_change,300);
            };
            
            var events = [
                'input',  // this should be enough, but only FF supports it. https://bugs.webkit.org/show_bug.cgi?id=15189
                'drop'    // FF does not fire 'input' when you drop text into a textarea :-(
            ]; 
            if (!$.browser.mozilla) {
                events.push('paste','keypress');
            }
            
            for (var i=0;i<events.length;i++) {
                $(self._edit_element).bind(events[i],handler);
            }
        }
    };
    
    TextareaEditor.t_load = function(file, state) {
        /* CREATE EDITOR CONFIG */
        var editor_config               = EDITORS.TextareaEditor.config;
        editor_config.readOnly          = !file.is_writable();
        
        editor_config.on_change         = function(e) {
          file.trigger_editor_event('change', []);
        };
        
        var editor = new TextareaEditor(editor_config);
        editor._top_element = document.createElement('div');
        $(editor._top_element).css({height: '100%', width: '100%'});
        $(file.get_element()).append(editor._top_element);
        $(editor._top_element).append(editor._edit_element);    

        /* set up editor margin (whether showing or not) */
        editor._margin_width                = editor_config.marginWidth;
        editor._margin_element              = document.createElement('div');
        editor._margin_element.className    = 'edit-margin';
        $(editor._top_element).append(editor._margin_element);
                
        var task = mjt.Succeed(editor);

        if (state) {
            editor.set_state(state);
        } else if (file.has_been_saved()) {
            var loadtask = file.t_get_revision().onready(function(r){
                editor.set_state({text: r.text});
            });
            task.require(loadtask);
        }
        
        return task;
    };
    
    TextareaEditor.prototype.destroy = function() {
        var editor = this;
        $(editor._top_element).remove();
        editor = null;
    };
    
    TextareaEditor.prototype.show = function(prefs) {
        var editor = this;
        editor._prefs = prefs;
        
        if (prefs.margin) {
            if (!editor.editorMargin) { editor.editorMargin = new EditorMargin(editor._margin_element, {}); }
            editor._scroll_callback = function() { editor._redraw_editor_margin(); };
            
            if ($.browser.msie) {
                editor._edit_element.onscroll = editor._scroll_callback;
            } else {
                $(editor._edit_element).bind('scroll', editor._scroll_callback);
            }
        }
        
        editor._resize_callback = function() { editor._on_resize(); };
        $(window).bind('resize', editor._resize_callback);

        editor._on_resize();
        
        $(editor._top_element).show();
    };
    
    TextareaEditor.prototype.hide = function() {
        var editor = this;
        
        $(editor._top_element).hide();
        $(editor._edit_element).unbind('scroll', editor._scroll_callback);
        $(window).unbind('resize', this._resize_callback);
    };
    
    TextareaEditor.prototype.get_state = function() {
        return { text: this._edit_element.value };
    };
    
    TextareaEditor.prototype.set_state = function(obj) {
        this._edit_element.value = obj.text;
    };
    
    TextareaEditor.prototype._on_resize = function() {
        if (this._prefs.margin) {
            $(this._edit_element).css('left', this._margin_width);
            $(this._edit_element).width($(this._top_element).width() - this._margin_width);
            $(this._margin_element).width(this._margin_width);
            $(this._margin_element).show();
            this._redraw_editor_margin();
        } else {
            $(this._edit_element).css('left', 0).width($(this._top_element).width());
            $(this._margin_element).hide();
        }
    };
    
    TextareaEditor.prototype._redraw_editor_margin = function() {
        if (this._prefs.margin) {
            try {
                var scrollInfo = this._get_scroll_info();
                var layoutMetrics = this._get_layout_metrics();
                this.editorMargin.redraw(layoutMetrics, scrollInfo);
            } catch(e) {}
        }
    };
    
    TextareaEditor.prototype._get_scroll_info = function() {
        return {
            scrollY:        $(this._edit_element).scrollTop(),
            visibleHeight:  $(this._edit_element).innerHeight(),
            contentHeight:  null // we don't know
        };
    };
    
    TextareaEditor.prototype._get_layout_metrics = function() {
        return EditorMargin.get_layout_metrics(window, this._edit_element);
    };
    
})();


EDITORS.TextareaEditor = {
    name                : "TextArea",
    editor_class        : TextareaEditor,
    supports            : {
        hotswap             : true,
        mimetype_change     : true,
        margin              : true
    },
    config              : {
        cssClassName        : 'Editor-view',
        marginWidth         : 45
    }
};
