var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var user;

function set_app_writeuser(appid, enable) {
    appid = service.parse_path(appid).appid;
    var mql_action = enable ? 'insert' : 'delete';

    FB.mqlwrite({
        'id' : appid,
        '/freebase/apps/acre_app/write_user' : {
            'id' : user.id,
            'connect' : mql_action
        }
    });
    
    return { 
        appid : appid,
        write_user : (enable ? user.username : null)
    };
}

if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(["appid"]);
        user = service.check_user();
        
        if (args.enable == 'false' || args.enable == '0') {
            return set_app_writeuser(args.appid, false);
        } else {
            return set_app_writeuser(args.appid, true);
        }
    }, this);
}
