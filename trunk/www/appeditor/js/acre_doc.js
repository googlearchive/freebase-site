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

/*global document assert $ EDITORS */
var AcreDoc;

(function(){
  
    var DEFAULT_MEDIA_TYPE = 'text/plain';
    var CLASSNAME = 'file';
    
    AcreDoc = function(app, name, properties, initial_state) {
        assert.critical(app, 'Must specify app when creating a file');
        this._app = app;
        
        if (name && this._app.get_store().validate_filename(name)) {
            this._name = name;
        } else {
            this._name = this._app.get_untitled_file_name();
        }
        
        this._acre_handler   = properties.handler;
        this._mime_type      = properties.media_type     || DEFAULT_MEDIA_TYPE;
        this._revision       = properties.content_id     || null;
        this._based_on       = properties.based_on       || null;
        this._has_been_saved = properties.has_been_saved || false;

        this._dom_element = document.createElement('div');
        this._dom_element.className = CLASSNAME;
        
        this._event_handlers = {};

        this._initial_state = initial_state || null;
        
        var dirty = !this.has_been_saved();
        this._dirty_state = {
            name        : dirty,
            content     : dirty,
            metadata    : dirty,
            to_delete   : false,
            revision    : false,
            editor      : false
        };

        this._loaded_editors = {};
        this._current_editor = null;
        
        this._app.register_file(this);
        return this;
    };
    
    AcreDoc.prototype.t_get_history = function(limit) {
        var file = this;
        var args = { 
            fileid: file.get_fileid()
        };
        
        var task = file.get_store().XhrGet('get_file_history', args);
        
        return task.enqueue();
    };
    
    AcreDoc.prototype.t_get_revision = function(revision) {        
        var args = {
            fileid : this.get_fileid()
        };
        
        if (this.get_app().get_repository_capability("versioned")) {
            args.revision = revision || this.get_revision();
            return args.revision ? this.get_store().XhrGet('get_file_revision', args) : mjt.Succeed({text:""});    
        } else {
            return this.get_store().XhrGet('get_file_revision', args);
        }
    };
    
    AcreDoc.prototype.hide   = function() {
        if (this._current_editor) { this._current_editor.hide(); }
        $(this._dom_element).hide();
    };
    
    AcreDoc.prototype.destroy = function() {
        var file = this;
        
        for (var key in this._loaded_editors) {
            var ed = this._loaded_editors[key];
            if (ed.destroy) { ed.destroy(); }
        }
        
        $(file._dom_element).remove();
        file = null;
    };
    
    AcreDoc.prototype.is_writable = function() {
        return this.get_app().is_writable();
    };

    AcreDoc.prototype.has_been_saved = function() {
        return !!this._has_been_saved;
    };
    
    AcreDoc.prototype.is_dirty = function(kind) {
        // kind is one of 'content' or 'metadata' and is optional
        if (kind) {
            return this._dirty_state[kind];
        } else {
            for (var k in this._dirty_state) {
                if (this._dirty_state[k] === true) { return true; }
            }
        }
        return false;
    };
    
    
    
    /* Getters */
    
    AcreDoc.prototype.get_element = function() {
        return this._dom_element;
    };

    AcreDoc.prototype.get_store = function() {
        return this.get_app().get_store();
    };

    AcreDoc.prototype.get_app = function() {
        return this._app;
    };

    AcreDoc.prototype.get_name = function() {
        return this._name;
    };
    
    AcreDoc.prototype.get_fileid = function() {
        var name = this._old_name || this._name;
        return this.get_app().get_path() + '/' + name;
    };

    AcreDoc.prototype.get_relative_path = function() {
        return this.get_name();
    };
    
    AcreDoc.prototype.get_revision = function() {
        return this._revision;
    };

    AcreDoc.prototype.get_acre_handler = function() {
        if (this._acre_handler) return this._acre_handler;
        
        var ext_md = this.get_app().get_extension_metadata(this._name);        
        return ext_md.handler || "acre_script";
    };
    
    AcreDoc.prototype.get_mime_type = function() {
        var ext_md = this.get_app().get_extension_metadata(this._name);
        return ext_md.media_type || this._mime_type;
    };
    
    AcreDoc.prototype.is_library = function() {
        return this._library;
    };
    
    AcreDoc.prototype.get_based_on = function(key) {
        return this._based_on;
    };
    
    AcreDoc.prototype.get_acre_url = function(preview) {
        return this.get_app().get_base_url() + '/' + this.get_name() + (preview ? '?acre.console=1' : '');
    };


    
    /* Setters */
    // Metadata setters are not tasks... committed on t_save()
    AcreDoc.prototype.set_name = function(new_name) {
        var file = this;
        if (new_name === file.get_name()) { return; }
        
        if (!/^[\-_0-9A-Za-z\.]+$/.test(new_name)) { 
            throw "File names can only contain alphanumeric characters, ., - and _";
        }
        
        if (!/^[A-Za-z]/.test(new_name)) { 
            throw "File names must be begin with a letter";
        }

        if (!/[0-9A-Za-z]$/.test(new_name)) { 
            throw "File names cannot end with a special character";
        }

        file._old_name = file.get_name();
        file.get_app().unregister_file(file._old_name);

        file._name = new_name;
        file.get_app().register_file(file);
        file.set_dirty('name');
    };
    
    AcreDoc.prototype.set_acre_handler = function(acre_handler) {
        if (acre_handler === this._acre_handler) { return; }
                
        this._acre_handler = acre_handler;
        this.set_dirty("metadata");
        // force rebuilding of editor (new parser)
        this.set_dirty("editor");     

    };
    
    AcreDoc.prototype.set_mime_type = function(mime_type) {
        if (mime_type === this._mime_type) { return; }
        
        this._mime_type = mime_type;
        /* 
            weird freebase-specific hack... metadata stored with content (Uplaod) rather than metadata (graph object) 
            maybe we should store dirty state as a stack of modified internals ?
        */
        this.set_dirty("content");
        // force rebuilding of editor (new parser)
        this.set_dirty("editor");     
    };
    
    AcreDoc.prototype.set_revision = function(revision) {
        if (this.is_dirty("content") || (revision !== this._revision)) { 
            this._revision = revision;
            this.set_dirty("revision");
            this.set_dirty("editor");
        }
        this.set_dirty("content", false);
        this.set_dirty("to_delete", false);            
    };
    
    AcreDoc.prototype.set_dirty = function(kind, value){
        var k = kind || "content";
        var v = (typeof value == 'undefined') ? true : value;
        if (k==="all") {
            for (var key in this._dirty_state) {
                this._dirty_state[key] = v;
            }
        } else {
            this._dirty_state[k] = v;
        }
    };
    
    
    // but the rest are
    AcreDoc.prototype.t_save = function(force_save) {
        var file = this;
        
        if (file.is_dirty("to_delete")) {
            return file.t_delete();
        }
        
        var args = {
            fileid: file.get_fileid()
        };
        var save_task = file.get_store().XhrPost("save_text_file", args);
            
        if (!file.has_been_saved() && file.get_based_on()) {
            args.based_on = file.get_based_on().id;
        }
        
        if (file.is_dirty('name')) {
            args.name = file.get_name();
        }

        if (file.is_dirty('metadata') || !file.has_been_saved()) {
            var handler = file.get_acre_handler();
            if (handler) args.acre_handler = handler;
        }
        
        if (!force_save && file.get_revision() && !(file.is_dirty("content") && file.is_dirty("revision"))) {
            args.revision = file.get_revision();
        }

        if (file.is_dirty("content")) {
            var state = file.get_editor_state();
            if (state.form) {
                save_task = file.get_store().FileUpload("save_binary_file", state.form, args);
            } else {
                args.text = state.text;
                args.content_type = file.get_mime_type();
            }
        } else if (file.is_dirty("revision")) {
            save_task = file.get_store().XhrPost("set_file_revision", args);
        }
        
        save_task
            .onready(function (r) {
                if (r.content_id) { file._revision = r.content_id; }
                if (r.content_type) { file._mime_type = r.content_type; }
                
                delete file._old_name;
                file._has_been_saved = true;
                file.set_dirty("all", false);
                
                if (file._current_editor && (typeof file._current_editor.refresh === 'function')) {
                    file._current_editor.refresh();
                }
            })
            .onerror(function (code, message, info) {
                if (code === "/api/status/error/file_format/unsupported_mime_type") {
                    delete file._old_name;
                    file._has_been_saved = true;
                    file.set_dirty("all", false);
                } else {
                    mjt.warn('Save of', file.get_name(), 'failed: ', code, ' - ', message, info);
                }
            });

        // Need to flush the server-side app cache on file edits
        var flush_task = this.get_app().t_flush_cache().require(save_task);
        return flush_task.enqueue();
    };
            
    AcreDoc.prototype.t_delete = function() {
        var file = this;
        var args = {
            appid   : file.get_app().get_path(),
            name    : file.get_name()
        };
        
        function _clean_up_file() {
            file.get_app().unregister_file(file.get_name());
            file.destroy();
        }
        
        if (!file.has_been_saved()) {
            return mjt.Succeed()
                .enqueue()
                .onready(_clean_up_file);
        }
        
        var deltask = file.get_store().XhrPost('delete_app_file', args)
            .onready(_clean_up_file)
            .onerror(function (code, message, info) {
                mjt.warn('Delete of', file.get_name(), 'failed: ', code, ' - ', message, info);
            });
        
        // Need to flush the server-side app cache on file edits
        var flush_task = this.get_app().t_flush_cache().require(deltask);
        return flush_task.enqueue();
    };
    
    AcreDoc.prototype.t_revert_to_saved = function() {
        var file = this;
        
        var args = {
            fileid : file.get_fileid()
        };
        
        var task = file.get_store().XhrGet('get_file', args)
            .onready(function(r) {
               file.set_name(r.name);
               file.set_acre_handler(r.handler);
               file.set_mime_type(r.content_type);
               file.set_revision(r.content_id);
               file.set_dirty("all", false);
               file.clear_editors();
            })
            .onerror(function (code, message, info) {
                mjt.warn('Rever of', file.get_name(), 'failed: ', code, ' - ', message, info);
            });
            
        return task.enqueue();
    };
        
    /* General editor stuff */
    AcreDoc.prototype.is_editor_loaded = function(editor_name) {
        var loaded = false;
        
        if (editor_name) {
            loaded = this._loaded_editors[editor_name] ? true : false;
        } else {
            for (var ed in this._loaded_editors) {
                loaded = true;
                break;
            }
        }
        return loaded;
    };
    
    AcreDoc.prototype.clear_editors = function(key) {
        var file = this;
        
        function _destroy_editor(key) {
            var ed = file._loaded_editors[key];
            if (ed.destroy) { ed.destroy(); }
            delete file._loaded_editors[key];            
        }
        
        if (key) {
            if (file.get_edtior_name() === key) {
                file._current_editor = null;
            }
            _destroy_editor(key);
        } else {
            file._current_editor = null;            
            for (var edkey in file._loaded_editors) {
                _destroy_editor(edkey);
            }
        }
    };
    
    AcreDoc.prototype.get_editor_name = function() {
        for (var key in EDITORS) {
            if (this._current_editor && this._current_editor instanceof EDITORS[key].editor_class) {
                return key;
            }
        }
        return false;
    };
        
    AcreDoc.prototype.t_editor_show = function(editor_name, prefs, state) {
        var file = this;
        if (file._showing_editor) { return mjt.Succeed().enqueue(); }
        file._showing_editor = true;

        var old_editor_state = null;
        if (state) {                                                            // use sepecified state...
            old_editor_state = state;
            file.set_dirty("content");
        } else if (file.is_dirty("revision")) {                                 // ... or force load from graph if asked...
            old_editor_state = null;
        } else if (file._current_editor) {                                      // ...otherwise grab the old contents...
            old_editor_state = file.get_editor_state();
        } else if (file._initial_state) {                                       // ... except new files
            old_editor_state = file._initial_state;
            file._initial_state = null;
        }
        
        if (file.is_dirty("editor")) {                                          // if editor marked dirty, destroy all
            file.clear_editors();
            file.set_dirty("editor", false);
        }

        var EditorClass = EDITORS[editor_name].editor_class;                    // if changing editors, hide old
        if (file._current_editor && !(file._current_editor instanceof EditorClass)) {  
            file._current_editor.hide();
        }
        
        if (typeof file._loaded_editors[editor_name] !== 'undefined') {         // we have the right editor around, just refresh
            file._current_editor = file._loaded_editors[editor_name];
            if (file.is_dirty("content") && old_editor_state) { 
                file.set_editor_state(old_editor_state); 
            }
            file._current_editor.show(prefs);
            file._showing_editor = false;
            return mjt.Succeed().enqueue();          
        }

        /* CREATE NEW EDITOR */
        var inittask = EditorClass.t_load(file, old_editor_state)
            .onready(function(new_editor){
                file._loaded_editors[editor_name] = new_editor;
                file._current_editor = file._loaded_editors[editor_name];
                file._current_editor.show(prefs);
                file._showing_editor = false;
            })
            .onerror(function (code, message, info) {
                mjt.warn('Loading of', file.get_name(), 'failed: ', code, ' - ', message, info);
            });
        
        return inittask.enqueue();
    };
    
    AcreDoc.prototype.get_editor_state = function() {
        var state = null;
        if (this._current_editor) { 
            state = this._current_editor.get_state(); 
        } else if (this._initial_state) {
            state = this._initial_state;
        }
        
        return state;
    };
    
    AcreDoc.prototype.set_editor_state = function(state) {
        assert.critical(state, 'Trying to set undefined editor state');
        if (this._current_editor) { this._current_editor.set_state(state); }
        
        return;
    };
        
    
    /* Editor features */
    AcreDoc.prototype.get_editor_supported_features = function(feature) {
        if (!this.get_editor_name()) { return false; }
        
        var supports = EDITORS[this.get_editor_name()].supports;
        if (feature) {
            return !!supports[feature];
        } else {
            return supports;
        }
    };

    AcreDoc.prototype.register_editor_event_handlers = function(event_handlers) {
        for (var event_name in event_handlers) {
            this._event_handlers[event_name] = event_handlers[event_name];
        }
    };
    
    AcreDoc.prototype.trigger_editor_event = function(event_name, args) {
        if (event_name === 'change') {
            var undos = args[0];
            if (typeof undos !== "number") {
                this.set_dirty("content");
            } else if (undos > 0) {
                this.set_dirty("content");
                // we'd flagged to update the revision of the doc in the background...
                // but now the user has clearly loaded and modified that revision, so don't
                this.set_dirty("revision", false);                
            } else {
                this.set_dirty("content", false);
            }
        }
        
        if (this._event_handlers[event_name]) { 
            this._event_handlers[event_name].apply(this, args); 
        }
    };
    
    AcreDoc.prototype.editor_undo = function() {
        if (!this._current_editor || !this._current_editor.undo)  { return; }
        
        this._current_editor.undo();
    };
    
    AcreDoc.prototype.editor_redo = function() {
        if (!this._current_editor || !this._current_editor.redo) { return; }
        
        this._current_editor.redo();
    };
    
    AcreDoc.prototype.editor_indent = function() {
        if (!this._current_editor || !this._current_editor.reindentSelection) { return; }
        
        this._current_editor.reindentSelection();
    };
        
    AcreDoc.prototype.editor_goto_line = function(linenum) {
        if (!this._current_editor || !this._current_editor.goto_line) { return; }
        
        this._current_editor.goto_line(Number(linenum));
    };
})();
