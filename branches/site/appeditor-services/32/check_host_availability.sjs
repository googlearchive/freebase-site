var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

var hostpath = '/freebase/apps/hosts/com/freebaseapps';
var user = null;


function check_host_availability(path) {
    var check_query = {
        'a:id': path,
        id: null,
        name: null,
        "forbid:permission" : {
            id : "/boot/all_permission",
            optional : "forbidden"
        },
        permission : {
            permits : {
                member : {
                    id : user.id
                }
            },
            optional: true
        }
    };
    var check = FB.mqlread(check_query).result;
  
    if (!check) { return true; }
    if (check) {
        if (check.permission) { return {id:check.id, name:check.name}; }
        else { return false; }
    }
}


function validate_host(host) {
    // validate host arg
    if (!(/^[a-z][-0-9a-z]+$/).test(host)) { throw "Host must be alphanumeric and not start with a number"; }

    // user neeeds to be authenticated
    user = service.check_user();

    // if a short hostname is requested
    // check that the user is in metaweb staff
    if (host.length < 5 && !user.is_staff) {
      throw "Host must be at least 5 characters";
    }
  
    // check whether the ID is available... or the user already "owns" it
    var check_host = check_host_availability(hostpath + '/' + host, user.id);
    if (!check_host) { throw "Already in use"; }
    
    var result = {};
    if (typeof check_host === 'object') {
        result = check_host;
        result.message = "Already in use by " + check_host.name + ".  Switch to this app?";
    } else {
        result.message = "Available"; 
    }
    
    return result;
}


if (acre.current_script == acre.request.script) {    
    service.GetService(function() {
        var args = service.parse_request_args(['host']);        
        return validate_host(args.host);
    }, this);
}
