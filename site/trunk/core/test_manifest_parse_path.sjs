acre.require('/test/lib', 'release').enable(this);
var mf = acre.require('MANIFEST').MF;

function make_empty_result(obj) { 
    
    var ret = {
      appid       : null,
      filename    : null,
      path_info   : "/",
      querystring : null,
      service_url : acre.freebase.service_url
    };

    for (var i in obj) { ret[i] = obj[i]; }
    
    return ret;
}

var _ROOT = "/freebase/apps/hosts/";
var _ROOT_HOST = _ROOT + acre.host.name.split('.').reverse().join('/') + '/';

var spec =  [
    {
        'name' : 'freebase app id',
        'id' : '/freebase/site/sample',
        'expected' : make_empty_result({'appid' : '/freebase/site/sample'})
    },
    {
        'name' : 'file',
        'id' : 'foo',
        'expected' : make_empty_result({'filename' : 'foo'}),
        'options' : { 'file' : true }
    },
    {
        'name' : 'cross app published',
        'id' : '//services/lib',
        'expected' : make_empty_result({'appid' : _ROOT_HOST + 'services', 'filename' : 'lib', 'path_info' : '/'})
    },
    {
        'name' : 'cross app development',
        'id' : '//services.libs.freebase.dev/lib',
        'expected' : make_empty_result({'appid' : '/freebase/libs/services', 'filename' : 'lib', 'path_info' : '/'})
    },
    {
        'name' : 'cross app versioned development',
        'id' : '//2.services.libs.freebase.dev/lib',
        'expected' : make_empty_result({'appid' : '/freebase/libs/services/2', 'filename' : 'lib', 'path_info' : '/'})
    },
    {
        'name' : 'cross app published with alternative domain',
        'id' : '//tippify.com./lib',
        'expected' : make_empty_result({'appid' : _ROOT + 'com/tippify', 'filename' : 'lib', 'path_info' : '/'})
    },

    {
        'name' : 'cross app cross graph published',
        'id' : '//service.sandbox-freebaseapps.com./lib',
        'expected' : make_empty_result({'appid' : _ROOT_HOST + 'service', 'filename' : 'lib', 'service_url' : 'http://www.sandbox-freebase.com'})
    },
    {
        'name' : 'cross app cross graph development',
        'id' : '//r2-4-3.my_first_app.dfhuynh.user.dev.branch.qa-freebaseapps.com./lib',
        'expected' : make_empty_result({'appid' : '/user/dfhuynh/my_first_app/r2-4-3', 'filename' : 'lib', 'service_url' : 'http://branch.qa.metaweb.com'})
    },
];


for (var i in spec) {
    var current = spec[i];

    test(current.name, current, function() {
        var result = mf.parse_path(this.id, this.options || null);
        ok(result, 'id ' + this.id + ' no result');
        deepEqual(result, this.expected, {skip:true});
    });
}

acre.test.report();
