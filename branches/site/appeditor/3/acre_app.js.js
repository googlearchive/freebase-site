var AcreApp;

(function(){
    
    var DEFAULT_FILENAME = 'index';
    
    AcreApp = function(store, path) {
        this._store             = store;
        this._acre_host         = store.get_acre_host();
        this._service_url       = store.get_url();
        
        this._path              = path;
        this._version           = null;
        this._name              = "Untitled";

        this._oauth_enabled     = null;
        this._write_user        = null;

        this._listed            = null;
        this._release           = null;
        this._hosts             = [];
        this._versions          = [];

        this._authors           = {};
        this._files             = {};
                
        this._untitled_label    = 'untitled_';
        this._untitled_counter  = 1;
        
        return this;
    };
    
    AcreApp.prototype.t_load = function() {
        var app = this;
        
        var loadtask = app._store.XhrGet('get_app', {appid: app._path})
            .onready(function(r) {
                app._acre_host          = r.acre_host;
                app._remote_app         = r.acre_host !== app.get_store().get_acre_host();
                app._repository         = r.repository || {
                  versioned : true
                };
                
                app._path               = r.path;
                app._appid				= r.appid;
                app._version            = r.version;
                app._name               = r.name || 'Untitled';

                app._oauth_enabled      = r.oauth_enabled;
                app._write_user         = r.write_user;
                app._parent             = r.parent;
                app._children           = r.children;

                app._listed             = r.listed;
                app._release            = r.release;
                app._hosts              = r.hosts;
                app._versions           = r.versions;
                app._last_edit          = null;
                
                app._initial_file       = r.current_file;
                                
                // Create and attach AcreUser objects for authors
                for (var akey in r.authors) {
                    var user = r.authors[akey];
                    app._authors[user.name] = new AcreUser(app.get_store(), user);
                }

                // Create and attach AcreDoc objects for files
                for (var fkey in r.files) {
                    r.files[fkey].has_been_saved = true;
                    new AcreDoc(app, r.files[fkey].name, r.files[fkey]);
                }
                
                // Enable OAuth by default
                if (app.is_writable()) {
                    if (!app._write_user && app._oauth_enabled === null) { app.t_set_oauth(true); }
                }
            });

        return loadtask.enqueue();
    };
    

    AcreApp.prototype.t_flush_cache = function(all_hosts) {
        var app = this;
        
        // touch the dev host synchronously...
        var touch = app.get_store().AppTouch(app.get_base_url());
            
        if (all_hosts) {
            // touch all of the other hosts asynchronously
            // on url or verison changes
            var hosts = this.get_hosts();
            for (var i=0; i < hosts.length; i++) {
                app.get_store().AppTouch('http://' + hosts[i].host).enqueue();
            }
        }
        
        return touch;
    };

        
    AcreApp.prototype.destroy = function() {
        var app = this;
        
        for (var f in app._files) {
            app._files[f].destroy();
        }
        
        for (var u in this._authors) {
            app._authors[u].destroy();
        }
        
        app = null;
    };
        
    AcreApp.prototype.register_file = function(file){
        var re = new RegExp(this._untitled_label + '(\\d+)');
        var r = re.exec(file.get_name()); // We need to explicitly call .exec or this will throw an exception in Google Chrome
        if (r && r.length) {
            var counter = parseInt(r[1], 10);
            if (this._untitled_counter <= counter) {
                this._untitled_counter = counter + 1;
            }
        }
        
        this._files[file.get_name()] = file;
    };
    
    AcreApp.prototype.unregister_file = function(filename) {
        delete this._files[filename];
    };


    /* getters */
    AcreApp.prototype.is_dirty = function() {
        var files = this.get_files();
        for (var f in files) {
            if (files[f].is_dirty()) { return true; }
        }
        return false;
    };

    AcreApp.prototype.get_store = function() {
        return this._store;
    };

    AcreApp.prototype.get_repository_capability = function(kind) {
        return !!this._repository[kind];
    };

    AcreApp.prototype.get_path = function() {
        return (this.get_acre_host() === this.get_store().get_acre_host()) ? this._path : this._path + "." + this._acre_host + ".";
    };

    AcreApp.prototype.get_versioned_path = function() {
        var path = this.get_path();
        
        if (this.is_version()) {
            path = path.replace("//", "//" + this._version + ".");
        }

        return path;
    };

    AcreApp.prototype.get_name = function() {
        var path_segments = this._path.split('//')[1].split(".");
        var name = path_segments.shift();
        return name;
    };

    AcreApp.prototype.get_display_name = function() {
        return this._name;
    };
    
    AcreApp.prototype.get_parent = function() {
        return this._parent;
    };

    AcreApp.prototype.get_children = function() {
        return this._children;
    };
    
    AcreApp.prototype.get_released_version = function() {
        return this._release;
    };
    
    AcreApp.prototype.get_versions = function() {
        return this._versions;
    };
    
    AcreApp.prototype.get_patches = function() {
        return this._patches;
    };

    AcreApp.prototype.get_hosts = function() {
        return this._hosts;
    };
    
    AcreApp.prototype.get_files = function() {
        return this._files;
    };

    AcreApp.prototype.get_file = function(name) {
        
        if (name) { 
            var segs = name.split('/');
            if (segs.length > 1) {
                var lib =  this.get_library(segs[0]);
                return lib.get_file(segs[1]);
            } else {
                return this._files[name];   
            }
        }
        
        if (this._initial_file && this._files[this._initial_file]) {
            var file = this._files[this._initial_file];
            this._initial_file = null;
            return file;
        } else if (this._files[DEFAULT_FILENAME]) { 
            return this._files[DEFAULT_FILENAME]; 
        } else {
            var file;
            var files = this.get_files();
            for (var f in files) {
                file = files[f];
                if (file) { return file; }
            }            
        }
        
        return null;
    };

    AcreApp.prototype.get_untitled_file_name = function(){
        var name = this._untitled_label + this._untitled_counter;
        return name;
    };

    AcreApp.prototype.get_acre_host = function() {
        return this._acre_host;
    };
    
    AcreApp.prototype.get_base_url = function() {
        return "http:" + this.get_path() + "." + this.get_acre_host();
    };
        
    AcreApp.prototype.get_view_url = function() {
        return this._repository.url + '/apps' + this._appid;
    };
        
    AcreApp.prototype.get_edit_url = function() {
        return this._repository.url + '/apps/admin' + this._appid;
    };

    AcreApp.prototype.is_version = function() {
        return !!this._version;
    };
    
    AcreApp.prototype.get_version_label = function() {
        return this._version;
    };

    AcreApp.prototype.get_version_timestamp = function(version) {
        var ver = version ? version : this._version;
        
        for (var i=0; i < this._versions.length; i++){
            var v = this._versions[i];
            if (v.name == ver) {
                return v.as_of_time;
            }
        }
        return null;
    };


    /* setter tasks */
    AcreApp.prototype.t_save_all = function() {
        var task = mjt.Succeed();

        // TODO: show status for this
        for (var id in this._files) {
            var file = this._files[id];
            if (file.is_dirty()) {
                task.require(file.t_save());
            }
        }
        
        // Need to flush the server-side app cache on file edits
        var flush_task = this.t_flush_cache().require(task);
        return flush_task.enqueue();
    };
    
    AcreApp.prototype.t_get_history = function(limit) {
        var app = this;
        var args = { 
            appid: app.get_path()
        };
        if (limit) { args.limit = limit; }
        
        var task = app.get_store().XhrGet('get_app_history', args);
        
        return task.enqueue();
    };
    
    AcreApp.prototype.get_last_change = function() {
        return this._last_edit;
    };
    
    AcreApp.prototype.set_last_change = function(change) {
        this._last_edit = change;
    };
    
    AcreApp.prototype.t_set_listing = function(name, description, listed) {
        var app = this;
        var args = { appid: app.get_path() };
        if (name) { args.name = name; }
        if (name) { args.description = description; }
        if (name) { args.listed = listed; }
        
        var update =  app.get_store().XhrPost('set_app_properties', args)
            .onready(function() {
                if (name) { app._display_name = name; }
            })
            .onerror(function (code, message, info) {
                mjt.warn('Changing app listing of', app.get_name(), 'failed: ', code, ' - ', message, info);
            });

        return update.enqueue();
    };
    
    AcreApp.prototype.t_move = function(new_path) {
        var app = this;
        var args = { 
            appid: app.get_path(),
            to_appid: new_path
        };
        
        var movetask =  app.get_store().XhrPost('move_app', args)
            .onready(function(){
                app._path = new_path;
                // Need to flush the server-side app cache on url or version changes
                app.t_flush_cache().enqueue();
            })
            .onerror(function (code, message, info) {
                mjt.warn('Move of', app.get_display_name(), 'failed: ', code, ' - ', message, info);
            });
        
        return movetask.enqueue();
    };
        
    AcreApp.prototype.t_delete = function() {        
        var app = this;
        var args = {
            appid: app.get_path()
        };
        
        var deletetask = this.get_store().XhrPost('delete_app', args)
            .enqueue()
            .onready(function() {
                app.destroy();
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to delete app: ' + code + ', ' + message + ', ' + detail);
            });

        return deletetask;
    };    

    AcreApp.prototype.t_set_host = function(host) {
        var app = this;
        var args = {
            appid: app.get_path(), 
            host: host
        };
        
        var pubtask =  app.get_store().XhrPost('set_app_host', args)
            .onready(function(o) {
                app._hosts = o.hosts;
                if (o.listed) { app._listed = true; }
                // Need to flush the server-side app cache on url or version changes
                app.t_flush_cache(true).enqueue();
            })
            .onerror(function (code, message, info) {
                mjt.warn('Setting release URL of', app.get_display_name(), 'failed: ', code, ' - ', message, info);
            });

        return pubtask.enqueue();
    };
    
    AcreApp.prototype.t_set_release = function(version) {
        var app = this;
        var args = {
            appid: app.get_path(), 
            version: version
        };
        
        var pubtask =  app.get_store().XhrPost('set_app_release', args)
            .onready(function(o) {
                app._hosts = o.hosts;
                app._versions = o.versions;
                app._release = o.release;
                // Need to flush the server-side app cache on url or version changes
                app.t_flush_cache(true).enqueue();
            })
            .onerror(function (code, message, info) {
                mjt.warn('Setting release of', app.get_display_name(), 'failed: ', code, ' - ', message, info);
            });

        return pubtask.enqueue();
    };

    AcreApp.prototype.t_add_version = function(version, timestamp, service_url) {
        var app = this;
        var args = {
            appid: app.get_path(), 
            version: version
        };
        if (timestamp) { args.timestamp = timestamp; }
        if (typeof service_url !== 'undefined') { args.service_url = service_url; }
        
        var addversiontask = this.get_store().XhrPost('create_app_version', args)
            .onready(function(r) {
                app._versions = r.versions;
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add version: ' + code + ', ' + message + ', ' + detail);
            });
            
        return addversiontask.enqueue();
    };
    
    AcreApp.prototype.t_remove_version = function(version) {
        var app = this;
        var args = {
            appid: app.get_path(), 
            version: version
        };
        
        var removeversiontask = this.get_store().XhrPost('delete_app_version', args)
            .onready(function(r) {
                app._versions = r.versions;
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to remove version: ' + code + ', ' + message + ', ' + detail);
            });
            
        return removeversiontask.enqueue();
    };
        
    
    /* permissions stuff */
    AcreApp.prototype.is_remote = function() {
        return this._remote_app;
    };

    AcreApp.prototype.is_writable = function() {
        return this.is_author() && !this.is_version() && !this.is_remote();
    };
    
    AcreApp.prototype.is_author = function() {
        return this.get_store().get_user() ? (this.get_store().get_user().get_name() in this.get_authors()) : false; 
    };
    
    AcreApp.prototype.is_oauth_enabled = function() {
        return !!this._oauth_enabled;
    };
    
    AcreApp.prototype.get_authors = function() {
        return this._authors;
    };
    
    AcreApp.prototype.get_write_user = function() {
        return this._authors[this._write_user];
    };
    
    AcreApp.prototype.t_add_author = function(username) {
        var app = this;
        var args = {
            appid: app.get_path(),
            username: username
        };

        var addtask = this.get_store().XhrPost('add_app_author', args)
            .onready(function(r) {
                var new_author = new AcreUser(app._store, r.authors[username]);
                app._authors[username] = new_author;
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add author: ' + code + ', ' + message + ', ' + detail);
            });

        return addtask.enqueue();
    };
    
    AcreApp.prototype.t_remove_author = function(username) {
        var app = this;
        var args = {
            appid: app.get_path(),
            username: username
        };

        var removetask = this.get_store().XhrPost('remove_app_author', args)
            .onready(function() {
                delete app._authors[username];
            })
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add author: ' + code + ', ' + message + ', ' + detail);
            });

        return removetask.enqueue();
    };
    
    AcreApp.prototype.t_get_apikeys = function() {
        var app = this;
        var args = { 
            appid: app.get_path() 
        };
        
        var getapikeytask = this.get_store().XhrPost('list_app_apikeys', args)
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to get API Keys: ' + code + ', ' + message + ', ' + detail);
            });
            
        return getapikeytask.enqueue();
    };
    
    AcreApp.prototype.t_add_apikey = function(name, key, secret) {
        var app = this;
        var args = {
            appid: app.get_path(),
            name: name, 
            token: key,
            secret: secret
        };
        
        var addkeytask = this.get_store().XhrPost('create_app_apikey', args)
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add api key: ' + code + ', ' + message + ', ' + detail);
            });
            
        return addkeytask.enqueue();
    };
    
    AcreApp.prototype.t_remove_apikey = function(name) {
        var app = this;
        var args = {
            appid: app.get_path(),
            name: name
        };
        
        var removekeytask = this.get_store().XhrPost('delete_app_apikey', args)
            .onerror(function (code, message, detail) {
                mjt.warn('Failed to add api key: ' + code + ', ' + message + ', ' + detail);
            });
            
        return removekeytask.enqueue();
    };
    
    AcreApp.prototype.t_set_oauth = function(enabled) {
        var app = this;
        
        if (app.is_oauth_enabled() == enabled) { return mjt.Succeed().enqueue(); }
        if (!(enabled === true || enabled === false)) { return mjt.Fail(500, 'Must set oauth_enabled to true or false').enqueue(); }
        
        var args = {
            appid: app.get_path(),
            enable: enabled
        };
        
        var oauthtask = app.get_store().XhrPost('set_app_oauth_enabled', args)
            .onready(function() {
                app._oauth_enabled = enabled;
            })
            .onerror(function (code, message, info) {
                mjt.warn('Setting OAuth enabled for ', app.get_name(), 'failed: ', code, ' - ', message, info);
            });
            
        return oauthtask.enqueue();
    };
    
    AcreApp.prototype.t_set_writeuser = function(enabled) {
        var app = this;
        
        if ((!!app.get_write_user()) === enabled) { return mjt.Succeed().enqueue(); }
        if (!(enabled === true || enabled === false)) { return mjt.Fail(500, 'Must set write_user to true or false (current user)').enqueue(); }
        
        var args = {
            appid: app.get_path(),
            enable: enabled
        };
        
        var writeusertask = app.get_store().XhrPost('set_app_writeuser', args)
            .onready(function(r) {
                if (enabled) { app._write_user = r.write_user; }
                else { app._write_user = null; }
            })
            .onerror(function (code, message, info) {
                mjt.warn('Setting write user for ', app.get_name(), 'failed: ', code, ' - ', message, info);
            });
            
        return writeusertask.enqueue();
    };
    
})();
