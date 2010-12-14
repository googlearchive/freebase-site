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

function move_app(appid, to_appid) {
    appid = service.parse_path(appid).appid;
    to_appid = service.parse_path(to_appid).appid;
    
    var appid_segs = appid.split('/');
    var app_key = appid_segs.pop();
    var app_root = appid_segs.join('/');
    
    var to_appid_segs = to_appid.split('/');
    var to_app_key = to_appid_segs.pop();
    var to_app_root = to_appid_segs.join('/');
    if (!(/^[a-z][\-0-9a-z]{0,20}$/).test(to_app_key)) {
        throw "Invalid app key (only lowercase alpha, numbers, and - allowed)";
    }
    
    var app = FB.mqlread({id: appid, guid: null}).result;
    if (!app) { 
        throw new service.ServiceError("400 Bad Request", null, {
            message : "App " + appid + " does not exist",
            code    : "/api/status/error/input/validation",
            info    : appid
        });
    }
    
    var app_guid = app.guid;
    
    var result = FB.mqlwrite({
            guid : app_guid,
            type : '/freebase/apps/acre_app',
            'add:key' : {
                connect : 'insert',
                namespace : to_app_root,
                value : to_app_key
            },
            'remove:key' : {
                connect : 'delete',
                namespace : app_root,
                value : app_key
            }
    })
    
    return {
        appid : to_appid
    };
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid','to_appid']);
        user = service.check_user();
            
        return move_app(args.appid, args.to_appid);
    }, this);
}
