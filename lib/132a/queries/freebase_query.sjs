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

var i18n = acre.require("i18n/i18n.sjs");
var apis = acre.require("promise/apis.sjs");
var deferred = apis.deferred;
var freebase = apis.freebase;

function clean_query(q) {
  q.type = q["/freebase/query_hints/related_type"];
  if (q["/common/document/content"] &&
     q["/common/document/content"].link &&
     q["/common/document/content"].link.timestamp) {
    q.timestamp = acre.freebase.date_from_iso(q["/common/document/content"].link.timestamp);
  }
  if (q.key && 
      q.key.namespace &&
      q.key.namespace.key &&
      q.key.namespace.key.namespace) {
    q.domain = q.key.namespace.key.namespace;
  }
  return q;
};

function queries_by_domain(domain) {
  return deferred.all([
      freebase.mqlread(domain_queries_mql(domain, true)),
      freebase.mqlread(domain_queries_mql(domain, false))
    ]).then(function(res) {
      res.forEach(function(r) {
        r.result.forEach(clean_query);
      });
      return {
        editor_queries: res[0].result,
        user_queries: res[1].result
      };
    });
};

function queries_by_user(user) {
  return freebase.mqlread(user_queries_mql(user))
    .then(function(env) {
      return env.result;
    })
    .then(function(queries) {
      queries.forEach(function(q) {
        clean_query(q);
        if (q.domain.id === user) delete q.domain;
      });
      return queries;
    });
};

function recent_queries(days) {
  return freebase.mqlread(recent_queries_mql(days))
    .then(function(env) {
      return env.result || [];
    })
    .then(function(queries) {
      queries.forEach(function(q) {
        clean_query(q);
        q.domain = q.key ? q.key.namespace.key.namespace : null;
      });
      return queries;
    });
};

function domain_queries_mql(domain, editors) {
  return [{
    "id": null,
    "name": i18n.mql.query.name(),
    "type": "/freebase/query",
    "/freebase/query_hints/related_type": {
      "domain": (editors ? null : domain),
      "id": null,
      "name": i18n.mql.query.name()
    },
    "key": {
      "value": null,
      "namespace": {
        "key": {
          "value": "views",
          "namespace": domain,
          "optional": (editors ? "required" : "forbidden")
        }
      },
      "limit": 0
    },
    "/common/document/content": {
      "id": null,
      "link": {
        "timestamp": null
      }
    },
    "sort": "-/common/document/content.link.timestamp",
    "creator": null
  }];
};

function user_queries_mql(user) {
  return [{
    "id": null,
    "name": i18n.mql.query.name(),
    "type": "/freebase/query",
    "creator": user,
    "/freebase/query_hints/related_type": {
      "id": null,
      "name": i18n.mql.query.name(),
      "optional": true
    },
    "key": {
      "value": null,
      "namespace": {
        "key": {
          "value": "views",
          "namespace": {
            "id": null,
            "name": i18n.mql.query.name()
          }
        }
      },
      "limit": 1
    },
    "/common/document/content": {
      "id": null,
      "link": {
        "timestamp": null
      }
    },
    "sort": "-/common/document/content.link.timestamp",
    "limit": 1000
  }];
};

function recent_queries_mql(days) {
  var q = [{
    "id": null,
    "name": i18n.mql.query.name(),
    "creator": null,
    "type": "/freebase/query",
    "/common/document/content": {
      "id": null,
      "link": {
        "timestamp": null
      }
    },
    "/freebase/query_hints/related_type": {
      "id": null,
      "name": i18n.mql.query.name(),
      "limit": 1,
      "optional": true
    },
    "key": {
      "namespace": {
        "key": {
          "value": "views",
          "namespace": {
            "id": null,
            "name": i18n.mql.query.name(),
            "limit": 1
          }
        }
      },
      "optional": true
    },
    "forbid:key": {
      "value": "topic",
      "optional": "forbidden"
    },
    "sort": "-/common/document/content.link.timestamp",
    "limit": 100
  }];
  return q;
};
