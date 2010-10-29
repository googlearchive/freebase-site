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

 /////////////////////////
 //                     //
 //   Freebase store    //
 //                     //
 /////////////////////////

 function FreebaseStore(service_url, acre_server) {
     this._url = service_url || SERVER.acre.freebase.service_url;
     this._site_url = SERVER.acre.freebase.site_host;
     this._acre_server = acre_server || (SERVER.acre.host.name + (SERVER.acre.host.port===80 ? "" : ":" + SERVER.acre.host.port));
     
     this._handlers = [];
     
     this._user = null;

     return this;
 }


(function() {
    
    var APP_EDITOR_SERVICE_PATH = SERVER.appeditor.service_path;
    
    
    //    App Editor JSONP
    var AppEditorJsonp = mjt.define_task(mjt.freebase.FreebaseJsonPTask,  [{name: 'service'},
                                                                           {name: 'args'}]);

    AppEditorJsonp.prototype.request = function () {
        return this.service_request(APP_EDITOR_SERVICE_PATH + this.service, this.args);
    };

    AppEditorJsonp.prototype.response = function(o) {
        return this.ready(o.result);
    };
    
    
    //    App Editor XHR - GET
    var AppEditorXhrGet = mjt.define_task(mjt.freebase.FreebaseXhrTask, [{name: 'service'},
                                                                         {name: 'args'}]);

    AppEditorXhrGet.prototype.request = function () {
        var url = APP_EDITOR_SERVICE_PATH + this.service;
        if (this.args) { url += "?" + mjt.formencode(this.args); }
        return this.xhr_request("GET", url);
    };
    
    
    //    App Editor XHR - POST
    var AppEditorXhrPost = mjt.define_task(mjt.freebase.FreebaseXhrTask, [{name: 'service'},
                                                                          {name: 'args'}]);

    AppEditorXhrPost.prototype.request = function () {
        return this.xhr_form_post(APP_EDITOR_SERVICE_PATH + this.service, this.args);
    };
    
        
    //   AppEditor File Upload
    var AppEditorFileUpload = mjt.define_task(null, [{name: 'service'},
                                                     {name: 'form'}, 
                                                     {name: 'args'}]);

    AppEditorFileUpload.prototype.dynamic_iframe = function (id) {
        var iframe = document.createElement('iframe');
        if (typeof id === 'string') {
            iframe.id = id;
            iframe.name = id;
        }
        iframe.style.display = 'none';
        // the class='mjt_dynamic' tells the compiler to skip it, a useful hack.
        iframe.className = 'mjt_dynamic';
        return iframe;
    };


    AppEditorFileUpload.prototype.request = function () {
        this.domid = mjt.uniqueid('mjt_iframe');
        var iframe = this.dynamic_iframe(this.domid);
        $('body').append(iframe);
        var form = this.form;

        // works on firefox and hopefully safari
        function inner_document() {        
            var idoc = (iframe.contentWindow || iframe.contentDocument);
            if (idoc.document) { return idoc.document; }
            return idoc;
        }

        var task = this;
        
        function _on_timeout() {
            task.error('timeout', 'Upload timed out - no response from server.');
            _cleanup();
        }
        
        function _cleanup() {
            window.setTimeout(function(){ $(iframe).remove(); },1);
        }
        
        // set a timeout of 30s... same as Acre timeout
        var timeout = window.setTimeout(_on_timeout, 30000);
        iframe.onload = function () {
            window.clearTimeout(timeout);
            
            var response_text = $(inner_document(iframe).body).text();
            var o = JSON.parse(response_text);

            if (o.code === '/api/status/ok') {
                task.result = o.result;
                task.ready(task.result);
            } else {
                task.error(o.code, o.messages[0].message);             
            }

            _cleanup();
        };
        
        form.attr({
            target: this.domid,
            action: mjt.form_url(APP_EDITOR_SERVICE_PATH + this.service, this.args),
            method: 'POST',
            enctype: 'multipart/form-data'
        }).submit();
    };
    
    
    //   Touch for Acre Apps
    var AppTouch = mjt.define_task(mjt.freebase.FreebaseJsonPTask, [{name:'service_url', 'default':null}]);

    AppTouch.prototype.request = function () {
        // Touch should never be cached
        this.jsonp.cache_controller = {
            is_fresh : function(task) {
                return false;
            }
        };

        return this.service_request("/acre/touch?_=" + (+new Date()));
    };

    AppTouch.prototype.response = function(o) {
        // no response expected for now but whatever
        return this.ready(null);
    };
    
        
    FreebaseStore.prototype.Jsonp       = AppEditorJsonp;
    FreebaseStore.prototype.XhrGet      = AppEditorXhrGet;
    FreebaseStore.prototype.XhrPost     = AppEditorXhrPost;
    FreebaseStore.prototype.FileUpload  = AppEditorFileUpload;
    FreebaseStore.prototype.AppTouch    = AppTouch;
    
    
    FreebaseStore.prototype.set_user = function(user) {
        var store = this;
                  
        if (user) {
            store._user = new AcreUser(store, user);
            if (user.apps) { store._user_apps = user.apps; }

            mjt.freebase.freebase_user   = {
                name : user.name,
                id   : '/user/' + user.name
            };
        } else {
            store._user                = null;
            store._user_apps           = null;
            mjt.freebase.freebase_user = null;
        }
    };
    
    FreebaseStore.prototype.t_init = function(){
        var store = this;

        mjt.app = new mjt.App();
        mjt.freebase.service_url = window.location.protocol + '//' + window.location.host;
        mjt.freebase.xhr_ok = true;                             // Set current server as an xhr proxy for freebase apis
		
        var inittask = this.XhrGet('init_store')
            .onready(function(r) {
                store._acre_server          = r.host.name + (r.host.port === 80 ? "" : ":" + r.host.port);
                store._handlers             = r.acre_handlers;
                store._version              = r.version;                
                store.set_user(r.user);
            });

        return inittask.enqueue();
    };
    
    FreebaseStore.prototype.destroy = function() {
        var store = this;
        store = null;
    };

    

    var TestCookies = mjt.define_task(null, [{name: 'store'}]);
    
    TestCookies.prototype.request = function() {
        this.url = window.location.protocol + '//appeditor-services.site.freebase.dev.' + this.store.get_acre_host() + '/check_thirdparty_cookies';
        
        var task = this;
        this.jsonp = mjt.JsonP();
        this.jsonp.set_timeout()
            .jsonp_request_form(this.url, null, 'callback')
            .onready(function(r) {
                if (r.result === 'success') {
                    task.ready();
                } else {
                    task.error();
                }
            })
            .onerror('error', task);
    };
    
    FreebaseStore.prototype.TestCookies = TestCookies;
    
    FreebaseStore.prototype.get_acre_version = function() {
        return this._version;
    };
    
    FreebaseStore.prototype.get_user = function() {
        return this._user;
    };
    
    FreebaseStore.prototype.get_user_apps = function(appid) {
        if (appid) {
            for (var i=0;i < this._user_apps.length; i++) {
                if (this._user_apps[i].appid == appid) {
                    return this._user_apps[i].appid;
                }
            }    
            return null;
        } else {
            return this._user_apps;
        }
    };
    
    FreebaseStore.prototype.set_user_apps = function(user_apps) {
        this._user_apps = user_apps;
    };
    
    FreebaseStore.prototype.t_refresh_user_apps = function() {
        var store = this;
        store.XhrGet('list_user_apps')
            .enqueue()
            .onready(function(user_apps) {
                store._user_apps = user_apps;
            });
    };
    
    FreebaseStore.prototype.get_url = function() {
        return this._url;
    };
    
    FreebaseStore.prototype.get_service_path = function() {
        return APP_EDITOR_SERVICE_PATH;
    };
            
    FreebaseStore.prototype.get_name = function() {
        var name = this._name ? this._name : '???';
        if (name === 'OTG') { name = ''; }
        return name;
    };
      
    FreebaseStore.prototype.get_acre_handlers = function(){
        return this._handlers;
    };
      
    FreebaseStore.prototype.get_supported_mime_types = function(acre_handler){
        assert.critical(acre_handler, 'Can\'t list supported mimetype');
        return this._handlers[acre_handler].supported_mime_types;
    };
    
    FreebaseStore.prototype.get_acre_host = function() {
        return this._acre_server;
    };

    FreebaseStore.prototype.get_freebase_url = function() {
        return this._site_url;
    };
      
    FreebaseStore.prototype.get_user_new_app_path = function(user, path) {
        return "//" + path + "." + user.get_name() + ".user.dev";
    };
    
    FreebaseStore.prototype.get_user_default_app_host = function(user) {
        return user.get_name() + ".user.dev." + this.get_acre_host();
    };  

    FreebaseStore.prototype.get_user_view_url = function(user) {
        return this.get_freebase_url() + '/view/user/' + user.get_name();
    };

    FreebaseStore.prototype.get_user_image_url = function(user) {
        return this.get_url() + '/api/trans/image_thumb/user/' + user.get_name() + "?maxwidth=30&maxheight=30&mode=fillcrop";
    };

    FreebaseStore.prototype.validate_filename = function(name) {
        // TODO - this check is duplicated in acre.js / AcreDoc
        var RESERVED_KEYS = {'acre':true, 'status':'', 'api':true};

        if (!(/^[A-Za-z][\-_0-9A-Za-z\.]+$/).test(name)) { return false; }

        if (name in RESERVED_KEYS) { return false; }

        return true;
    };
    
    mjt.label_package('FreebaseStore');
    
})();
