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

function validate_filename(name) {
    if (!/^[\-_0-9A-Za-z\.]+$/.test(name)) { 
        throw "File names can only contain alphanumeric characters, ., - and _";
    }
    
    if (!/^[A-Za-z]/.test(name)) { 
        throw "File names must be begin with a letter";
    }

    if (!/[0-9A-Za-z]$/.test(name)) { 
        throw "File names cannot end with a special character";
    }

    var RESERVED_KEYS = {'acre':true, 'status':'', 'api':true};
    if (name in RESERVED_KEYS) { 
        throw  "'acre', 'api', and 'status' are reserved file names"; 
    }
}

function rename_file(fileid, name) {
    validate_filename(name);
    var file = acre.require("get_file").get_file(fileid);
    var file_key = FB.mqlkey_quote(file.name);
    
    // no-op
    if (FB.mqlkey_quote(name) === file_key) { return; }
    
    FB.mqlwrite({
        guid : file.guid,
        type : '/freebase/apps/acre_doc',
        name : {
            value : name,
            lang : '/lang/en',
            connect : 'update'
        },
        key : {
            connect : 'insert',
            namespace : file.app.appid,
            value : FB.mqlkey_quote(name),
        }
    });
    
    FB.mqlwrite({
        guid : file.guid,
        type : '/freebase/apps/acre_doc',
        key : {
            connect : 'delete',
            namespace : file.app.appid,
            value : file_key
        }
    });
    
    return {
        fileid : file.fileid,
        name : name
    };
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['fileid','name']);
        service.check_user();
            
        return rename_file(args.fileid, args.name);
    }, this);
}
