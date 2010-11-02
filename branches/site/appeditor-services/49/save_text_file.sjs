var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');


function save_file_text(fileid, props) {
    var r = service.parse_path(fileid, {file:true});
    var content_type = props.content_type || 'text/plain';
    
    var args = {
        document : r.id
    };
    
    function _set_handler() {
        FB.mqlwrite({
            id : r.id,
            '/freebase/apps/acre_doc/handler' : {
                handler_key: props.acre_handler,
                connect: 'update'
            }
        });
    }
    
    // shortcut... if revision present, assume file already exists
    if (props.revision) { 
        args.content = props.revision;
        
        if (props.acre_handler) {
            _set_handler();
        }
    } else {
        // check whether file exists and create it if it doesn't
        var file = FB.mqlread(FB.extend_query({guid:null}, service.decompose_id(r.id))).result;
        if (!file) {
            var segs = r.id.split('/');
            var name = FB.mqlkey_unquote(segs.pop());
            var appid = segs.join('/');
            acre.require('create_app_file').create_file(r.appid, name, props.acre_handler, props.based_on);
        } else {
            if (props.acre_handler) {
                _set_handler();
            }
        }
    }
    
    if (props.text && props.text.length) {
        try {
            var upload = FB.upload(props.text, content_type, args).result;         
        } catch(e) {
            var error = service.parse_freebase_error(e);
            
            if (error && error.messages[0].code === "/api/status/error/upload/content_mismatch") {
                var old_file = acre.require("get_file_revision").get_file_revision(r.id, error.messages[0].info.existing_content);
                
                var lib_p       = acre.require("lib_diff_match_patch");
                var lib_patch   = new lib_p.diff_match_patch;
                var diff = lib_patch.diff_lines(old_file.text, props.text);
                
                throw new service.ServiceError("400 Bad Request", "/api/status/error/upload/content_mismatch", {
                     message : "Saved version of this file has changed since it was loaded.", 
                     code    : "/api/status/error/upload/content_mismatch",
                     info    : {
                         diff: diff
                     }
                    });
            } else {
                throw e;
            }
        }
    }
    
    if (props.name) {
        acre.require("rename_file").rename_file(fileid, props.name);
    }
    
    var result = {
        fileid       : r.id
    };
    
    if (upload) {
        result.revision = upload.id;
        result.content_type = upload['/type/content/media_type'];
    };
    
    return result;
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['fileid']);
        service.check_user();
        
        var fileid = args.fileid;
        delete args.fileid;

        return save_file_text(fileid, args);
    }, this);
}
