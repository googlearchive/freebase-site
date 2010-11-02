var FB = acre.freebase;
var service = acre.require('lib_appeditor_service');

function get_versions(appid) {
    
    function process_hosts(obj, version) {

        function _parse_host(obj, host) {
            if (obj.namespace.key) {
                return obj.value + '.' + _parse_host(obj.namespace.key, host);
            } else {
                return obj.value;
            }
        }

        for each (var host in obj['three:key']) {
            result.hosts.push({
                host : _parse_host(host),
                version : version
            })
        }

        for each (var host in obj['two:key']) {
            result.hosts.push({
                host : _parse_host(host),
                version : version
            })
        }
    }
    
    var q = acre.require('query_app_versions').query;
    var links = FB.mqlread(FB.extend_query(q, {id: appid})).result;
    
    if (links == null) { 
        throw "appid does not exist";
    }

    var result = {
        appid : appid,
        listed : links["/freebase/apps/application/listed"],
        release : null,
        hosts : [],
        versions : []
    };
    
    process_hosts(links, 'current');

    for each (var v in links["/type/namespace/keys"]) {
        var version = {
            name       : v.value,
            as_of_time : v.namespace.as_of_time,
            service_url : v.namespace.service_url
        };

        process_hosts(v.namespace, v.value);
        result.versions.push(version);
    }
    
    result.versions.sort(function(a,b) {
        var a_is_num = /\d+/.test(a.name);
        var b_is_num = /\d+/.test(b.name);
        
        if (a_is_num && b_is_num) {
            return parseInt(b.name) - parseInt(a.name);
        } else if (a_is_num) {
            return 1;
        } else if (b_is_num) {
            return -1;
        } else {
            return a.name > b.name;
        }
    });
    
    if (links['release:/type/namespace/keys']) {
        result.release = links['release:/type/namespace/keys'].namespace.key.value;
    }
    
    // HACK - need to know whether the release key exists, 
    // even if not correctly associated with a version
    if (links['release_key:/type/namespace/keys'] && !result.release) {
        result.release_key_exists = links['release_key:/type/namespace/keys'].namespace.guid;
    }
    
    return result;
}

