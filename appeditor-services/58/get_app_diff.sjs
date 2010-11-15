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
var lib_app     = acre.require('get_app');


function diff_apps(appid1, appid2, timestamp1, timestamp2) {
    // normalize the timestamps
    var t1 = timestamp1 ? acre.freebase.date_from_iso(timestamp1) : new Date();
    var t2 = timestamp2 ? acre.freebase.date_from_iso(timestamp2) : new Date();
    timestamp1 = mjt.freebase.date_to_iso(t1);
    timestamp2 = mjt.freebase.date_to_iso(t2);

    var app1 = lib_app.get_app(appid1, true, timestamp1);
    var app2 = lib_app.get_app(appid2, true, timestamp2);    
    
    var ret = {
        app1 : {
            appid : appid1,
            timestamp: timestamp1
        },
        app2 : {
            appid : appid2,
            timestamp: timestamp2
        },
        files : {}
    };
    
    var new_guids = [];
    var guid_map = {};
    
    for (var fn in app1.files) {
        var file1 = app1.files[fn];
        var file2 = app2.files[fn];
        if (file2) {
            if ((file1.revision !== file2.revision) || (file1.acre_handler !== file2.acre_handler)) {
                ret.files[fn] = {
                    file1 : file1,
                    file2 : file2
                };
            }
        } else {
            new_guids.push(file1.guid);
            guid_map[file1.guid] = fn;
            ret.files[fn] = {
                file1 : file1,
                file2 : null,
            };
        }
    }
    
    for (var fn in app2.files) {
        var file1 = app1.files[fn];
        var file2 = app2.files[fn];
        if (!file1) {
            if (new_guids.indexOf(file2.guid) == -1) {
                ret.files[fn] = {
                    file1 : null,
                    file2 : file2
                };
            } else {
                ret.files[guid_map[file2.guid]].file2 = file2;
            }   
        }
    }
    
    return ret;
};


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args(['appid1', 'appid2']);
            
        return diff_apps(args.appid1, args.appid2, args.timestamp1, args.timestamp2);
    }, this);
}