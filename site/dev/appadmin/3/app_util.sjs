var ae = { 
    'get_app' : function(app_id) { 
        if (app_id.indexOf('/trunk') == app_id.length - 6) { 
            app_id = app_id.slice(0, app_id.length-6); 
        }
        return acre.require('/freebase/apps/appeditor/get_app').get_app(app_id);
    },
    'get_file' : acre.require('/freebase/apps/appeditor/get_file').get_file
};

var MF = acre.require('MANIFEST').MF;
var helpers = acre.require('/freebase/site/core/helpers_date', MF['/freebase/site/core']);


var CURRENT_SERVICE_URL = acre.freebase.service_url;
function revert_service_url() { acre.freebase.set_service_url(CURRENT_SERVICE_URL); }

var ENV = [
    { 
        'service_url' : 'http://www.freebase.com',
        'name' : 'Production',
        'id' : 'production',
        'acre' : 'dev.freebaseapps.com'
    },
    { 
        'service_url' : 'http://www.sandbox-freebase.com',
        'name' : 'Sandbox',
        'id' : 'sandbox',
        'acre' : 'dev.sandbox-freebaseapps.com'
    }
];


if (acre.request.server_name.indexOf('acrenet.metaweb.com') || acre.request.server_name.indexOf('acre.z')){
    ENV.push({ 
        'service_url' : 'http://branch.qa.metaweb.com',
        'name' : 'QA',
        'id' : 'qa',
        'acre' : 'branch.qa-freebaseapps.com'
    });
}    

var get_env = function(env_id) { 

    for (var i in ENV) { 
        if (ENV[i]['id'] == env_id) { 
            return ENV[i];
        }
    }

    return null;
}

var get_version_timeline = function(apps) { 

    var versions = { 'trunk' : {} };
    var n_versions = 5;

    now = new Date();

    for (var i in ENV) { 

        en = ENV[i];
        if (!apps[en['id']]) { 
            continue;
        }

        var app = apps[en['id']];
        versions['trunk'][en['id']] = { 'class' : [], 'date' : now };

        if (app['versions']) { 
            for (var i in app['versions']) { 
                var ver = app['versions'][i];
                if (! versions[ver['name']]) { 
                    versions[ver['name']] = {}
                }
                dd = acre.freebase.date_from_iso(ver['as_of_time']);
                versions[ver['name']][en['id']] = {'class' : [], 'date' : dd };

            }
        }
    }
    

    var versions_list = [];
    for (var version_name in versions) { 
        var version = versions[version_name];
        
        //mark the release version - it should be in apps['production']['release'] (or whatever env)
        for (var env in version) { 

            if (apps[env]['release'] == version_name) { 
                version[env]['class'].push('release');
            }

            if (apps.reference_env == env && apps.reference_version == version_name) { 
                version[env]['class'].push('reference');
            } else{
                version[env]['class'].push('diff');
            }

            version[env]['class'] = version[env]['class'].join(' ');
        }

        version['version'] = version_name;
        
        versions_list.push(version);
    }

    versions_list.sort(function(a,b) { 
        for (var i in ENV) { 
            var en = ENV[i];
            if (a[en['id']] && b[en['id']]) { 
                return b[en['id']]['date'] - a[en['id']]['date'];
            }
        }
        return 0;
    });
    versions_list = versions_list.slice(0, n_versions);

    return versions_list;
    
};


var construct_id = function(env, id, version) { 

    //return env + ':' + id + (version != 'trunk' ? ':' + version : '');    
    return env + ':' + id + ':' + version;

};

var deconstruct_id = function(id) { 

    var d = { 'env' : null, 'id' : id, 'version' : 'trunk', 'versionid' : id };

    parts = id.split(':');
    if (parts.length > 1) { 
        d['env'] = parts[0];
        d['versionid'] = d['id'] = parts[1];
    } 

    if (parts.length > 2) { 
        d['version'] = parts[2];
        d['versionid'] += '/' + d['version'];
    }

    return d;
};

var get_app = function(id) { 

    var result = {};
    var required_env = null;

    var context = deconstruct_id(id);
    var available_environments = [];

    for (var i in ENV) { 
        var en = ENV[i];

        if (context.env && context.env != en['id']) {
            continue;
        }
        acre.freebase.set_service_url(en['service_url']);
        try {
            result[en['id']] = ae.get_app(context.versionid);
            available_environments.push(en['id']);
            
            result[en['id']]['relative_date'] = helpers.relative_date(acre.freebase.date_from_iso(result[en['id']]['creation_time']));
                

        } catch(e) { 
            result[en['id']] = null;
            continue;
        }
        //if the release is not set, set it to 'trunk'
        if (!result[en['id']]['release']) { 
            result[en['id']]['release'] = 'trunk';
        }
    }

    revert_service_url();

    if (available_environments.length) { 
        result.reference_env = context.env || available_environments[0];
        result.reference_version = result[result.reference_env]['release'];
    } else { 
        result.error = true;
    }

    return result

};

var get_manifest_diff = function(app1, app2) {

    var diff = { 'add' : [], 'remove' : [], 'changed' : [] };

    



    return diff;


};


var get_file_diff = function(app1, app2) { 

    var diff = { 'add' : [], 'remove' : [], 'changed' : [] };

    return diff
};



var get_app_diff = function(id1, id2) {

    var result = get_app(id1);
    var app1 = result[result.reference_env || 'production'];

    var result = get_app(id2);
    var app2 = result[result.reference_env || 'production'];

    app1['manifest'] = get_manifest_contents(id1, app1);
    app2['manifest'] = get_manifest_contents(id2, app2);

    var diff = { 
        'file' : get_file_diff(app1, app2), 
        'manifest' : get_manifest_diff(app1, app2), 
        'app1' : app1, 
        'app2' : app2 
    };

    return diff;

};

var url = function(context, path) { 

    var env = get_env(context.env);
    var id = context.id;
    if (context.version && context.version != 'trunk') { 
        id += "/" + context.version
    }
    var parts = id.split('/').reverse();    

    var u = parts.join('.') + env.acre;
    if (path) { 
        u += path;
    }

    return "http://" + u;

};

var get_manifest_contents = function(id) {

    console.log('manifest');
    var manifest = null;
    var context = deconstruct_id(id);
    var manifest_url = url(context, '/MANIFEST');
    var env = get_env(context.env);
    acre.freebase.set_service_url(env['service_url']);    
    try { 
    manifest = JSON.parse(acre.urlfetch(manifest_url).body).result;
    } catch(e) { 
        manifest = {'error' : 'no manifest found' };
    }
    return manifest;

};
