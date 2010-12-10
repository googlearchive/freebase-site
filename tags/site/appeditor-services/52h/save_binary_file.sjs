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
