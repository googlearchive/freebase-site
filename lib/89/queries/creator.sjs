/*
* Copyright 2012, Google Inc.
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


/**
 * Extends a MQL query to get attribution and provenance data.
 * Use in conjunction with get_attribution() in /lib/helper/helpers.sjs
 *
 * @param q:object (required)
 * @param filter_ids:array creator IDs to include
 *
 * @return augmented query object
 */
function extend(q, filter_ids) {
  var clause = q;
  if (h.isArray(q) && q.length === 1) {
    clause = q[0];
  }

  var name_clause = i18n.mql.query.name();

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
      name: name_clause,
      optional: true
    },
    "/dataworld/provenance/tool": {
      type: "/dataworld/software_tool",
      id: null,
      name: name_clause,
      optional: true
    },
    "/dataworld/provenance/source": {
      type: "/dataworld/information_source",
      id: null,
      name: name_clause,
      limit: 1,
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


/**
 * Returns a clause for constraining a query to only links
 * created by the IDs specified
 *
 * @param ids:array (required) - IDs to constrain to
 * @param type:String - hint as to what kind of object ids are
 *
 * @return a promise that returns a query clause to be used with 
 *         link: or to extend a type: "/type/link" query
 */
function by(ids, type) {
  // if no ids specified, just return standard creator clause
  if (!ids || !ids.length) {
    return deferred.resolved(extend({}));
  }
  
  if (h.type(ids) === 'string') {
    ids = [ids];
  }

  var creators = [];
  var promises = [];

  if (!type || type === "/type/attribution") {
    creators = creators.concat(ids);
  }
  
  if (!type || type === "/type/user") {
    promises.push(creators_by_user(ids));
  }

  if (!type || type === "/dataworld/information_source") {
    promises.push(creators_by_dataset(ids));
  }

  if (!type || type === "/dataworld/software_tool") {
    promises.push(creators_by_tool(ids));
  }
  
  if (!type || type === "/dataworld/mass_data_operation") {
    promises.push(creators_by_mdo(ids));
  }
  
  if (!type || type === "/freebase/apps/acre_app") {
    promises.push(creators_by_acre_app(ids));
  }

  return deferred.all(promises)
    .then(function(res) {
      res.forEach(function(c) {
        creators = creators.concat(c);
      });
      if (!creators.length) {
        throw new Error(h.sprintf("Couldn't find attribtuion nodes for the ids: %s", ids.join(",")));
      }
      return extend({}, creators);
    });
};


function creators_by_user(ids) {
  var promises = [];

  // start with the users themselves (no creator)
  var creators = ids.slice();
  
  // add attributions created by user
  promises.push(freebase.mqlread([{
    "id": null,
    "type": "/type/attribution",
    "creator": {
      "id|=" : ids
    },
    "links": {
      "timestamp": null,
      "sort": "-timestamp",
      "limit": 1
    },
    "sort": "-links.timestamp",
    "limit": 100
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
    "links": {
      "timestamp": null,
      "sort": "-timestamp",
      "limit": 1
    },
    "sort": "-links.timestamp",
    "limit": 100
  }]));

  return deferred.all(promises)
    .then(function(res) {
      res.forEach(function(env) {
        env.result.forEach(function(attr) {
          creators.push(attr.id);
        })
      });
      return creators;
    });
};

function creators_by_dataset(ids) {
  var creators = [];

  return freebase.mqlread([{
      "id": null,
      "type": "/type/attribution",
      "/dataworld/provenance/source": {
        "id|=" : ids
      },
      "links": {
        "timestamp": null,
        "sort": "-timestamp",
        "limit": 1
      },
      "sort": "-links.timestamp",
      "limit": 100
    }])
    .then(function(env) {
      env.result.forEach(function(attr) {
        creators.push(attr.id);
      })
      return creators;
    });
};

function creators_by_tool(ids) {
  var creators = [];

  return freebase.mqlread([{
      "id": null,
      "type": "/type/attribution",
      "/dataworld/provenance/tool": {
        "id|=" : ids
      },
      "links": {
        "timestamp": null,
        "sort": "-timestamp",
        "limit": 1
      },
      "sort": "-links.timestamp",
      "limit": 100
    }])
    .then(function(env) {
      env.result.forEach(function(attr) {
        creators.push(attr.id);
      })
      return creators;
    });
};

function creators_by_mdo(ids) {
  var creators = [];

  return freebase.mqlread([{
      "id": null,
      "type": "/type/attribution",
      "/dataworld/provenance/data_operation": {
          "id|=" : ids
      },
      "links": {
        "timestamp": null,
        "sort": "-timestamp",
        "limit": 1
      },
      "sort": "-links.timestamp",
      "limit": 100
    }])
    .then(function(env) {
      env.result.forEach(function(attr) {
        creators.push(attr.id);
      })
      return creators;
    });
};

function creators_by_acre_app(ids) {
  var creators = [];

  return freebase.mqlread([{
      "id": null,
      "type": "/type/attribution",
      "/freebase/written_by/application": {
          "id|=" : ids
      },
      "links": {
        "timestamp": null,
        "sort": "-timestamp",
        "limit": 1
      },
      "sort": "-links.timestamp",
      "limit": 100
    }])
    .then(function(env) {
      env.result.forEach(function(attr) {
        creators.push(attr.id);
      })
      return creators;
    });
};
