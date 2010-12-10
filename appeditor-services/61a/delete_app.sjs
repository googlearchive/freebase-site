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
var user;


function delete_app_files(app, files) {
    
    if (!files) {
        files = [];
        for each (var file in app.files) {
            files.push(file.name);
        }
    }

    if (files.length > 0) {
        var q = [];
        for each (var file in files) {
            q.push({
                id: app.appid + '/' + FB.mqlkey_quote(file),
                type: {
                  id: '/freebase/apps/acre_doc',
                  connect: 'delete'
                },
                key: {
                    connect: 'delete',
                    namespace: app.appid,
                    value: FB.mqlkey_quote(file)
                }
            });
        }
        FB.mqlwrite(q);
    }

    return {
        appid : app.appid,
        deleted_files : files
    }
}


function delete_app(appid) {
    var app = acre.require('get_app').get_app(appid);
    appid = app.appid;
    var appid_segs = appid.split('/');
    var app_key = appid_segs.pop();
    var app_root = appid_segs.join('/');
    
    
    // delete published hosts
    if (app.hosts.length) {
        var undeleted_hosts = acre.require("set_app_host").delete_all_hosts(appid, app.hosts);
        if (undeleted_hosts.length) {
            throw ("/service/delete_app/undeletable_hosts", 
                "Cannot delete this app as it is released to non-standard hosts.  Please remove them manually first.", 
                undeleted_hosts,
                "400 Bad Request");
        }
    }
    
    // disconnect the files
    delete_app_files(app);

    // disconnect the app
    var delete_q = {
        id : app.appid,
        key : {
          value : app_key,
          namespace : app_root,
          connect : 'delete'
        },
        type: [
            {id: '/common/topic',
            connect: 'delete'},
            {id: '/type/domain',
            connect: 'delete'},
            {id: '/freebase/apps/acre_app',
            connect: 'delete'},
            {id: '/freebase/apps/application',
            connect: 'delete'}
        ]
    };
    var res = FB.mqlwrite(delete_q);
    
    return acre.require('list_user_apps').list_user_apps(user.id);
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid']);
        user = service.check_user();
            
        return delete_app(args.appid);
    }, this);
}
