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

var h = acre.require("helper/helpers.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var apis = acre.require("promise/apis.sjs");
var deferred = apis.deferred;
var freebase = apis.freebase;

function extend(q, filter_ids) {
  var clause = q;
  if (h.isArray(q) && q.length === 1) {
    clause = q[0];
  }
  clause["creator"] = {
    id: null,
    key: {
      value: null,
      namespace: "/user",
      limit: 1
    },
    type: "/type/user",
    optional: true
  };
  clause["attribution"] = {
    creator: {
      id: null,
      key: {
        value: null,
        namespace: "/user",
        limit: 1
      },
      type: "/type/user"
    },
    "/freebase/written_by/application": {
      id: null,
      name: null,
      optional: true
    },
    "/dataworld/provenance/data_operation": {
      id: null,
      name: null,
      limit: 1,
      operator: {
        id: null,
        type: "/type/user",
        limit: 1
      },
      optional: true
    },
    type: "/type/attribution",
    optional: true
  };
  clause["the:creator"] = {
    id: null
  };
  if (filter_ids) {
    clause["filter:creator"] = {
      "id|=": filter_ids
    };
  }
  return q;
};

function by(ids, type) {
  // if no ids specified, just return standard creator clause
  if (!ids || !ids.length) {
    return deferred.resolved(extend({}));
  }
  
  if (typeof ids == 'string') {
    ids = [ids];
  }

  // start with the objects themselves
  var attrs = ids.slice();
  
  var promises = [];
  
  if (!type || type == "/type/user") {
    // add attributions created by user
    promises.push(freebase.mqlread([{
      "id": null,
      "type": "/type/attribution",
      "creator": {
        "id|=" : ids
      },
      "limit": 1000
    }]));
    
    // add mdo's user is operator of 
    promises.push(freebase.mqlread([{
      "id": null,
      "type": "/type/attribution",
      "/dataworld/provenance/data_operation": {
          "operator" : {
            "id|=" : ids
          },
          "limit": 1
        },
      "limit": 1000
    }]));
  }
  
  if (!type || type == "/dataworld/mass_data_operation") {
    // add mdo attributions 
    promises.push(freebase.mqlread([{
      "id": null,
      "type": "/type/attribution",
      "/dataworld/provenance/data_operation": {
          "id|=" : ids
        },
      "limit": 1000
    }]));
  }
  
  if (!type || type == "/freebase/apps/acre_app") {
    // add acre app attributions 
    promises.push(freebase.mqlread([{
      "id": null,
      "type": "/type/attribution",
      "/freebase/written_by/application": {
          "id|=" : ids
        },
      "limit": 1000
    }]));
  }

  return deferred.all(promises)
    .then(function(res) {
      res.forEach(function(env) {
        env.result.forEach(function(attr) {
          attrs.push(attr.id);
        })
      });
      return extend({}, attrs)
    });
};
