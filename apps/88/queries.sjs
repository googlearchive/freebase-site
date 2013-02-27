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

var deferred = acre.require("lib/promise/deferred");
var freebase = acre.require("lib/promise/apis").freebase;
var urlfetch = acre.require("lib/promise/apis").urlfetch;


function make_app(appinfo) {
  if (!appinfo) return null;

  var app = {
    id : appinfo.id,
    guid : appinfo.guid,
    name : appinfo.name,
    listed : appinfo.listed,
    homepage : appinfo.homepage,
    description : appinfo.description,
    modified : appinfo.timestamp,
    article : appinfo['/common/topic/article'],
    creator : (appinfo['/type/domain/owners'] ? appinfo['/type/domain/owners'].creator : null),
    authors : (appinfo['/type/domain/owners'] ? appinfo['/type/domain/owners'].member : []),
    icon : appinfo.icon,
    oauth_enabled : appinfo.oauth_enabled,
    acre : null
  };

  if (app.icon) {
    app.icon.src = acre.freebase.imgurl(app.icon.id, 170, 65, "fillcropmid");
  }

  // extra properties for Acre apps
  if (appinfo['acre:type']) {

    // figure out whether the app or one of it's versions has been published
    var pubkey = false;
    var version = null;
    if (appinfo["pubkey:key"]) {
      pubkey = appinfo["pubkey:key"].value;
    } else if (appinfo["pubkey:/type/namespace/keys"]) {
      version = appinfo["pubkey:/type/namespace/keys"].value;
      pubkey = appinfo["pubkey:/type/namespace/keys"].namespace.key.value;
    }

    // set the homepage... but don't override a manually set one
    if (!app.homepage) {
      if (pubkey) {
        app.homepage = 'http://' + pubkey + '.freebaseapps.com/';
      } else {
        app.homepage = 'http://' + app.id.split('/').reverse().join('.') + 'dev.freebaseapps.com/';
      }
    }

    // look at file modification time for Acre apps too
    if (appinfo['modified:/type/namespace/keys']) {
      var modified = appinfo['modified:/type/namespace/keys'].namespace["/common/document/content"].link.timestamp;
      if (modified > app.modified) {
        app.modified = (modified > app.modified) ? modified : app.modified;
        app.modified_by = appinfo['modified:/type/namespace/keys'].namespace["/common/document/content"].link.creator;
      }
    }

    app.acre = {
      version : version,
      source : acre.freebase.site_host + '/appeditor/#app=' + appinfo.id
    };
  }
  return app;
}

var mini_app = function(o) {
  var appq = acre.require('app_query').extend({id: o.id}).query;
  return freebase.mqlread(appq)
    .then(function(envelope){
      return make_app(envelope.result);
    });
};

var app = function(id, options) {
  if (!id) return null;

  options = options || {};
  var appq = acre.require('app_query').extend({id: id}).query;

  return freebase.mqlread(appq)
    .then(function(envelope){
      return make_app(envelope.result);
    }, function(error) {
      return null;
    })
    .then(function(app) {
      if (!app) return null;
      var d = {};

      if (options.article && app.article) {
        d.article = freebase.get_blob(app.article.content)
          .then(function(response) {
              var s = acre.require("libraries/showdown");
              var converter = new s.Showdown.converter();
              app.article.text = response.body;
              app.article.html = converter.makeHtml(app.article.text);
              return app;
            });
      }

      if (options.api_keys) {
        var url = acre.freebase.service_url.replace(/http:\/\//, 'https://') + '/api/oauth/enable';
        var args = {
          id: app.guid,
          reset_secret : (app.oauth_enabled ? false : true)
        };
        var fetch_opts = {
          method : "POST",
          sign : true,
          content : acre.form.encode(args),
        };

        try {
          var oauth_result = acre.freebase.fetch(url, fetch_opts);
          app.oauth = {
            key: oauth_result.key,
            secret: oauth_result.secret
          };
        } catch(e) {
          console.warn("Couldn't fetch API keys", e);
        }
      }

      return deferred.all(d)
        .then(function(results) {
          return app;
        });
    });
};


var list_apps = function(query, opts){
  var mf = JSON.parse(acre.require("apps.json").body);
  var list = mf[opts.list];
  var q = acre.require('app_query').extend({
    "id" : null,
    "id|=": list,
    "limit" : 25
  }).query;

  return freebase.mqlread([q])
    .then(function(envelope){
      return envelope.result.map(function(appinfo){
        return make_app(appinfo);
      });
    }, function(error) {
      return [];
    })
    .then(function(apps){
      return apps.sort(function(a, b) {
        return list.indexOf(a.id) - list.indexOf(b.id);
      });
    });
};


var released_apps = function(opts) {
  var rq = acre.require("released").query;

  return freebase.mqlread(rq)
    .then(function(envelope) {
      return envelope.result.map(function(link) {
        if (link.target.type.id === "/freebase/apps/acre_app") {
          return link.target.id;
        } else {
          return link.target["/freebase/apps/acre_app_version/acre_app"].id;
        }
      });
    }, function(error) {
      return [];
    })
    .then(function(ids) {
      var q = acre.require('app_query').extend({'id|=' : ids}).query;
      return freebase.mqlread([q])
        .then(function(envelope) {
          envelope.result.forEach(function(appinfo) {
            ids[ids.indexOf(appinfo.id)] = make_app(appinfo);
          });
          return ids;
        });
    }, function(error) {
      return [];
    });
};


var recent_apps = function(opts) {
  var q = acre.require('app_query').extend({
    "sort" : "-modified:/type/namespace/keys.namespace./common/document/content.link.timestamp",
    "listed" : true,
    "limit" : 25
  }).query;

  return freebase.mqlread([q])
    .then(function(envelope){
      return envelope.result.map(function(appinfo){
        return make_app(appinfo);
      });
    }, function(error) {
      return [];
    });
};


var user_apps = function(username, opts) {
  if (!username) {
    console.log("no username in user_apps");
    return [];
  }

  var user_id = '/user/' + username.split("/").pop();

  var ext = {
    "sort" : "name",
    "by:/type/domain/owners" : {
      "member" : {
        "id" : user_id
      }
    },
    "limit": 1000
  };

  var q = acre.require('app_query').extend(ext).query;

  return freebase.mqlread([q])
    .then(function(envelope){
      return envelope.result.map(function(appinfo){
        return make_app(appinfo);
      });
    }, function(error) {
      return [];
    });
};


var search_apps = function(search, opts) {
  q = acre.require('app_query').query;
  var args = {
    type:'/freebase/apps/application',
    mql_output:[q]
  };

  /*
  if (opts && !opts.unlisted) {
    args.mql_filter = [{ "/freebase/apps/application/listed" : true }];
  }
  */

  return freebase.search(search, args)
    .then(function(envelope){
      return envelope.result.map(function(appinfo){
        return make_app(appinfo);
      });
    }, function(error) {
      return [];
    });
};

