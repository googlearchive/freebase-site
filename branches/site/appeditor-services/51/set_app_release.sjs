var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

var hostpath = '/freebase/apps/hosts';
var default_hostpath = '/freebase/apps/hosts/com/freebaseapps';
var user = null;


function set_release(appid, version) {
    appid = service.parse_path(appid).appid;
    
    // Lets make absolutely sure we're working off the latest state of the graph
    FB.touch();
    
    var versionid = (version !== 'current') ? appid + '/' + version : appid;
    var version_lib = acre.require('lib_app_versions');
    var app = version_lib.get_versions(appid);
    
    var delete_write = [];
    var add_write = [];
    
    // ugly stuff we have to keep around to deal with past bugs
    // that allowed claiming multiple freebaseapps hosts per app
    var pub_regexp = /([^.]*)\.freebaseapps\.com$/;
    var freebaseapps_host = false;
    
    for each (var host in app.hosts) {
        var ar = host.host.split('.');
        var hostid = hostpath + '/' + ar.splice(1, ar.length).reverse().join('/');
        var val = host.host.split('.')[0];

        var old_versionid = (host.version !== 'current') ? appid + '/' + host.version : appid;        
        delete_write.push({
            id : old_versionid,
            key : {
                value : val,
                namespace : hostid,
                connect : 'delete'                
            }
        });
        
        if (!(pub_regexp.exec(host.host) && freebaseapps_host)) {
            if (pub_regexp.exec(host.host)) { freebaseapps_host = true; }
            
            add_write.push({
                id : versionid,
                key : {
                    value : val,
                    namespace : hostid,
                    connect : 'insert'                
                }
            });
        }
    }    
    
    // now let's do some damaage...
    // delete all hosts
    if (delete_write.length) {
        // Don't sign so that the write user (appeditoruser)
        // credentials are used instead of the user's
        FB.mqlwrite(delete_write, null, {"http_sign" : false});
    }
    
    // delete old release key
    if (app.release || app.release_key_exists) {
        q = {
            key : {
                value : 'release',
                namespace : appid,
                connect : 'delete'
            }
        };
        if (app.release) { q.id = appid + '/' + app.release; }
        else { q.guid = app.release_key_exists; }
        FB.mqlwrite(q);
    }
    
    // add hosts to new version
    if (add_write.length) {
        // Don't sign so that the write user (appeditoruser)
        // credentials are used instead of the user's
        FB.mqlwrite(add_write, null, {"http_sign" : false});
    }
    
    // add release key to new version
    if (version && version !== 'current') {
        FB.mqlwrite({
            id : appid + '/' + version,
            key : {
                value : 'release',
                namespace : appid,
                connect : 'insert'
            }
        });        
    }
        
    return version_lib.get_versions(appid);
}


if (acre.current_script == acre.request.script) {
    service.PostService(function() {
        var args = service.parse_request_args(['appid','version']);
        service.check_user();
        
        return set_release(args.appid, args.version);
    }, this);
}
