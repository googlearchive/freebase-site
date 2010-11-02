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
