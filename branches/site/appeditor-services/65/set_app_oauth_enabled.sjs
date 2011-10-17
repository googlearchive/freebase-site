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
var lib_apikeys = acre.require('lib_app_apikeys');


// this is true for any environment
var keyname = 'freebase.com';


function enable_oauth(appid) {
    var appguid = lib_apikeys.get_app_guid(appid);
    
    // 1. make sure app is an application
    FB.mqlwrite({
        guid : appguid,
        type : { 
            id      : '/freebase/apps/application',
            connect : 'insert',
        }
    });
    
    // 2. Enable oauth and get key and secret
    var url = acre.freebase.service_url.replace(/^http:\/\//, 'https://') + '/api/oauth/enable';
    var form = { id: appguid, reset_secret: true};
    var o = FB.fetch(url, { method  : "POST", 
                            content : acre.form.encode(form), 
                            sign    : true });
    
    
    // 3. Add key and secret to keystore
    lib_apikeys.add_key(appguid, keyname, o.key, o.secret);
    
    // 4. Mark app as enabled in the graph
   FB.mqlwrite({
        guid : appguid,
        '/freebase/apps/application/oauth_enabled': {
            connect : 'update', 
            value   : true
        }
    });
    
    return {
        appid : appid,
        oauth_enabled : true
    };
}


function disable_oauth(appid) {
    var appguid = lib_apikeys.get_app_guid(appid);

    // 1. Disable oauth and get key and secret
    var url = acre.freebase.service_url.replace(/http:\/\//, 'https://') + '/api/oauth/disable';
    var form = { id: appguid, reset_secret: true};
    var o = FB.fetch(url, { method  : "POST", 
                            content : acre.form.encode(form), 
                            sign    : true });
    
    // 2.Remove key and secret from keystore
    lib_apikeys.delete_key(appguid, keyname);
    
     // 3. Mark app as disabled in the graph
    FB.mqlwrite({
         guid : appguid,
         '/freebase/apps/application/oauth_enabled': {
             connect : 'update', 
             value   : false
         }
     });
    
    return  {
         appid : appid,
         oauth_enabled : false
     };
}


if (acre.current_script == acre.request.script) {    
    service.PostService(function() {
        var args = service.parse_request_args(['appid']);
        service.check_user();
        
        if (args.enable == 'false' || args.enable == '0') {
            return disable_oauth(args.appid);
        } else {
            return enable_oauth(args.appid);            
        }
    }, this);
}





