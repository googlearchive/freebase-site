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
var user;

function init_store() {
    
    user = FB.get_user_info();
    r_user = null;
    if (user) {
        r_user = {
            name : user.username,
            full_name : user.name,
            apps : acre.require('list_user_apps').list_user_apps(user.id)
        }
    }
    
    var exp = false;
    var status = exp ? null : 'Current';

    var q = {
      'id' : '/freebase/apps/acre_handler',
      'type' : '/type/type',
      'instance' : [{
          'type' : '/freebase/apps/acre_handler',
          'handler_key' : null,
          'plural_name' : null,
          'short_description' : null,
          'allowed_media_types' : [],
          'name' : null,
          'status' : status,
          'b:status' : {
            'name' : 'Deprecated',
            'optional' : 'forbidden'  
          },
          'index' : null,
          'sort' : 'index'
      }]
    };
    
    var result = FB.mqlread(q).result;
    
    var handlers = {};
    var list = result.instance;
    for (var a in list) {
        var dt = list[a];
        for (var mt in dt.allowed_media_types) {
            dt.allowed_media_types[mt] = dt.allowed_media_types[mt].slice(12);
        }
        handlers[dt.handler_key] = {
            key: dt.handler_key,
            name: dt.name,
            plural_name: dt.plural_name,
            supported_mime_types: dt.allowed_media_types,
            description: dt.short_description
        };            
    }
            
    return {
        host          : acre.host,
        version       : acre.version,
        acre_handlers : handlers,
        user          : r_user
    }
}


if (acre.current_script == acre.request.script) {
    service.GetService(function() {
        return init_store();
    }, this);
}
