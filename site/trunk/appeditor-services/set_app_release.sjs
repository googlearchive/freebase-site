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

var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

var hostpath = '/freebase/apps/hosts';
var default_hostpath = '/freebase/apps/hosts/com/freebaseapps';
var user = null;


function set_release(appid, version) {
    appid = service.parse_path(appid).appid;
    
    // Lets make absolutely sure we're working off the latest state of the graph
    FB.touch();
    
    var versionid = (version !== 'current') ? appid + '/' + version : appid;
    var version_lib = acre.require('lib_app_versions');
    var app = version_lib.get_versions(appid);
    
    var delete_write = [];
    var add_write = [];
    
    // ugly stuff we have to keep around to deal with past bugs
    // that allowed claiming multiple freebaseapps hosts per app
    var pub_regexp = /([^.]*)\.freebaseapps\.com$/;
    var freebaseapps_host = false;
    
    for each (var host in app.hosts) {
        var ar = host.host.split('.');
        var hostid = hostpath + '/' + ar.splice(1, ar.length).reverse().join('/');
        var val = host.host.split('.')[0];

        var old_versionid = (host.version !== 'current') ? appid + '/' + host.version : appid;        
        delete_write.push({
            id : old_versionid,
            key : {
                value : val,
                namespace : hostid,
                connect : 'delete'                
            }
        });
        
        if (!(pub_regexp.exec(host.host) && freebaseapps_host)) {
            if (pub_regexp.exec(host.host)) { freebaseapps_host = true; }
            
            add_write.push({
                id : versionid,
                key : {
                    value : val,
                    namespace : hostid,
                    connect : 'insert'                
                }
            });
        }
    }    
    
    // now let's do some damaage...
    // delete all hosts
    if (delete_write.length) {
        // Don't sign so that the write user (appeditoruser)
        // credentials are used instead of the user's
        FB.mqlwrite(delete_write, null, {"http_sign" : false});
    }
    
    // delete old release key
    if (app.release || app.release_key_exists) {
        q = {
            key : {
                value : 'release',
                namespace : appid,
                connect : 'delete'
            }
        };
        if (app.release) { q.id = appid + '/' + app.release; }
        else { q.guid = app.release_key_exists; }
        FB.mqlwrite(q);
    }
    
    // add hosts to new version
    if (add_write.length) {
        // Don't sign so that the write user (appeditoruser)
        // credentials are used instead of the user's
        FB.mqlwrite(add_write, null, {"http_sign" : false});
    }
    
    // add release key to new version
    if (version && version !== 'current') {
        FB.mqlwrite({
            id : appid + '/' + version,
            key : {
                value : 'release',
                namespace : appid,
                connect : 'insert'
            }
        });        
    }
        
    return version_lib.get_versions(appid);
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid','version']);
        service.check_user();
        
        return set_release(args.appid, args.version);
    }, this);
}
