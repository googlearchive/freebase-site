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

        if (!self.readOnly) {
            self.form_element = $('<form class="image-upload"><label for="image-browse">' + uploadprompt + ':</label> <input id="image-browse" type="file" name="file" size="40"></form>');
            $(self.form_element).change(self.on_change);
            $(self.ui_element).append(self.form_element);
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
        
            $(self.ui_element).append('<div class="image-attribution"><img src="img/freebase-cc-by-61x23.png" alt="Freebase CC-BY" width="61" height="23" /><p>All images included in Acre apps are released under <a href="http://creativecommons.org/licenses/by/3.0/">CC-BY</a>.</p></div>');
        
        
        
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
