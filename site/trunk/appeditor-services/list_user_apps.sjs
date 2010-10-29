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


function list_user_apps(userid, include_filenames) {
    
    var q = {
        "type" : "/freebase/apps/acre_app",
        "limit" : 250,
        "id" : null,
        "name" : null,
        "creator" : {
            'id' : null,
            'name' : null
        },
        "sort" : "name",
        "c:/type/namespace/keys" : {
            "namespace" : {
                "type" : "/freebase/apps/acre_doc"
            },
            "return" : "count",
            "optional" : true
        },
        "forbid:permission" : {
          "id" : "/boot/all_permission",
          "optional" : "forbidden"
        },
        "permission" : {
            "permits"  : {
                "limit" : 1,
                "member" : {
                    "id" : userid
                }
            }
        }
    };
    
    if (include_filenames) { 
        q["/type/namespace/keys"] = [{
            "sort" : "value",
            "optional" : true,
            "value" : null,
            "namespace" : {
                "type" : "/freebase/apps/acre_doc",
            }
        }];
    }
    
    var apps = [];
    var result = FB.mqlread([q]).result;    

    for each(var a in result) {
        var r = service.parse_path(a.id);
        var app = {};
        app.path = r.path;
        app.appid = r.appid;
        app.name = a.name;
        app.creator = a.creator;
        if (include_filenames) {
            app.files = [];
            for each (var f in a["/type/namespace/keys"]) {
                app.files.push(FB.mqlkey_unquote(f.value));
            }
        } else {
            app.files = a["c:/type/namespace/keys"];
        }
        apps.push(app);
    }
    
    return apps;
}


if (acre.current_script == acre.request.script) {    
    service.GetService(function() {
        var args = service.parse_request_args();
        user = service.check_user();
        FB.touch();
        
        return list_user_apps(user.id, args.include_filenames);
    }, this);
}
