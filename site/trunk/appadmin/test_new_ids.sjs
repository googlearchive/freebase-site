acre.require('/test/lib', 'release').enable(this);
var lib = acre.require('/freebase/apps/appeditor/lib_appeditor_service');

function EmptyResult(obj) { 
    
    this.r = { 
        'appid' : null,
        'filename': null,
        'path_info' : null,
        'querystring' : null,
        'service_url' : acre.freebase.service_url
    };

    for (var i in obj) { this.r[i] = obj[i]; }
    
    return this;
}

var _ROOT = "/freebase/apps/hosts/";
var _ROOT_HOST = _ROOT + acre.host.name.split('.').reverse().join('/') + '/';

var spec =  [
    {
        'name' : 'freebase app id',
        'id' : '/freebase/site/sample',
        'expected' : new EmptyResult({'appid' : '/freebase/site/sample'})
    },
    {
        'name' : 'file',
        'id' : 'foo',
        'expected' : new EmptyResult({'filename' : 'foo'}),
        'kind' : 'file'
    },
    {
        'name' : 'cross app published',
        'id' : '//services/lib',
        'expected' : new EmptyResult({'appid' : _ROOT_HOST + 'services', 'filename' : 'lib', 'path_info' : '/'})
    },
    {
        'name' : 'cross app development',
        'id' : '//services.libs.freebase.dev/lib',
        'expected' : new EmptyResult({'appid' : '/freebase/libs/services', 'filename' : 'lib', 'path_info' : '/'})
    },
    {
        'name' : 'cross app versioned development',
        'id' : '//2.services.libs.freebase.dev/lib',
        'expected' : new EmptyResult({'appid' : '/freebase/libs/services/2', 'filename' : 'lib', 'path_info' : '/'})
    },
    {
        'name' : 'cross app published with alternative domain',
        'id' : '//tippify.com./lib',
        'expected' : new EmptyResult({'appid' : _ROOT + 'com/tippify', 'filename' : 'lib', 'path_info' : '/'})
    },

    {
        'name' : 'cross app cross graph published',
        'id' : '//services.sandbox-freebaseapps.com./lib',
        'expected' : new EmptyResult({'appid' : _ROOT + 'com/sandbox-freebaseapps/services', 'filename' : 'lib', 'service_url' : 'http://www.sandbox-freebase.com'})
    },

    {
        'name' : 'cross app cross graph development',
        'id' : '//r2-4-3.my_first_app.dfhuynh.user.dev.branch.qa-freebaseapps.com./lib',
        'expected' : new EmptyResult({'appid' : '/user/dfhuynh/my_first_app/r2-4-3', 'filename' : 'lib', 'service_url' : 'http://branch.qa.metaweb.com'})
    },


];



test("decompose_path check", function() {
    // Basic url fetch should call the callback

    for (var i in spec) { 

        var failed = false;
        var current = spec[i];
        var result = lib.decompose_path(current['id'], current['kind'] || null);

        if (!result) { 
            ok(false, 'id ' + current['id'] + ' no result');
            continue;
        }

        for (var j in current['expected']['r']) { 
            var expected = current['expected']['r'][j];
            if (expected && (! (j in result) || result[j] != expected)) { 
                failed = true;
                ok(false, 'id: ' + current['id'] + ' key: '+ j + ' expected: ' + expected + ' actual: ' + result[j]);
                break;
            }
        }

        if (!failed) { 
            ok(true, current['id']);
        }
    }

});

acre.test.report();
