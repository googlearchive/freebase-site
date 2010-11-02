var mf = acre.require('MANIFEST').mf;
var helpers = mf.require('core', 'helpers_date');

var ae = { 
    'get_app' : function(app_id) { 
        if (app_id.indexOf('/trunk') == app_id.length - 6) { 
            app_id = app_id.slice(0, app_id.length-6); 
        }
	try { 
            return mf.require('appeditor', 'get_app').get_app(app_id);
	} catch(e) { return null; }
    },
    'get_file' : mf.require('appeditor', 'get_file').get_file
};


var CURRENT_SERVICE_URL = acre.freebase.service_url;
function revert_service_url() { acre.freebase.set_service_url(CURRENT_SERVICE_URL); }

var ENV = [
    { 
        'service_url' : 'http://www.freebase.com',
	'service_domain' : 'www.freebase.com',
        'name' : 'Production',
        'id' : 'production',
        'acre' : '.freebaseapps.com.',
	'ae' : 'http://acre.freebase.com',
	'freebaseapps' : 'freebaseapps.com'
    },
    { 
        'service_url' : 'http://www.sandbox-freebase.com',
	'service_domain' : 'www.sandbox-freebase.com',
        'name' : 'Sandbox',
        'id' : 'sandbox',
        'acre' : '.sandbox-freebaseapps.com.',
	'ae' : 'http://acre.sandbox-freebase.com',
	'freebaseapps' : 'sandbox-freebaseapps.com'
    }
];

if (acre.request.server_name == "devel.sandbox-freebase.com") {
    ENV[1]['service_url'] = 'http://' + acre.request.server_name + ':' + acre.request.server_port;
    ENV[1]['service_domain'] = acre.request.server_name;
    //hack to make this app work for me during development
    ENV[1]['freebaseapps'] = "acre.intrepid.sfo:8115";
}

/*
if (acre.request.server_name.match('acrenet.metaweb.com') || acre.request.server_name.match('acre.z')){
    ENV.push({ 
        'service_url' : 'http://branch.qa.metaweb.com',
        'name' : 'QA',
        'id' : 'qa',
        'acre' : 'branch.qa-freebaseapps.com'
    });
} 
*/   

var get_env = function(env_id) { 

    for (var i in ENV) { 
        if (ENV[i]['id'] == env_id) { 
            return ENV[i];
        }
    }

    return null;
};

/*

Given an app meta-data dictionary, returns a dictionary that containts the trunk, latest and release versions
input:
app(dict): app meta-data
output:
{ 'latest' : {...},
  'release' : { 
   'name' : <version_name> e.g. 11
   'id' : <app_id>  e.g. //11.homepage.site.freebase.dev
   'time' : <human readable time diff> e.g. 7 hours ago
   'release' : <release> e.g. true
   },
   'trunk' : {...}
   
   }
*/

var app_versions_to_release = function(app) { 

    var now = new Date();

    var versions= { 
	'trunk' : null,
	'latest' : null,
	'release' : null
    };

    //trunk (current) is always a valid version
    var trunk =  {  
	'name' : 'trunk',
	'id' : app.path,
	'date' : now
    };

    versions.trunk = trunk;
    

    //if there are no more versions of this app, return
    if (!app.versions || app.versions.length == 0) { 
	versions.latest = trunk;
	versions.release = trunk;
	return versions;
    }

    //go through each version and create an entry in the versions array
    for (var i in app.versions) { 
	
	var version = app.versions[i];
	
	if (i == 0) { 
	    versions.latest = { 
		'name' : version.name,
		'id' : '//' + version.name + '.' + app.path.slice(2),
		'date' : acre.freebase.date_from_iso(version.as_of_time)
	    };
	}
	
	if (!app.release || !(version.name == app.release) ) {
	    continue;
	}

	versions.release = {
	    'name' : version.name,
	    'id' : '//' + version.name + '.' + app.path.slice(2),
	    'date' : acre.freebase.date_from_iso(version.as_of_time)
	};
	
	break;
    }	

    if (!versions.release) { 
	versions.release = versions.trunk;
    }

    console.log(versions);
    return versions;

};

/*
Given an app id, gets the app meta-data for each environment.
input:
id(string): app id
output:
{ '<env_id>' : app-meta-data(dict) }
*/

var get_app2 = function(id) { 

    var result = {};

    for (var i in ENV) { 
	var en = ENV[i];
	result[en['id']] = ae.get_app(id + en['acre']);
    }

    return result;
};

/*
converts an app id to something that can be used as an html id
strips slashes  and . 
input: 
id(string): app id
output:
id(string): escaped id

*/

var html_id = function(id) { 
    return id.replace(/[\/\.]/g, '');
}

var get_manifest_diff = function(app1, app2) {

    var diff = { 'add' : [], 'remove' : [], 'changed' : [] };

    var m1 = app1['manifest'] ? app1['manifest']['version'] : {};
    var m2 = app2['manifest'] ? app2['manifest']['version'] : {};

    for (var appid in m1) { 
        if (!(appid in m2)) { 
            diff['remove'].push({'appid' : appid}); 
            continue;
        }

        if (m2[appid] != m1[appid]) { 
            diff['changed'].push({'appid' : appid, 'version' : m2[appid]});
        }
        
    }
    for (var appid in m2) { 
        if (!(appid in m1)) { diff['add'].push({'appid' : appid, 'version' : m2[appid]}); }
    }
    
    return diff;

};


var url = function(context, path) { 

    var env = get_env(context.env);
    var id = context.id;
    if (context.version && context.version != 'trunk') { 
        id += "/" + context.version;
    }
    var parts = id.split('/').reverse();    

    var u = parts.join('.') + env.acre;
    if (path) { 
        u += path;
    }

    return "http://" + u;

};

