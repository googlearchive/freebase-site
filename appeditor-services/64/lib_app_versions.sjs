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

