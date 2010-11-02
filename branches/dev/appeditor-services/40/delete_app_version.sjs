var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');


function delete_app_version(appid, key) {
    appid = service.parse_path(appid).appid;
    var id = appid + '/' + key;
    
    var q = {
        id: id,
        type: '/freebase/apps/acre_app_version',
        acre_app : {
            id          : appid,
            connect     : 'delete'
        },
        key: {
            namespace   : appid,
            value       : key,
            connect     : 'delete'
        }
    };
    
    FB.mqlwrite(q, {use_permission_of: appid});
    
    return acre.require('lib_app_versions').get_versions(appid);
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid','version']);
        service.check_user();
            
        return delete_app_version(args.appid, args.version);         
    }, this);
}
