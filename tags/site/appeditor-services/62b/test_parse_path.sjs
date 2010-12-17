/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

acre.require('/test/lib').enable(this);
var lib = acre.require('lib_appeditor_service');

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
      //  'bug' : 'TODO: investiate app_path',
        'name' : 'file',
        'id' : 'foo',
        'expected' : make_empty_result({'appid' : '/freebase/site/appeditor-services', 'filename' : 'foo'}),
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
        'id' : '//service.freebaseapps.com./lib',
        'expected' : make_empty_result({'appid' : _ROOT_HOST + 'service', 'filename' : 'lib', 'service_url' : 'http://api.freebase.com'})
    },
    {
        'name' : 'cross app cross graph development',
        'id' : '//r2-4-3.my_first_app.dfhuynh.user.dev.freebaseapps.com./lib',
        'expected' : make_empty_result({'appid' : '/user/dfhuynh/my_first_app/r2-4-3', 'filename' : 'lib', 'service_url' : 'http://api.freebase.com'})
    }
];


for (var i in spec) {
    var current = spec[i];

    test(current.name, current, function() {
        var result = lib.parse_path(this.id, this.options || null);
        ok(result, 'id: ' + this.id);
        deepEqual(result, this.expected, {skip:true});
    });
}

acre.test.report();
