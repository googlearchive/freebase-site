var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

function add_app_author(appid, username) {
    appid = service.parse_path(appid).appid;
    var userid = '/user/' + username;
    
    var q = {
        id : appid,
        '/type/domain/owners' : {
            member: {
                id : userid,
                connect : 'insert'
            }
        }
    };
    FB.mqlwrite(q);
    
    var app = acre.require('get_app').get_app(appid, false);
    return {
        appid : appid,
        authors : app.authors
    };
}

if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid','username']);
        service.check_user();
        
        return add_app_author(args.appid, args.username);        
    }, this);
}
