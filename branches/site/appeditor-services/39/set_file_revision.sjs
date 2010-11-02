var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

function set_file_revision(fileid, revision, name, acre_handler) {
    fileid = service.parse_path(fileid, {file:true}).id;
    if (name) {
        acre.require("rename_file").rename_file(fileid, name);
    }
    
    var w = {
        id: fileid,
        '/common/document/content':{
            'id': revision,
            'connect': 'update'
        }
    };
    
    if (acre_handler) {
        w['/freebase/apps/acre_doc/handler'] = {
            handler_key: acre_handler,
            connect: 'update'
        };
    }
    
    FB.mqlwrite(w);
    
    return acre.require('get_file_revision').get_file_revision(fileid, revision);
}

if (acre.current_script == acre.request.script) {    
    service.PostService(function() {
        var args = service.parse_request_args(['fileid', 'revision']);
        service.check_user();
            
        return set_file_revision(args.fileid, args.revision, args.name, args.acre_handler);
    }, this);
}