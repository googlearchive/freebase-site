var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');
var user;

function move_app(appid, to_appid) {
    appid = service.parse_path(appid).appid;
    to_appid = service.parse_path(to_appid).appid;
    
    var appid_segs = appid.split('/');
    var app_key = appid_segs.pop();
    var app_root = appid_segs.join('/');
    
    var to_appid_segs = to_appid.split('/');
    var to_app_key = to_appid_segs.pop();
    var to_app_root = to_appid_segs.join('/');
    if (!(/^[a-z][\-0-9a-z]{0,20}$/).test(to_app_key)) {
        throw "Invalid app key (only lowercase alpha, numbers, and - allowed)";
    }
    
    var app = FB.mqlread({id: appid, guid: null}).result;
    if (!app) { 
        throw new service.ServiceError("400 Bad Request", null, {
            message : "App " + appid + " does not exist",
            code    : "/api/status/error/input/validation",
            info    : appid
        });
    }
    
    var app_guid = app.guid;
    
    var result = FB.mqlwrite({
            guid : app_guid,
            type : '/freebase/apps/acre_app',
            'add:key' : {
                connect : 'insert',
                namespace : to_app_root,
                value : to_app_key
            },
            'remove:key' : {
                connect : 'delete',
                namespace : app_root,
                value : app_key
            }
    })
    
    return {
        appid : to_appid
    };
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid','to_appid']);
        user = service.check_user();
            
        return move_app(args.appid, args.to_appid);
    }, this);
}
