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
