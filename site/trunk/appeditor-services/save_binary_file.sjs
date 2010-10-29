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

function save_file_binary(id, form_request, props) {
    var fileid, filepath;
    
    try {
        var file = acre.require("get_file").get_file(id);
        fileid = file.fileid;
        filepath = file.path;
        
        if (file.acre_handler !== "binary") {
            FB.mqlwrite({
                id : fileid,
                '/freebase/apps/acre_doc/handler' : {
                    handler_key: "binary",
                    connect: 'update'
                }
            });
        }

        if (props.name) {
            acre.require("rename_file").rename_file(fileid, props.name);
        }
        
    } catch (e) {
        var res = service.parse_path(id, {"file" : true});
        fileid = res.id;
        filepath = res.path;
        var name = props.name || FB.mqlkey_unquote(res.filename);
        acre.require('create_app_file').create_file(res.appid, name, "binary", props.based_on);
    }
    
    var args = {
        document : fileid,
        license : '/common/license/cc_attribution_30'   // all images must be set to CC-BY to render at original size
    };
    
    if (props.revision) { 
        args.content = props.revision;
    }

    var url = acre.form.build_url(FB.service_url + "/api/service/form_upload_image", args);
    var headers = {
        'content-type' : form_request.headers['content-type']
    };
    
    try {
        var ret = service.handle_freebase_response(acre.urlfetch(url, "POST", headers, form_request.body, true)).result;
    } catch(e) {
        var error = service.parse_freebase_error(e);
        
        if (error && error.messages[0].code === "/api/status/error/file_format/unsupported_mime_type") {
            throw new service.ServiceError("400 Bad Request", "/api/status/error/file_format/unsupported_mime_type", {
                 message : "Unsupported content type - " + error.messages[0].info.mime_type + " - could not be saved.",
                 code    : "/api/status/error/file_format/unsupported_mime_type",
                 info    : error.messages[0].info.mime_type
                });
        } else {
            throw e;
        }
    }
    
    var result = {
        path         : filepath,
        fileid       : fileid,
        revision     : ret.id,
        content_type : ret['/type/content/media_type']
    };
    
    return result;
}


if (acre.current_script == acre.request.script) {
    service.FormService(function() {
        var args = service.parse_request_args(['fileid']);
        service.check_user();
        
        var fileid = args.fileid;
        delete args.fileid;

        return save_file_binary(fileid, acre.request, args);
    }, this);
}
