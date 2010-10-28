// TODO: Put in Metaweb info / license

var ui = {};

(function() {


    ///////////////////
    //               //
    //    Drawing    //
    //               //
    ///////////////////
    
    ui.init = function() {
        $('#body').acre("templates", "body");
        
        // initialize apps menu button
        $("#button-apps").click(function(){ ui.do_show_menu('apps'); }).attr("title", ui.shortcut.get_keys('Open App'));
        
        ui.shortcut.register_keys(document);
        window.onbeforeunload = ui.warn_user_about_unsaved_files;

        // cancel browser-back if backspace pressed on an element without editable text
        $(document).keydown(function(e) {
          return !(e.which === 8 && e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'TEXTAREA');
        });
        
        $('.exit').live('click', ui.do_hide_overlays);
                        
        $('.app-link').live('click', function(e){
          if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
            /* default browser behaviour = open link in new tab */
          } else {
            /* if files have been edited, make sure user still wants to switch */
            var new_app = $(this).attr("apppath");

            ui.do_hide_overlays();
            if (ui.get_app() && ui.get_app().is_dirty()) {                
              ui.do_show_dialog('files_dirty', [new_app]);
            } else {
              ui.do_choose_app(new_app);
            }
            return false;
          }
        });
        
        // load initial state and continue to check for changes due to back/forward button
        ui.check_browser_hash();
        setInterval(ui.check_browser_hash, 250);
    };

    ui.refresh_app_templates               = function(state) {
        var app = ui.get_app();
        
        $('#header-apptitle').acre("templates", "header", [state]);
        
        if (app) {
            $('#list-column').acre("templates", "list_column");
            if (app.is_writable()) {
                $('#about-bar').hide();
            } else {
                $('#about-bar').acre("templates", "about_bar").show();
            }
        }
    };
    
    ui.refresh_file_templates             = function() {
        $('#file-list').acre("templates", "file_list");
        $('#button-bar').acre("templates", "button_bar");
        ui.finish_drawing();
    };
    
    ui.finish_drawing           = function() {
        $('.refresh').show();
        ui.set_state();
        $(window).trigger('resize');
    };

    ui.do_show_dialog           = function(dialogname, args, keep_menu) {
        ui.do_hide_overlays();
        
        function _hide_dialogs() {
            ui.do_hide_dialog_overlays();
            $(document).unbind('keydown', _key_handler);
        }
        
        function _key_handler(e) {
            if (e.keyCode == 27) { _hide_dialogs(); }
        }

        if (dialogname == 'welcome') {
            ui.dialog = $("<div id='" + dialogname + "'></div>")
                .acre("dialogs", dialogname, args)
                .prependTo(document.body);
        } else {
            $("<div id='dialog-overlay'></div>").prependTo(document.body);
            $(document).bind('keydown', _key_handler);
            ui.dialog = $("<div id='dialog-" + dialogname + "' class='dialog'></div>")
                .acre("dialogs", dialogname, args)
                .prepend("<div class='dialog-close' onclick='ui.do_hide_overlays()'></div>")
                .prependTo(document.body);
        }
        
        ui.dialog.show();
        ui.dialog.css('left', ($(window).width() - ui.dialog.outerWidth())/2);
        return false; // cancel click
    };
    
    ui.do_show_menu             = function(menuname, args) {
        function _hide_menus() {
            ui.do_hide_menu_overlays();
            $(document).unbind('keydown', _key_handler);
        }
        
        function _key_handler(e) {
            if (e.keyCode == 27) { _hide_menus(); }
        }

        $("<div id='menu-overlay'></div>").prependTo(document.body).click(_hide_menus);
        $(document).bind('keydown', _key_handler);

        $('#button-' + menuname).addClass('button-open');
        var offset = $('#button-' + menuname).offset();
        var button_height = $('#button-' + menuname).height();

        $("<div id='menu-" + menuname + "' class='menu'></div>")
            .css({top: offset.top + button_height + 10, left: offset.left})
            .prependTo(document.body)
            .acre("menus", menuname, args);
        return false; // cancel click
    };
    
    ui.do_setup_submenu         = function(menu_item_id, submenuname, args) {
        var mouseenter_timer;
        var mouseleave_timer;
        var menu_drawn = false;
        
        var menu_item = $('#'+menu_item_id);
        var parent_menu = menu_item.closest('.menu');
        var submenu =  $("<div id='menu-" + submenuname + "' class='menu submenu'></div>");

        menu_item.mouseenter(function(e){
          mouseenter_timer = setTimeout(function(){
            if (!menu_drawn) {
                
              submenu
                .css({
                    top  : menu_item.offset().top,
                    left : parent_menu.offset().left + parent_menu.width()
                })
                .prependTo(document.body)
                .acre("menus", submenuname, args)
                .mouseenter(function(e){  
                    clearTimeout(mouseleave_timer);
                })
                .mouseleave(function(e){
                    clearTimeout(mouseenter_timer);
                    mouseleave_timer = setTimeout(function(){
                        submenu.css('visibility','hidden');
                    }, 100);
                });

                menu_drawn = true;           
            } else {  
               submenu.css('visibility','visible');
            }
          }, 250);
        })
        .mouseleave(function(e){
          clearTimeout(mouseenter_timer);
          mouseleave_timer = setTimeout(function(){
             submenu.css('visibility','hidden');
          }, 100);
        });
    };
    
    ui.do_hide_dialog_overlays  = function() {
        delete ui.dialog;
        $('#dialog-overlay, .dialog').remove();
        $('.fbs-pane, .fbs-flyout-pane').hide();
    };
    
    ui.do_hide_menu_overlays    = function() {
        $('#menu-overlay, .menu').remove();
        $('.button-open').removeClass('button-open');
        $('.fbs-pane, .fbs-flyout-pane').hide();
    };
    
    ui.do_hide_overlays         = function() {
        ui.do_hide_dialog_overlays();
        ui.do_hide_menu_overlays();
    };

    ui.do_hide_welcome  = function() {
        $('#welcome').remove();
    };



    ///////////////////
    //               //
    //    State      //
    //               //
    ///////////////////
    
        
    // State globals    
    var _first_time = true;
    var _current_store;
    var _current_user;
    var _current_app;
    var _current_file;
    var _current_line;
    var _current_file_is_dirty = false;         // cache the value so we know to refresh the UI when it changes
    var _changing_state = false;                // don't check the url hash while in the process of switching apps or files
    var _last_status_check = + new Date();
    
    var NUM_RECENTS_TO_STORE = 16;
    

    ui.check_browser_hash       = function() {
        if (_changing_state) { return; }
        var new_hash = ui._get_browser_hash();
        
        if (new_hash == '0') {
            ui.set_state();
            return;
        }
        
        if (_first_time || ui._ui_state_to_browser_hash() !== new_hash) {
            _first_time = false;
            var args = mjt.app.decode_uristate(new_hash);
            
            // load old-style graph ID syntax...
            var no_xss =  /[\<\>]/;     //don't allow tags (XSS)
            var app = args.path || args.app;
            app = !no_xss.test(app) ? app : null;
            var file = !no_xss.test(args.file) ? args.file : null;
            
            ui.do_choose_app(app, file, args.line, args.create);
        }
    };

        // ''         --> ''        (no hash)
        // '#!path=x' --> 'path=x'  (new style)
        // '#path=x'  --> 'path=x'  (old style)
        ui._get_browser_hash        = function() {
            return window.location.hash.replace(/#!?/,'');
        };

        ui._ui_state_to_browser_hash = function() {
            if (typeof ui.get_app() == 'undefined') { return null; }

            var state = {};
            if (ui.get_app()) { state.path = ui.get_app().get_versioned_path(); }
            if (ui.get_file()) { state.path += "/" + ui.get_file().get_relative_path(); }

            return mjt.app.encode_uristate(state);
        };

    ui.set_state                = function() {          // called when done with a state transition
        var app = ui.get_app();
        var file = ui.get_file();
        
        _current_file_is_dirty = file ? file.is_dirty() : null;
        
        var title = "";
        if (app) { title += (app.get_display_name() || app.get_path()) + " - "; }
        if (file) { title += file.get_name() + " - "; }
        title += "Freebase App Editor";
        document.title = title;
        
        var hash = ui._ui_state_to_browser_hash();
        if (hash !== ui._get_browser_hash()) {
            window.location.hash = '!'+hash;
        }
            
        _changing_state = false;    
    };

    ui.clear_state              = function() {
        _current_app = null;
        _current_file = null;
        _current_line = null;
        _current_file_is_dirty = null;
    };

    ui.get_store                = function() {
        return _current_store;
    };
    
    ui.set_store                = function(obj) {
        _current_store = obj;
    };
    
    ui.set_user                 = function(user) {
        var store = ui.get_store();  
        if (user !== store.get_user()) {
            store.set_user(user);
        }
        _current_user = store.get_user();
    };
      
    ui.get_app                  = function(){
        if (!_current_app) { return null; }
        return _current_app;
    };
    
    ui.get_file                 = function() {
        if (!_current_file) { return null; }
        return _current_file;
    };
    
    ui.get_line                 = function() {
        return _current_line;
    };
    
    ui.get_user                 = function() {
        return _current_user;
    };

    ui.get_recents              = function(kind, keep_first) {
        var recent = $.localStore('recent_'+kind, undefined, false);
        if (recent === null) { recent = []; }
        if (!keep_first && recent && recent.length > 0) { recent.shift(); }
        return recent;
    };

    ui.add_recent               = function(kind, value, replace) {
        var recent = $.localStore('recent_'+ kind, undefined, false);
        if (!recent || !jQuery.isArray(recent)) { recent = []; }

        var val = JSON.stringify(value);
        for (var i = 0; i < recent.length; i++) {
            var ival = JSON.stringify(recent[i]);
            if (ival == val || (kind == 'apps' && ((value && ((recent[i].path == value.path) || (ui.id_to_path(recent[i].path) == value.path))) || (recent[i].path == replace)))) {
                recent.splice(i,1);
            }
        }
        
        if (value) {
            recent.unshift(value);
            if (recent && recent.length > NUM_RECENTS_TO_STORE) { 
                var removed = recent.splice(NUM_RECENTS_TO_STORE); 
                if (kind == 'apps') {
                    for (var j=0; j < removed.length; j++) {
                        ui.clear_recents(removed[j]);
                    }
                }
            }            
        }

        $.localStore('recent_'+ kind, recent, false);
    };
    
    ui.clear_recents            = function(kind) {
        $.localStore('recent_'+ kind, null, false);
    };



    ///////////////////
    //               //
    //    Actions    //
    //               //
    ///////////////////
        

    // App editor actions
    ui.do_choose_app            = function(appid, filename, linenum, create) {
        _changing_state = true;
        
        function _no_app() {
            ui.clear_state();
            ui.set_state();
            ui.refresh_app_templates('open');
            var recent_apps = ui.get_recents('apps', true);
            if (create == 'app') {
                if (!ui.get_user()) {
                   location.href = ui.get_store().get_user_account_url("signin") + 'create=app';
                }
                ui.do_show_dialog('new_app');
            } else if (recent_apps.length > 0) {
                var last_app = recent_apps.shift();
                $.localStore('recent_apps', recent_apps, false);
                ui.do_choose_app(last_app.path);
            } else if (ui.get_user()){
                ui.do_show_dialog('welcome',[true]);
            } else {
                ui.do_show_dialog('welcome');
            }
        }
        
        function _select_file() {
            if (create == 'file') {
                ui.set_state();
                ui.do_show_dialog('add_file');                
            } else {                
                ui.do_choose_file(filename, linenum);
            }
        }
        
        var current_app = ui.get_app();
        var current_app_path = current_app ? current_app.get_versioned_path() : null;
        
        if (appid && current_app && appid == current_app_path) {
            ui.refresh_app_templates();
            _select_file();
            return;
        }

        // We're changing apps, clean up until we're done
        ui.do_hide_overlays();
        ui.do_hide_welcome();
        $('.refresh').hide();
        
        // no app
        if (!appid) { 
            _no_app(); 
            return;
        }

        if (current_app) { current_app.destroy(); }
        ui.refresh_app_templates('loading');
        
        var new_app = new AcreApp(ui.get_store(), appid);
        new_app.t_load()
            .onready(function(){
                _current_app = new_app;        
                ui.add_recent('apps', { path: new_app.get_path(), name: new_app.get_display_name() });
                _current_file = null;

                ui.refresh_app_templates();
                _select_file();
                ui.do_status_check();
            })
            .onerror(function(code, message, info) {
                if (code == "/api/status/error/input/no_app") {                 
                    ui.MessagePanel.error(message ? message : 'Error loading app: ' + appid + '. ' + message || '');
                    // Remove bad entry in the Recent Apps menu
                    ui.add_recent('apps', null, appid);
                    _no_app();
                } else {
                    // catastrophic failure
                    assert.critical(false, "Error connecting to Freebase<br/>" + message);
                    mjt.error(code, message, info);
                    
                    ui.clear_state();
                    ui.set_state();
                    ui.refresh_app_templates('open');
                }
            });
    };
           
    ui.do_choose_file           = function(filename, linenum) {
        _changing_state = true;
        
        function _show_file() {
            var file = ui.get_file();
            if (!file) { return ui.refresh_file_templates(); }

            var editor_name = ui._get_desired_editor_classname();
            return file.t_editor_show(editor_name, ui.get_editor_prefs())
                .onready(function() {
                    if (linenum) {
                        setTimeout(function(){ file.editor_goto_line(linenum); }, 0);
                    }
                    ui.refresh_file_templates();
                    ui.set_state();
                });
        }
        
        var app = ui.get_app();

        var old_file = ui.get_file();
        
        var file = app.get_file(filename);          // grab the file they asked for or the default file
        if (!file) { file = app.get_file(); }
        if (!file || file == old_file) {            // no files or same file?  let's bail     
            _show_file(linenum);
            return;
        }

       _current_file = file;
       _current_file_is_dirty = file.is_dirty();
       //ui.add_recent(ui.get_app().get_path(), file.get_relative_path());
       
        if ($('#file-area').has(file.get_element()).length === 0) {
            $('#file-area').append(file.get_element());
            ui._register_editor_event_handlers(file); 
        }
        
        if (old_file) { old_file.hide(); }
        $(file.get_element()).show();
        
        return _show_file(linenum);
    };
    
    ui.do_refresh_file          = function() {
        var file = ui.get_file();
        if (!file) { return; }
        
        file.set_dirty("editor");
        var editor_name = ui._get_desired_editor_classname();
        file.t_editor_show(editor_name, ui.get_editor_prefs())
            .onready(function() {
                ui.refresh_file_templates();
                setTimeout(function(){ file.editor_goto_line(ui.get_line()); }, 0);
            });
    };
    
    ui.do_run_view              = function(args, preview) {
        var file = ui.get_file();
        
        // HACK
        if (file.get_acre_handler() == "mqlquery") {
            file._current_editor.query_run();
            return;
        }
        
        var preview_url = ui.get_file().get_acre_url(preview);
        
        var PreviewWindow = window.open('about:blank', ui.get_app().get_path().replace(/[\/-]/g, '_'));
        if (!PreviewWindow) { 
            ui.MessagePanel.error("A window couldn't be opened.  Tell your web browser to allow this site to open pop up windows and try again to continue."); 
            return false;
        }

        ui.do_app_save_all(function() {
            PreviewWindow.location = preview_url;
            PreviewWindow.focus();
        });
    };

    ui.do_acre_home_link          = function(path) {
        location.href = ui.get_store().get_freebase_url() + "/apps";
        return false; // cancel click
    };

    ui.do_status_check         = function() {
        var args = {};
        if (ui.get_app()) { args.appid = ui.get_app().get_path(); }
        
        ui.get_store().XhrGet("store_status_check", args)
            .enqueue()
            .onready(function(r) {
                ui.get_app().set_last_change(r.change);
                
                if (!!r.user !== !!ui.get_user()) {
                    ui.set_user(r.user);
                    if (!r.user) {
                        ui.MessagePanel.error('You are no longer signed in.  Sign back in in another window to not lose any changes.');
                    		$(window).trigger("fb.user.signedout");
										}
										$(window).trigger("fb.user.signedin");
                }
                $('#app-edits-shim').acre("templates", "app_edits");
                ui.refresh_file_templates();
            });
    };


    // AcreApp actions
    ui.do_app_create_new        = function(appid, display_name, clone_id) {
        var args =        { appid  : appid };
        if (display_name) { args.name = display_name; }
        if (clone_id)     { args.clone = clone_id; }
        
        if (ui.get_store().get_user_apps(appid)) {
            ui.MessagePanel.error('App with that URL already exists');
            return;
        }
        
        ui.MessagePanel.doing('Creating: ' + display_name + '...'); 
        
        ui.get_store().XhrPost("create_app", args)
            .enqueue()
            .onready(function(user_apps) {
                ui.MessagePanel.info('Created: ' + display_name);
                ui.do_choose_app(appid);
                ui.get_store().set_user_apps(user_apps);
             })
             .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error creating: ' + appid + '. ' + message || '');
            });
    };

    ui.do_app_move              = function(new_path) {
        var app = ui.get_app();
        var old_path = app.get_path();

        // don't want to think this is a back button event and reload app
        _changing_state = true;
        ui.MessagePanel.doing("Moving app...");
        app.t_move(new_path)
            .onready(function(r) {
                // Update the hash with the new app path
                ui.set_state();
                // Replace old entry in the Recent Apps menu
                ui.add_recent('apps', { path: app.get_path(), name: app.get_display_name() }, old_path);
                // Update user app list
                ui.get_store().t_refresh_user_apps();
                
                ui.MessagePanel.info("App moved to " + new_path);
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error moving: ' + app.get_display_name());
            });
    };
    
    ui.do_app_set_host          = function(host) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Updating release URL for " +  app.get_display_name() + "...");
        app.t_set_host(host)
            .onready(function() {
                ui.MessagePanel.info("Release URL updated");
                $('#app-hosts-list').acre("menus", "app_hosts_list");
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error updating release URL for: ' + app.get_display_name());
            });        
    };
    
    ui.do_app_set_release       = function(version) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Updating release of " +  app.get_display_name() + "...");
        app.t_set_release(version)
            .onready(function() {
                ui.MessagePanel.info("Release updated to " + version);
                $('#app-versions-add').acre("menus", "app_versions_list");
                $('#app-hosts-list').acre("menus", "app_hosts_list");
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error releasing: ' + app.get_display_name());
            });
    };
    
    ui.do_app_add_version       = function(key, timestamp, service_url) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Creating version " + key);
        app.t_add_version(key, timestamp, service_url)
            .onready(function() {
                ui.MessagePanel.info("Created version " + key);
                $('#app-versions-add').acre("menus", "app_versions_list");
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to add version. '+msg);
            });
    };
    
    ui.do_app_remove_version    = function(key) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Removing version " + key);
        app.t_remove_version(key)
            .onready(function(r) {
                ui.MessagePanel.info("Removed version " + key);
                $('#app-versions-add').acre("menus", "app_versions_list", [r]);
            });
    };
    
    ui.do_app_set_listing       = function(new_name, new_description, listed) {
        var app = ui.get_app();

        ui.MessagePanel.doing("Updating app name...");
        app.t_set_listing(new_name, new_description, listed)
            .onready(function() {
                if (new_name) {
                    // Replace old entry in the Recent Apps menu
                    ui.add_recent('apps', { path: app.get_path(), name: app.get_display_name() }, app.get_path());
                }
                ui.MessagePanel.info("Updated app name");
                ui.refresh_app_templates();
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error changing app name');
            });
    };
        
    ui.do_app_add_author        = function(username) {
        var app = ui.get_app();

        app.t_add_author(username)
            .onready(function() {
                var authors = ui.get_app().get_authors();
                $('#app-authors-list').acre("menus", "app_authors_list", [authors]);
            });
    };
    
    ui.do_app_remove_author     = function(username) {
        var app = ui.get_app();

        app.t_remove_author(username)
            .onready(function() {
                var authors = ui.get_app().get_authors();
                $('#app-authors-list').acre("menus", "app_authors_list", [authors]);
            });
    };
    
    ui.do_app_set_oauth         = function (state) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing('Setting OAuth state...');
        app.t_set_oauth(state)
            .onready(function(r) {
                ui.MessagePanel.info('OAuth ' + (state ? "enabled" : "disabled"));
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to update OAuth state: ' + msg);
            });
    };
    
    ui.do_app_set_writeuser     = function (state) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing('Setting write user...');
        app.t_set_writeuser(state)
            .onready(function(r) {
                ui.MessagePanel.info('Write user ' + (state ? "enabled" : "disabled"));
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to update writeuser state: ' + msg);
            });
    };
    
    ui.do_app_add_apikey        = function(name, key, secret) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Adding API key for " + name + "...");
        app.t_add_apikey(name, key, secret)
            .onready(function(r) {
                ui.MessagePanel.info(name + " API key added.");
                $('#app-apikeys-add').acre("menus", "app_apikeys_list", [r.keys]);
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to add API key: ' + msg);
            });
    };
    
    ui.do_app_remove_apikey     = function(name) {
        var app = ui.get_app();
        
        ui.MessagePanel.doing("Deleting API key for " + name + "...");
        app.t_remove_apikey(name)
            .onready(function(r) {
                ui.MessagePanel.info(name + " API key deleted.");
                $('#app-apikeys-add').acre("menus", "app_apikeys_list", [r.keys]);
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to delete API key: ' + msg);
            });
    };
    
    ui.do_app_save_all          = function(callback) {
        var app = ui.get_app();
        
        if (!app.is_dirty() && (typeof callback === "function")) { 
            callback();
            return;
        }
        
        ui.MessagePanel.doing("Saving all files...");
        app.t_save_all()
            .onready(function() {
                ui.MessagePanel.info("All files saved.");
                ui.refresh_file_templates();
                if (typeof callback === "function") {
                    setTimeout(callback, 500);                    
                }
            })
            .onerror(function(code,msg,full,task) {
                ui.MessagePanel.error('Failed to save all files: ' + msg);
            });
    };
    
    ui.do_app_delete            = function() {
        var app = ui.get_app();

        ui.MessagePanel.doing('Deleting: ' + app.get_display_name() + '...');
        app.t_delete()
            .onready(function(user_apps) {
                ui.get_store().set_user_apps(user_apps);
                ui.MessagePanel.info('Deleted app');
                _current_app = null;
                
                // remove app from recents list
                ui.add_recent('apps', null, app.get_path());
                
                ui.do_choose_app();
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error deleting: ' + app.get_display_name());
            });
    };
        
    ui.do_app_apply_changes     = function(changes, files, save_all) {
        for (var i=0; i < files.length; i++) {
            var filename = files[i];
            var change = changes.files[filename];
            ui.do_file_apply_change(change);
        }
        ui.refresh_file_templates();
        if (save_all) { ui.do_app_save_all(); }
    };


    // AcreDoc actions
    ui.do_file_create_new       = function(name, metadata, state) {
        if (ui.get_app().get_file(name)) { 
            ui.MessagePanel.error('File with that name already exists');
            return;
        }
        
        var file = new AcreDoc(ui.get_app(), name, metadata, state);
        
        ui.do_choose_file(file.get_name());
    };

    ui.do_file_set_acre_handler = function(acre_handler) {
        var file = ui.get_file();
        if (acre_handler === file.get_acre_handler()) { return; }
        file.set_acre_handler(acre_handler);
        ui.do_refresh_file();
    };
    
    ui.do_file_set_mime_type    = function(mime_type) {
        var file = ui.get_file();
        if (mime_type === file.get_mime_type()) { return; }
        file.set_mime_type(mime_type);
        ui.do_refresh_file();
    };
    
    ui.do_file_save             = function(force) {
        var file = ui.get_file();
        
        if (!file.is_dirty()) { return; }

        ui.MessagePanel.doing('Saving file: ' + file.get_name() + '...');
        file.t_save(force).enqueue()
            .onready(function(r) {
                ui.refresh_file_templates();
                ui.MessagePanel.info('File saved: '+ file.get_name());
            })
            .onerror(function(code, message, info) {
                if (code === "/api/status/error/upload/content_mismatch") {
                    ui.MessagePanel.clear();
                    ui.do_show_dialog("diff_patch", ["save_conflict", info.info]);
                } else if (code === "/api/status/error/auth") {
                    ui.MessagePanel.error('You are not currently signed in.  To not lose your changes, sign in in a new tab or window and then try again.');
                } else if (code === "/api/status/error/file_format/unsupported_mime_type") {
                    ui.MessagePanel.error(message);
                } else {
                    ui.MessagePanel.error(message || 'Error saving: '+ file.get_name());                    
                }
                ui.refresh_file_templates();
            });
    };

    ui.do_file_save_as          = function(app_path, new_name) {
        var old_file = ui.get_file();
        
        var new_app = (app_path == old_file.get_app().get_path()) ? old_file.get_app() : new AcreApp(ui.get_store(), app_path);
        var new_file_props = {
            acre_handler   : old_file.get_acre_handler(),
            content_type   : old_file.get_mime_type(),
            based_on       : old_file.get_app().get_path() + '/' + mjt.freebase.mqlkey_quote(old_file.get_name())
        };
        var new_file = new AcreDoc(new_app, new_name, new_file_props, old_file.get_editor_state());
        
        ui.MessagePanel.doing('Saving file as: ' + new_name + '...');
        new_file.t_save().enqueue()
            .onready(function(r) {
                if (new_app == ui.get_app()) {
                    ui.do_choose_file(new_file.get_name());
                } else {
                    new_app.destroy();
                }
                ui.MessagePanel.info('File created: '+ new_name);
            })
            .onerror(function(code, message, info) {
                if (info && info.code == "/api/status/error/auth") {
                    ui.MessagePanel.error('You are not currently signed in.  To not lose your changes, sign in in a new tab or window and then try again.');
                } else {
                    ui.MessagePanel.error(message || 'Error creating: '+ new_name);               
                }
            });
    };

    ui.do_file_revert_to_saved  = function() {
        var file = ui.get_file();
        file.t_revert_to_saved().onready(function() {
            ui.do_refresh_file();
        });
    };
        
    ui.do_file_move             = function(new_name, status_el) {
        var file = ui.get_file();
        var old_name = file.get_name();
        if (new_name == old_name) { return; }
        
        if (ui.get_app().get_file(new_name)) { 
            ui.MessagePanel.error('The name "' + new_name + '" is already taken. Please choose a different name.', status_el);
            return;
        }
        
        try {
            file.set_name(new_name);
        } catch(e) {
            ui.MessagePanel.error(e, status_el);
            return;
        }
        ui.do_choose_file(file.get_name());
    };

    ui.do_file_delete           = function(filename) {
        var file = filename ? ui.get_app().get_file(filename) : ui.get_file();
        
        ui.MessagePanel.doing('Deleting file:' + file.get_name() + '...');
        file.t_delete()
            .onready(function(r){
                ui.MessagePanel.info('File deleted: ' + file.get_name());
                _current_file = null;
                ui.do_choose_file();
            })
            .onerror(function(code, message, info) {
                ui.MessagePanel.error(message ? message : 'Error deleting: ' + file.get_name());
            });
    };

    ui.do_file_apply_change      = function(change, save) {
        var sfile                 = change.file1,
            tfile                 = change.file2,
            file;
        
        if (!sfile) {
            file              = ui.get_app().get_file(tfile.name);
            file.set_dirty("to_delete");
        } else if (!tfile) {
            var metadata          = {
                acre_handler : sfile.acre_handler,
                content_type : sfile.content_type,
                based_on     : sfile.fileid
            };
            file              = new AcreDoc(ui.get_app(), sfile.name, metadata, {text : sfile.text});
            file.hide();
        } else {
            file              = ui.get_app().get_file(tfile.name);
            file.set_name(sfile.name);
            file.set_acre_handler(sfile.acre_handler);
            file.set_mime_type(sfile.content_type);
            if (change.patch) {
                var text          = change.patch.text;
                
                if (file.is_editor_loaded()) {
                    file.set_editor_state({text:text});
                } else {
                    $('#file-area').append(file.get_element());
                    file.t_editor_show("TextareaEditor", { margin : false}, {text:text});
                    file.hide();
                }           
            } else if (sfile.revision && (sfile.revision !== tfile.revision)) {
                file.set_revision(sfile.revision);
            }
        }
        if (tfile && (tfile.name === ui.get_file().get_name())) {
            ui.do_refresh_file();
        }
        if (save) { ui.do_file_save(); }
    };

    

    // Editor actions
    ui.do_file_editor_undo      = function() {
        var file = ui.get_file();
        file.editor_undo();
    };
    
    ui.do_file_editor_redo      = function() {
        var file = ui.get_file();
        file.editor_redo();
    };

    ui.do_file_editor_goto_line = function(linenum) {
        var file = ui.get_file();
        file.editor_goto_line(linenum);
    };

    ui.do_file_editor_indent = function() {
        var file = ui.get_file();
        file.editor_indent();
    };
    
    // strip out html that Crockford doesn't like
    function decrock_html(text) {
        text = text.replace(/<\?xml[^>]+>/g,'');
        text = text.replace(/<style[^>]+>/g,'<style>');
        text = text.replace(/type=['"]text\/(css|javascript)['"]/g,'');
        return text;
    }
    
    // strip out stuff from acre templates that won't go through JSLint
    function decrock_acretag(tag) {
      var newtag = tag.replace(/acre:/g,'');
      return newtag;
    }
    function decrock_acre(text) {
        text = text.replace(/<acre:script>/g,'<script>').replace(/<\/acre:script>/g,'</script>');
        text = text.replace(/<\/?acre:(block|doc)[^>]*>/g,'');
        text = text.replace(/<[^>]+>/g,decrock_acretag); // <h1 acre:if="xx"> --> <h1>
        text = decrock_html(text);
        return text;
    }
    
    // fix CSS for JSLint
    // JSLint assumes every CSS file starts with: @charset "UTF-8";
    function decrock_css(text) {
        if (!(/^\s*@charset\s+"UTF-8";/.test(text))) {
            text = '@charset "UTF-8"; '+text;            
        }
        return text;
    }
    
    // Used by UI to decide if current file is supported by JSLint
    // Used by do_file_check() to get JSLint options for current file
    // (This function may belong somewhere else - ask Jason)
    ui.get_file_check_options = function() {
      // see http://www.jslint.com/lint.html
      var options = {
        bitwise:true, // bitwise operators should not be allowed
        eqeqeq: true, // === should be required
        forin: true, // unfiltered for in  statements should be allowed
        sub:    true, // subscript notation may be used for expressions better expressed in dot notation
        undef:  true, // undefined global variables are errors
        useful: 1     // App Editor extension - is JSLint useful for this file?  1 = yes, 0 = maybe, -1 = no
      };
  
      var acre_predef = ['acre','JSON','XMLHttpRequest','console'];
      // setup file-specific options
      switch (ui.get_file().get_acre_handler()) {
        case 'mqlquery':
          //TODO: special settings for query checking
          break;
        case 'acre_script':
          options.predef = acre_predef;
          options.es5    = true; // allow ES5 JS (like trailing commas)
          break;
        case 'mjt':
          options.es5    = true; // allow ES5 JS (like trailing commas)
          options.useful = 0; // disable the Check button (keyboard shortcut will still work)
          options.predef = acre_predef;
          options.before_check = decrock_acre;
          break;
        case 'passthrough':
          options.browser = true; // standard browser globals should be predefined
          switch (ui.get_file().get_mime_type()) {
            case 'application/json': break;
            case 'text/javascript' : break;
            case 'text/html'       : options.before_check = decrock_html; break;
            case 'text/css'        : options.before_check = decrock_css;  break;
            case 'text/plain'      : options.useful = 0;  break; // disable Check button
            default                : options.useful = -1; break; // completely disable Check button - unknown mime-type
          }
          break;
        default:
          options.useful = -1; // completely disable Check button - uknown acre_handler
          break;
      }
      return options;
    };

    
    function _display_jslint_error(err_div, extra) {
        var msg = err_div.attr('title');
        ui.MessagePanel.clear();
        var text = msg + (extra||'');
        var html = text.replace(/\&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); // HTML enocde TODO: move into MessagePanel
        ui.MessagePanel.error(html);
        var linenum = err_div.text();
        ui.get_file().editor_goto_line(linenum);
    }
    
    ui.do_click_error = function(e) {
        var target = $(e.target);
        if (target.hasClass('jslint-error')) {
            _display_jslint_error(target);
        }
    };
    
    ui.do_file_check = function() {
        ui.do_hide_overlays();
        
        // remove previous warnings:
        var linenumber_container = $('.CodeMirror-line-numbers,.editor-margin-line-numbers', ui.get_file().get_element());
        $('>div.jslint-error',linenumber_container).attr('title','').removeClass('jslint-error');

        ui.MessagePanel.clear();

        var jslint_options = ui.get_file_check_options();
        assert.critical(jslint_options, 'missing jslint_options');
        var source_code = ui.get_file().get_editor_state().text;
        if (jslint_options.before_check) {
            source_code = jslint_options.before_check(source_code);
        }
        
        fb.get_script(SERVER.libs["fulljslint"], function(){
	        var ok = JSLINT(source_code, jslint_options);
	        if (ok) {
	            ui.MessagePanel.info('No syntax errors found');
	        } else {
	            var errors = JSLINT.errors;
	            var popup_text = 'Found '+errors.length +' errors.  Click any of the red line numbers below to see corresponding error details.';
	            var linenumbers = $('>div', linenumber_container);
	            if (!linenumbers.length) {
	              // no linenumber control available (example: queryeditor)
	              errors = errors.slice(0,3); // first 3 errors 
	              popup_text = $.map(errors,function(e) { if (e) { return 'Line: '+e.line+' '+e.reason; } });
	            } else {
	              for (var i=0;i<errors.length;i++) {
	                var e=errors[i];
	                if (e) {
	                  var line = linenumbers.eq(e.line-1);
	                  line.addClass('jslint-error');
	                  line.attr('title', line.attr('title') + ' ' + e.reason);
	                }
	              }
	            }
	            ui.MessagePanel.error(popup_text);
	            // scroll to the first error
	            ui.get_file().editor_goto_line( errors[0].line );
	        }
        });
    };

    ui.do_zen_coding = function() {
      if (ui.get_file().get_editor_name() !== 'CodeMirror') { return; }
      var about  = '<a target="_blank" href="http://code.google.com/p/zen-coding/wiki/ZenHTMLSelectorsEn">ZenCoding</a>',
          cm     = ui.get_file()._current_editor.editor,  // current CodeMirror
          pos    = cm.cursorPosition(),                   // current cursor position
          tab    = cm.options.indentUnit,                 // spaces per tab
          text   = cm.lineContent(pos.line),              // text on line
          r      = /(\s*)(.*)/.exec(text),
          level  = Math.floor(r[1].length/tab),           // number of leading tabs
          zexpr   = r[2],                                 // zencoding expression
          result;

      if (zexpr) {
        result = zen.convert(zexpr,level);
        if (result.error) {
          ui.MessagePanel.error('Zen Coding syntax error in "'+mjt.htmlencode(result.error)+'".<br> See '+about+' for help');
        } else {
          ui.MessagePanel.info('Expanded '+about+' expression');
          cm.setLineContent(pos.line,result.out);
        }
      }
    };
    
    ////////////////////////    
    //                    //
    //    Editor Prefs    //
    //                    //
    ////////////////////////
    
    var DEFAULT_PREFS    = { 
        texteditor     : "CodeMirror",
        syntax          : (navigator.userAgent.indexOf("iPad") === -1) ? true : false,
        margin          : true,
        softwrap        : false,
        dotTrigger      : false,
        flw             : 200,
        t_mjt           : true,
        t_acre_script   : true,
        t_mqlquery      : true,
        t_passthrough   : true,
        t_binary        : true,
        t_test          : true,
        emql            : false
    };

    ui.get_editor_prefs         = function(key) {
        
        function _get_pref(key) {
            var setting = $.localStore(key);
            if (setting === null) { return DEFAULT_PREFS[key]; }
            else if (setting == '1') { return true; }
            else if (setting == '0') { return false; }
            else { return setting; }
        }

        if (key) {
            return _get_pref(key);
        } else {
            var prefs = {};
            for (var k in DEFAULT_PREFS) {
                prefs[k] = _get_pref(k);
            }

            return prefs;            
        }
    };

    ui.set_editor_prefs         = function(arg1, arg2) {
        var prefs;
        
        // takes either a single key, value pair
        // or a dictionary of prefs
        if (arguments.length == 1) {
            prefs = arg1;
        } else if (arguments.length == 2) {
            prefs = {};
            prefs[arg1] = arg2;
        }
        
        for (var key in prefs) {
            var value;
            if (prefs[key] === true) { value = '1'; }
            else if (prefs[key] === false) { value = '0'; }
            else { value = prefs[key]; }
            
            $.localStore(key, value);
        }
    };
    
    
    ui._get_desired_editor_classname = function(file) {
        file = file || this.get_file();
        
        // TODO: make this capabilities-based?
        var acre_handler = file.get_acre_handler();
        if (acre_handler == 'binary') {
            return "ImageEditor";
        } else if (acre_handler == 'mqlquery') {
            return "QueryEditor";
        } else {
            var pref = ui.get_editor_prefs("texteditor");
            return EDITORS[pref] ? pref : DEFAULT_PREFS.texteditor;
        }
    };




    //////////////////////////////////
    //                              //
    //     Editor Event Handlers    //
    //                              //
    //////////////////////////////////
    
    ui._register_editor_event_handlers = function(file) {
        file.register_editor_event_handlers({
            change          : ui.editor_change_handler,
            linechange      : ui.editor_linechange_handler,
            newframe        : ui.editor_newframe_handler
        });
    };
    
    ui.editor_change_handler        = function(undos, redos) {
        // this check is here because it seems like the best and
        // simplest approximation of being "active" in appeditor
        if (+ new Date() - _last_status_check > 60000) {
            _last_status_check = + new Date();
            ui.do_status_check();
        }
        
        if (_current_file_is_dirty != ui.get_file().is_dirty()) {            
            ui.refresh_file_templates();
        }
        
        if (undos > 0) {
            if (!ui._has_undos) { $('#button-undo').removeAttr('disabled'); }
            ui._has_undos = true;
        } else {
            if (ui._has_undos) { $('#button-undo').attr('disabled', 'disabled'); }
            ui._has_undos = false;
        }
        
        if (redos > 0) {
            if (!ui._has_redos) { $('#button-redo').removeAttr('disabled'); }
            ui._has_redos = true;
        } else {
            if (ui._has_redos) { $('#button-redo').attr('disabled', 'disabled'); }
            ui._has_redos = false;
        }
    };
        
    ui.editor_linechange_handler    = function(linenum) {
        _current_line = linenum;
        $('#linenumber').val(linenum);
    };
    
    ui.editor_newframe_handler      = function(frame) {
        var fdoc = frame.contentWindow ? frame.contentWindow.document : frame.contentDocument;
        ui.shortcut.register_keys(fdoc);
    };
    
    ui.warn_user_about_unsaved_files = function() {
        if (ui && ui.get_app() && ui.get_app().is_dirty()) {
            return "You have unsaved files! The changes you made to these files will be lost if you leave this page.";
        } else {
            return undefined;
        }
    };
    
    
    
    ////////////////////
    //                //
    //     Helpers    //
    //                //
    ////////////////////
    
    ui.url_for                  = function(filename) {
        var base_path = SERVER.acre.request.base_path;
        return base_path + "/" + filename;
    };
    
    ui.get_app_url              = function(host) {
        return 'http://' + host + ui.get_store().get_acre_host();
    };

    ui.get_appeditor_url        = function(obj, filename) {
        var app_path;
        if (typeof obj == 'string') {
            app_path = obj;
        } else if (obj instanceof AcreDoc) {
            app_path = obj.get_app().get_versioned_path();
            filename = obj.get_relative_path();
        } else if (obj instanceof AcreApp) {
            app_path = obj.get_versioned_path();
        }

        var url = window.location.protocol + '//' + window.location.host + window.location.pathname;
        if (app_path) { url += '#!path=' + app_path; }
        if (filename) { url += '/' + filename; }
        return url;
    };
    
    ui.id_to_path               = function(appid) {
        return "//" + appid.split("/").reverse().join(".") + "dev";
    };
    
    ui.get_human_timestamp      = function(timestamp) {
        var t = mjt.freebase.date_from_iso(timestamp);
        return t.toLocaleString();
    };
    
    ui.get_relative_timestamp   = function(timestamp) {
        var c = new Date();
        var t = mjt.freebase.date_from_iso(timestamp);

        var d = c.getTime() - t.getTime();
        var dY = Math.floor(d / (365 * 30 * 24 * 60 * 60 * 1000));
        var dM = Math.floor(d / (30 * 24 * 60 * 60 * 1000));
        var dD = Math.floor(d / (24 * 60 * 60 * 1000));
        var dH = Math.floor(d / (60 * 60 * 1000));
        var dN = Math.floor(d / (60 * 1000));

        if (dY > 0)   { return dY === 1? "1 year ago"   : dY + " years ago"; }
        if (dM > 0)   { return dM === 1? "1 month ago"  : dM + " months ago"; }
        if (dD > 0)   { return dD === 1? "1 day ago"    : dD + " days ago"; }
        if (dH > 0)   { return dH === 1? "1 hour ago"   : dH + " hours ago"; }
        if (dN > 0)   { return dN === 1? "1 minute ago" : dN + " minutes ago"; }
        if (dN === 0)  { return "less than a minute ago"; }
        if (dN < 0)   { return "in the future???"; }
    };

    ui.order_section_files      = function(app) {
        var ordered_filenames = {};
        var files = app.get_files();
        for (var f in files) {
            var file = files[f];
            var name = file.get_name();
            var handler = file.get_acre_handler(); 
            
            var section = ((handler == 'acre_script') && (name.substr(0,5) == "test_")) ? "test" : handler;
            if (typeof ordered_filenames[section] == 'undefined') {
                ordered_filenames[section] = [];
            }
            ordered_filenames[section].push(name);
        }
        for (var s in ordered_filenames) {
            ordered_filenames[s].sort(function(a, b) {
                return a.localeCompare(b);
            });
        }
        return ordered_filenames;
    };
    
    ui.order_lib_files          = function(lib) {
        var filenames = [];
        var files = lib.get_files();
        for (var f in files) {
            filenames.push(files[f].get_name());
        }
        filenames.sort(function(a, b) {
           return a.localeCompare(b); 
        });
        return filenames;
    };
    
    ui.watch_inputs             = function(button_name, options) {
        
        function _compare_inputs() {
            var any_result = false;
            var all_result = options.inputs.length;
            var result = {};

            jQuery.each(options.inputs, function(input, test){
                var new_value;
                var el = $('#' +input)[0];
                if (typeof el == 'undefined') { el = $("input[name='" + input + "']")[0]; }
                if (typeof el == 'undefined') { return; }
                
                if (el.tagName == 'TEXTAREA') { 
                    new_value = jQuery.trim($('#'+input).val()); 
                } else if (el.tagName == 'INPUT') {
                    var type = $(el).attr('type');
                    if (type == 'text') { new_value = jQuery.trim($('#'+input).val()); }
                    else if (type == 'radio') { new_value = $("input[name='" + input + "']:checked").val(); }
                    else if (type == 'checkbox') { new_value = $('#'+input).attr('checked'); }
                } else if (el.tagName == 'SELECT') {
                    new_value = $('#'+input + ' :selected').val();
                }
                 
                if (new_value != options.inputs[input]) {
                    any_result = true;
                    all_result -= 1;
                    result[input] = new_value;
                }
            });
            
            var ret;
            if (options.activate_on == "all") {
                ret = (all_result === 0) ? result : false;
            } else {
                ret = any_result ? result : false;
            }
            
            return ret;
        }
        
        function _update_inputs() {
            var res = _compare_inputs();
            
            if (res && options.change) { 
                res = options.change.apply(this, [res]); 
            }
            
            if (res) {
                $('#button-' + button_name).removeAttr('disabled').addClass('button-primary');
            } else {
              $('#button-' + button_name).attr('disabled', 'disabled').removeClass('button-primary');
            }
        }
        
        function _watch_input(input) {
            $('#'+input).bind('change', function(e) {
                _update_inputs();
            });
        }
        
        function _watch_text_input(input) {
            var timer;
            $('#'+input).bind('keyup', function(e){
                clearTimeout(timer);
                timer = setTimeout(_update_inputs, options.text_delay || 300);
            });
        }
        
        function _watch_radio_input(input) {
            $("input[name='" + input + "']").bind('click', function(){
                _update_inputs();
            });
        }

        jQuery.each(options.inputs, function(input, test){
            var el = $('#' +input)[0];
            if (typeof el == 'undefined') { el = $("input[name='" + input + "']")[0]; }
            if (typeof el == 'undefined') { return; }
            
            if (el.tagName == 'TEXTAREA') { 
                _watch_text_input(input, test); 
            } else if (el.tagName == 'INPUT') {
                var type = $(el).attr('type');
                if (type == 'text') { _watch_text_input(input); }
                else if (type == 'radio' ) { _watch_radio_input(input); }
                else {  _watch_input(input); }
            } else if (el.tagName == 'SELECT') {
                _watch_input(input);
            }
        });
        
        $('#button-' + button_name).unbind('click').click(function(){
            var final_changes = _compare_inputs();
            options.submit.apply(this, [final_changes]);
            
            if (options.update_on_submit) {
                jQuery.extend(options.inputs, final_changes);
                _update_inputs();                
            }
        });
    };
    
    ui.populate_diff            = function(el, data, method) {
        var header  = $('<div class="diff-header-container"></div>'),
            f1_head = $('<div class="diff-header"></div>'),
            f1_line = $('<div class="diff-line-container"></div>'),
            f1_code = $('<div class="diff-code-container"></div>'),
            f2_head = $('<div class="diff-header"></div>'),
            f2_line = $('<div class="diff-line-container"></div>'),
            f2_code = $('<div class="diff-code-container"></div>'),
            lines = {
                left : 1,
                right : 1
            };
            
        function resize() {
            var code_height = el.parent().height() - header.height();
            f1_line.height(code_height);
            f1_code.height(code_height);
            f2_line.height(code_height);
            f2_code.height(code_height);
        }
        
        function scroll() {
            var pos;
            if (data.file1 || (typeof data.file1 === 'undefined')) {
                pos = f1_code.scrollTop();
                f1_line.scrollTop(pos);
            } else {
                pos = f2_code.scrollTop();
            }
            
            if (data.file2 || (typeof data.file2 === 'undefined')) {
                f2_line.scrollTop(pos);
                f2_code.scrollTop(pos);                
            }
        }
        
        function create_line(line_container, code_container, line, side) {

            var classname;            
            if (line.length > 1) { 
                classname =  "replace"; 
            } else if ((line[0][0] == -1) && (side === "left")) {
                classname = "delete";
            } else if ((line[0][0] == 1) && (side === "right")) {
                classname = "insert";
            } else {
                classname = "eq";
            }
            
            var ln = $('<div class="line"></div>');
            var dir = (side === "left") ? 1 : -1;

            if (!(line.length == 1 && line[0][0] == dir)) {
                ln.append($('<pre></pre>').text(lines[side]));
                if (!(line.length === 1 && (line[0][0] === dir))) { lines[side]+=1; }
            } else {
                ln.append('<pre> </pre>');
            }
            line_container.append(ln);
            
            var code_wrapper = $('<div class="code"></div>').addClass(classname);
            var cd = $('<pre></pre>');
            var ins = false;
            for (var j=0; j < line.length; j++) {
                var change = line[j];
                var text = change[1] === "" ? " " : change[1];
                switch (change[0]) {
                    case 0 :
                        ins = true;
                        var eq = $('<span class="text-eq"></span>').text(text);
                        cd.append(eq);
                        break;
                    case 1 :
                        if (side === "right") {
                            ins = true;
                            var add = $('<span class="text-add"></span>').text(text);
                            cd.append(add);                            
                        }
                        break;
                    case -1 :
                        if (side === "left") {
                            ins = true;
                            var del = $('<span class="text-delete"></span>').text(text);
                            cd.append(del);
                        }
                        break;
                }
            }
            if (!ins) { cd.text(" "); }
            
            code_wrapper.append(cd);
            code_container.append(code_wrapper);
        }
        
        function has_change(line, side) {
          for (var i=0; i < line.length; i++) {
            if (line[i][0] == side) {
              return true;
            }
          }
          return false;
        }
        
        function md_change(file1,file2) {
          if (file1 && file2) {
            return (file1.acre_handler !== file2.acre_handler) || (file1.content_type !== file2.content_type);
          } else { return false; }
        }
        
        function name_change(file1,file2) {
          if (file1 && file2) {
            return (file1.name !== file2.name);
          } else { return false; }
        }
        
        function appid(file) {
          var file_segs = file.fileid.split('/');
          file_segs.pop();
          return file_segs.join("/");
        }
        
        if (data.labels && data.labels.length) {
            if (data.labels[0]) {
                var label1 = $('<h3></h3>');
                label1.text(data.labels[0]);
                f2_head.append(label1);
                header.append(f2_head);
            }
            if (data.labels[1]) {
                var label2 = $('<h3></h3>');
                label2.text(data.labels[1]);
                f1_head.append(label2);
                header.append(f1_head);
            }
        } else {
            if (data.file2) {
                var f2_name = $('<h3></h3>');
                if (!data.file1) { 
                    f2_head.addClass("full");
                    f2_code.addClass("full");
                    f2_name.append("Delete: "); 
                }

                if (name_change(data.file1, data.file2)) { f2_name.addClass("change"); }
                f2_name.append(data.file2.name);
                if (appid(data.file2) !== ui.get_app().get_path()) { f2_name.append("in " + appid(data.file2)); }

                var f2_md = $('<h3></h3>');
                if (md_change(data.file1, data.file2)) { f2_md.addClass("change"); }
                f2_md.append(ui.get_store().get_acre_handlers()[data.file2.acre_handler].name);
                if (data.file2.content_type) { f2_md.append(" (" + data.file2.content_type + ")"); }
                f2_head.append(f2_name).append(f2_md);

                if (method === 'get_file_diff') {
                    var f2_lm = $('<h3></h3>');
                    if (data.file2.last_modified) { f2_lm.append("Last Mod: " + ui.get_human_timestamp(data.file2.last_modified)); }
                    f2_head.append(f2_lm);
                }
                header.append(f2_head);
            }

            if (data.file1) {
                var f1_name = $('<h3></h3>');
                if (!data.file2) { 
                    f1_head.addClass("full");
                    f1_code.addClass("full");
                    f1_name.append("Create: "); 
                }
                else if (method == "get_file_merge") { f1_name.append("After Merge: "); }
                f1_name.append(data.file1.name);
                if (method == "get_file_diff" && appid(data.file1) !== ui.get_app().get_path()) { f1_name.append("in " + appid(data.file1)); }

                var f1_md = $('<h3></h3>');
                f1_md.append(ui.get_store().get_acre_handlers()[data.file1.acre_handler].name);
                if (data.file1.content_type) { f1_md.append(" (" + data.file1.content_type + ")"); }
                f1_head.append(f1_name).append(f1_md);

                if (method === 'get_file_diff') {
                    var f1_lm = $('<h3></h3>');
                    if (data.file1.last_modified) { f1_lm.append("Last Mod: " + ui.get_human_timestamp(data.file1.last_modified)); }
                    f1_head.append(f1_lm);
                }
                header.append(f1_head);
            }
        }
        el.append(header);
        
        
        if (data.message) {
            el.append($('<div class="message"></div>').text(data.message));
        } else if (data.file1 && data.file2 && data.file1.revision === data.file2.revision) {
            el.append('<div class="message">No change in content</div>');
        } else if ((data.file2 && data.file2.binary) || (data.file1 && data.file1.binary)) {
            if(data.file2 && data.file2.binary) {
                f2_line.append('<pre> </pre>'); 
                f2_code.append('<div class="image"><div class="image-preview"><img src="' + data.file2.binary + '" /></div></div>');
                el.append(f2_line).append(f2_code);
            }
            if(data.file1 && data.file1.binary) {
                f1_line.append('<pre> </pre>'); 
                f1_code.append('<div class="image"><div class="image-preview"><img src="' + data.file1.binary + '" /></div></div>');
                el.append(f1_line).append(f1_code);
            }
        } else if (data.diff) {
            for (var i=0; i < data.diff.length; i++) {
                var line = data.diff[i];
                
                if (data.file2 || (typeof data.file2 === 'undefined')) {
                    create_line(f2_line, f2_code, line, "left");
                }
                
                if (data.file1 || (typeof data.file1 === 'undefined')) {
                    create_line(f1_line, f1_code, line, "right");
                }
            }
            
            if (data.file2 || (typeof data.file2 === 'undefined')) { 
                f2_line.append('<div class="line"><pre> </pre></div>'); 
                el.append(f2_line).append(f2_code);
                f2_code.scroll(scroll);
            }
            if (data.file1 || (typeof data.file1 === 'undefined')) { 
                f1_line.append('<div class="line"><pre> </pre></div>');
                el.append(f1_line).append(f1_code);
                f1_code.scroll(scroll);
            }
            
            if ((data.file1 || (typeof data.file1 === 'undefined')) && (data.file2 || (typeof data.file2 === 'undefined'))) {
                f2_code.css("overflow-y", "hidden");
            }
        }
        
        resize();
        $(window).resize(resize);
    };
    
    
    
    ///////////////////////
    //                   //
    //   Message Panel   //
    //                   //
    ///////////////////////

    /**
     *   depends on CSS classes: message-info message-error
     */
    ui.MessagePanel = (function(){
        var SECONDS = 1000;

        var timer;
        var hide_func;
        var last_level;
        
        function _show(log_type,str,duration) {
            var el = '#message-panel';
            if (last_level && last_level === 'error') {
                // If we already displaying an error then don't display any more messages
                // (The previous error should have terminated all tasks, so we shouldn't get here)
                mjt.error('MessagePanel: Already displaying error. Ignoring: '+log_type+': '+str);
            } else {
                // TODO - figure out how to get the tid
                var tid = null;
                $(el).hide().acre("templates", "message_panel", [log_type, str, tid]);
                last_level = log_type;
                window.clearTimeout(timer);
                hide_func = function(){
                    $(el).empty();
                    hide_func = null;
                    last_level = null;
                };
                
                /*
                if (log_type !== 'error') {
                    timer = window.setTimeout(hide_func, duration);                    
                }
                */
                timer = window.setTimeout(hide_func, duration);

                $(el).slideDown(300);             
            }
        }

        function _clear() {
            window.clearTimeout(timer);
            if (hide_func) { hide_func(); }
        }
        // return '' so we can be called inside a mjt.def
        // doing() is for tasks that take time - the message MUST be cancelled with info() or error()
        return {
            doing : function(str, tid) {  _show('doing',str, 2000 * SECONDS, tid); return ''; },
            info  : function(str, tid) {  _show('info', str,    4 * SECONDS, tid); return ''; },
            error : function(str, tid) {  _show('error',str,    6 * SECONDS, tid); return ''; },
            clear : _clear
        };
    })();



    //////////////////
    //              //
    //   Shortcuts  //
    //              //
    //////////////////
    
    /* Exposes only two public functions. Depends only on DOM .shortcut-* and global user object */

    ui.shortcut = {};
    
    (function() {

        var shortcut_config = [
            {op:'Code Assist' },
            {op:'Open App',           key:'O',        action: function() { ui.do_show_menu('apps', [true]); } },
            {op:'Save File',          key:'S',        action: function() { ui.do_file_save(); } },
            {op:'View',               key:'Shift-P',  action: function() { ui.do_run_view(null, false); } },            
            {op:'View with Console',  key:'P',        action: function() { ui.do_run_view(null, true); } },
            {op:'Undo',               key:'Z',        action: function() { ui.do_file_editor_undo(); } },
            {op:'Redo',               key:'Shift-Z',  action: function() { ui.do_file_editor_redo(); } },
            {op:'Redo',               key:'Y',        action: function() { ui.do_file_editor_redo(); } },
            {op:'Check Syntax',       key:'Shift-C',  action: function() { ui.do_file_check();         } },
            {op:'Expand Expression',  key:'E',        action: function() { ui.do_zen_coding();         } },
            {op:'Indent Selection',   key:'Shift-I',  action: function() { ui.do_file_editor_indent(); } },
            {op:'Jump to Line',       key:'J',        action: function() { $('#linenumber').focus().select(); } }
        ];

        var _isMac = (navigator.platform.indexOf('Mac') === 0); // Cmd/Meta key for Macs
        var modifier = _isMac ? 'Meta' : 'Ctrl';             // Ctrl for windows, linux and unknown

        // This should only be called once per target (window/iframe)
        ui.shortcut.register_keys = function(target) {
            $.each(shortcut_config, function(i,config) {
                var keys = modifier + '-' + config.key;
                var func = config.action;
                shortcut.add(keys, func, {target:target});
            });
        };
        
        ui.shortcut.get_shortcuts   = function() {
            return shortcut_config;
        };
        
        ui.shortcut.get_keys = function(op) {
            var key;
            
            if (op == 'Code Assist') {
                key = (navigator.platform.indexOf('Mac')===0 ? 'Alt-' : 'Ctrl-') + 'Space';
            } else {
                $.each(shortcut_config, function(i, config) {
                     if (config.op == op)  {
                         key = (navigator.platform.indexOf('Mac')===0 ? '&#8984;-' : 'Ctrl-') + config.key;
                     }
                });
            }
            
            return key;
        };
    })();
    
})();


$(document).ready(function(){
    if($.browser.msie && $.browser.version < "8.0") {
        assert.critical(false, "Internet Explorer 6 and 7 are not supported.  IE8+, Firefox 3+ and Safari 3+ are." + 
        "Another option is to install <a href='http://www.google.com/chromeframe'>Google Chrome Frame</a>");
        return;
    }

    ui.set_store(new FreebaseStore());
    var store = ui.get_store();
    store.t_init()
        .onready(function() {
            ui.set_user(store.get_user());
            ui.init();
            
            // warn if third-party cookies are disabled
            store.TestCookies(store)
                .enqueue()
                .onerror(function(code, message, info) {
                    ui.MessagePanel.error("Your browser configuration may not always let you see your latest " + 
                    "changes when clicking <b>View</b> (third-party cookies).<br/><br/>" +
                    "Hold down the <b>Shift</b> key when clicking the browser <b>Refresh</b> button to ensure " +
                    "you're seeing the latest.");                    
                });
        })
        .onerror(function(code, message, info) {
            assert.critical(false, "Error connecting to Freebase<br/>" + message);
            mjt.error(code, message, info);
        });
});
