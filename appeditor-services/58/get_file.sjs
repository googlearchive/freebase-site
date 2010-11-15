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
var app_lib = acre.require('get_app');

function get_file(fileid, timestamp) {
    if (!fileid) { return null; }
    var resource = service.parse_path(fileid, {"file" : true});
    
    // it's remote... go get it
    if (resource.service_url !== FB.service_url) {
      var args = {
        fileid : fileid,
        timestamp : timestamp
      };
      var url = acre.form.build_url(resource.appeditor_service_base + "get_file", args);
      return FB.fetch(url).result;
    }
    
    var file;
    var app = app_lib.get_app(resource.appid, true, timestamp);
    file = app.files[resource.filename];

    if (!file) {
        throw new service.ServiceError("400 Bad Request", null, {
            message : "File: " + fileid + " doesn\'t exist or is not a file",
            code    : "/api/status/error/input/validation",
            info    : fileid
        });
    }
    
    if (file.revision) {
        var content = acre.require('get_file_revision').get_file_revision(fileid, file.revision);
        if (content.text) { file.text = content.text; }
        else if (content.binary) { file.binary = content.binary; }
    }

    file.app = {
      appid : app.appid,
      version : app.version,
      service_url : acre.freebase.service_url
    };

    return file;
}


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        var args = service.parse_request_args(['fileid']);
            
        return get_file(args.fileid, args.timestamp);
    }, this);
}
