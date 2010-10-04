var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');


function create_file(appid, name, handler, based_on) {
    appid = service.parse_path(appid).appid;
    var handler_key = handler || 'mjt';
    var key = FB.mqlkey_quote(name);

    var w = {
        create : 'unless_exists',
        id     : null,
        guid   : null,
        name   : name,
        key    : {
            value: key,
            namespace: appid
        },
        type    : [
            {
                id: '/freebase/apps/acre_doc',
                connect: 'insert'
            },
            {
                id: '/common/document',
                connect: 'insert'
            }
        ],
        '/freebase/apps/acre_doc/handler' : {
            handler_key: handler_key,
            connect: 'update'
        }
    };

    // link to original if based on another document
    if (based_on) { 
        w['/freebase/apps/acre_doc/based_on'] = { 
            id: based_on,
            connect: 'insert'
        };
    }

    FB.mqlwrite(w, {use_permission_of: appid}).result;
    
    var app = acre.require('get_app').get_app(appid, false);
    return {
        appid : appid,
        files : app.files
    }
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid', 'name']);
        service.check_user();
        
        return create_file(args.appid, args.name, args.acre_handler, args.based_on);
    }, this);
}
