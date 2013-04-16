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

var ImageEditor;

(function(){

    ImageEditor = function(options) {
        var self  = this;

        this.supports_mime_type_change = false;

        this.ui_element = document.createElement('div');
        if (options.cssClassName) { self.ui_element.className = options.cssClassName; }

        this.file       = options.file;
        this.readOnly   = options.readOnly;

        if (options.onChange) {
            this.on_change   = options.onChange;
        }
    };

    ImageEditor.t_load = function(file, state) {
        var editor_config               = EDITORS.ImageEditor.config;
        editor_config.readOnly          = !file.is_writable();
        editor_config.onChange          = function(undos, redos) {
          file.trigger_editor_event('change', [undos, redos]);
        };

        var editor = new ImageEditor(editor_config);
        editor.file = file;

        $(file.get_element()).append(editor.ui_element);
        if (state) { editor.set_state(state); }

        return mjt.Succeed(editor);
    };

    ImageEditor.prototype.destroy = function() {
        var editor = this;
        $(editor.ui_element).remove();
        editor = null;
    };

    ImageEditor.prototype.show = function(prefs) {
        var self = this;
        var uploadprompt = 'Upload an image';
        self._prefs = prefs;

        $(self.ui_element).empty();
        this.file.set_dirty("content", false);

        if (self.file.has_been_saved()) {
          uploadprompt = 'Replace this image';
        }

        // TODO: Remove false if we have Image upload API
        if (false && !self.readOnly) {
            self.form_element = $('<form class="image-upload"><label for="image-browse">' + uploadprompt + ':</label> <input id="image-browse" type="file" name="file" size="40"></form>');
            $(self.form_element).change(self.on_change);
            $(self.ui_element).append(self.form_element);
        } else {
            $(self.ui_element).append('<p class="image-upload">Uploading of new images is not currently supported.</p>');
        }

        var filename = self.file.get_name();
        var app = self.file.get_app();
        var host = app.get_base_url();
        if (self.file.has_been_saved()) {
            if (self.file.get_mime_type().substr(0,6) === 'image/') {
                /*
                 * HACK - get around mwlwt third-party cookie issue by calling api directly (same host)
                 * means previews may still be stale... but all previews will be
                 */
                var img = $('<div class="image-preview"><p>' + filename + ':</p><img src=\"' + this.file.get_acre_url() + '\"/></div>');
                img.appendTo(self.ui_element);
            } else if (this.file.get_revision()) {
                $('<a href="' + host + '/' + filename + '">download file</a>').appendTo(this.ui_element);
            }
        }

        $(self.ui_element).append('<div class="image-attribution"><img src="' +
            fb.h.reentrant_url("/static", "img/freebase-cc-by-61x23.png") +
            ' alt="Freebase CC-BY" width="61" height="23" /><p>All images included in Acre apps are released under ' +
            '<a href="http://creativecommons.org/licenses/by/3.0/">CC-BY</a>.</p></div>');
        $(this.ui_element).show();
    };

    ImageEditor.prototype.refresh = ImageEditor.prototype.show;

    ImageEditor.prototype.hide = function() {
        $(this.ui_element).hide();
    };

    ImageEditor.prototype.get_state = function() {
        return {form: this.form_element};
    };

    ImageEditor.prototype.set_state = function(obj) {
        if (obj.revision) {
            this.file.set_revision(obj.revision);
            this.file.set_dirty("content");
        }
        this.show();
        return;
    };


})();

EDITORS.ImageEditor = {
    editor_class        : ImageEditor,
    supports            : {},
    config              : {
        cssClassName        : 'Editor-view'
    }
};
