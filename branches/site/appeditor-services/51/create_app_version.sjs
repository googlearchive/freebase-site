var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');


function _validate_versionkey (key) {
    // 'current' is a reserved version name
    if (key == 'current')
        throw '"current" is a reserved version name.'
        
    
    // 'release' is a reserved version name
    if (key == 'release')
        throw '"release" is a reserved version name.'

    // XXX - check that it's non-null, uses valid characters
    if (!(/^[\-0-9a-z]{0,20}$/).test(key))
        throw 'Only lowercase alpha, numbers, and - are allowed in version names';
}


function create_app_version(appid, key, timestamp, service_url) {
    appid = service.parse_path(appid).appid;
    _validate_versionkey(key);
    
    var app = FB.mqlread({id:appid, name:null}).result;
    if (!app) {
        throw "appid " + appid + " does not exist";
    }
    
    // Make sure the version exists
    var create_q = {
        create: 'unless_exists',
        guid: null,
        type: '/freebase/apps/acre_app_version',
        acre_app : {
            id          : appid
        },
        key: {
            namespace   : appid,
            value       : key
        }
    };
    
    var version_guid = FB.mqlwrite(create_q, {use_permission_of: appid}).result.guid;
    
    // Get existing properties
    var version = FB.mqlread({
        guid : version_guid,
        type : '/freebase/apps/acre_app_version',
        service_url : null,
        as_of_time : null
    }).result;
    
    // Now update its properties
    var update_q = {
        guid: version_guid,
        type: '/freebase/apps/acre_app_version',
        name: {
            value       : app.name + ", version " + key,
            lang        : '/lang/en',
            connect     : 'update'
        }
    };
    
    if (timestamp || (version.as_of_time === null)) {
        timestamp = timestamp || '__now__';
            
        update_q.as_of_time = {
            value       : timestamp,
            connect     : 'update'
        };
    }
    
    if (typeof service_url !== 'undefined') {   
        if (/^http:/.test(service_url)) {
            update_q.service_url = {
                value   : service_url,
                connect : 'update'
            };
        } else if (version.service_url !== null) {
            update_q.service_url = {
                value   : version.service_url,
                connect : 'delete'
            };
        }
    }
    
    FB.mqlwrite(update_q, {use_permission_of: appid});
    
    return acre.require('lib_app_versions').get_versions(appid);
}


if (acre.current_script == acre.request.script) {    
    service.PostService(function() {
        var args = service.parse_request_args(['appid','version']);
        service.check_user();
        
        return create_app_version(args.appid, args.version, args.timestamp, args.service_url);         
    }, this);
}
