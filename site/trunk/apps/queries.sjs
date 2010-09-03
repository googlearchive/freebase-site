var mf = acre.require("MANIFEST").mf;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var urlfetch = mf.require("promise", "apis").urlfetch;


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
      source : acre.freebase.service_url + '/tools/appeditor/#app=' + appinfo.id
    };
  }
  
  return app;
}


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
              var s = mf.require("libraries", "showdown");
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
          content : acre.form.encode(args)
        };
        d.oauth = freebase.fetch(url, fetch_opts)
          .then(function(res) {
            app.oauth = {
              key : res.key,
              secret : res.secret
            };
            return app;
          });
      }
      
      return deferred.all(d)
        .then(function(results) {
          return app;
        });
    });
};


var list_apps = function(query, opts){
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
          return link.target["/freebase/apps/acre_app_version/acre_app"].id
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
  
  var ext = {
    "sort" : "name",
    "by:/type/domain/owners" : {
      "member" : {
        "id" : '/user/' + username
      }
    },
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

