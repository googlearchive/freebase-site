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


var spec =  [
    {
        'name' : 'app id',
        'id' : '/freebase/site/sample',
        'expected' : new EmptyResult({'appid' : '/freebase/site/sample'})
    },
    {
        'name' : 'app id 2',
        'id' : '/freebase/site/appadmin',
        'expected' : new EmptyResult({'appid' : '/freebase/site/appadmin'})
    }
];



test("decompose_path check", function() {
  // Basic url fetch should call the callback

    for (var i in spec) { 

        var failed = false;
        var current = spec[i];
        var result = lib.decompose_path(current['id']);

        if (!result) { 
            ok(false, 'id ' + current['id'] + ' no result');
            continue;
        }

        for (var j in current['expected']['r']) { 
            var expected = current['expected']['r'][j];
            if (! (j in result) || result[j] != expected) { 
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
