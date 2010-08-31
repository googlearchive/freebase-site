var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var create_article = mf.require("create_article");
var qh = mf.require("helpers");
var validators = mf.require("validator", "validators");

/**
 * Update an existing domain values (name, key, description).
 *
 * @param o:Object (required) - options specifying the updated values.
 */
function update_domain(options) {
  var o;
  try {
    o = {
      // required
      id: validators.MqlId(options, "id", {required:true}),

      // optional
      name: validators.String(options, "name", {if_empty:null}),
      namespace: validators.MqlId(options, "namespace", {if_empty:null}),  // assuming has permission on namespace
      key: validators.String(options, "key", {if_empty:null}),
      description: validators.String(options, "description", {if_empty:null}),
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"}),

      // if TRUE, acre.freebase.mqlkey_quote key. Default is FALSE
      mqlkey_quote: validators.StringBool(options, "mqlkey_quote", {if_empty:false}),

      // if TRUE, name, key, description, is deleted if empty. Default is FALSE
      empty_delete: validators.StringBool(options, "empty_delete", {if_empty:false})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }
  if (o.mqlkey_quote) {
    o.key = acre.freebase.mqlkey_quote(o.key);
  }

  var q = {
    id: o.id,
    guid: null,
    type: "/type/domain",
    key: [{namespace:null,value:null,optional:true}],
    name: {value:null, lang:o.lang, optional:true},
    "/common/topic/article": qh.article_clause(true)
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(old) {
      if (o.key === null) {
        if (o.empty_delete && o.namespace) {
          // delete key from o.namespace (required)
          for (var i=0,l=old.key.length; i<l; i++) {
            var k = old.key[i];
            if (k.namespace === o.namespace) {
              return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.namespace, value:k.value, connect:"delete"}})
                .then(function(env) {
                  // old id may no longer be valid since we deleted the key
                  old.id = env.result.id;
                  return old;
                });
            }
          }
        }
      }
      else if (o.namespace && o.key) {
        for (var i=0,l=old.key.length; i<l; i++) {
          var k = old.key[i];
            if (k.namespace === o.namespace && k.value !== o.key) {
              return freebase.mqlwrite({guid:old.guid, key:{namespace:o.namespace, value:k.value, connect:"delete"}})
                .then(function(env) {
                  // insert new key
                  return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.namespace, value:o.key, connect:"insert"}})
                    .then(function(env) {
                      // id may have changed
                      old.id = env.result.id;
                      return old;
                    });
                });
            }
        }
      }
      return old;
    })
    .then(function(old) {
      var update = {
        guid: old.guid,
        type: "/type/domain"
      };
      if (o.name === null) {
        if (old.name && o.empty_delete) {
          update.name = {value:old.name.value, lang:old.name.lang, connect:"delete"};
        }
      }
      else {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }
      var d = old;
      var keys = ["name"];
      for (var i=0,l=keys.length; i<l; i++) {
        if (keys[i] in update) {
          d = freebase.mqlwrite(update)
            .then(function(env) {
              return old;
            });
          break;
        }
      }
      return d;
    })
    .then(function(old) {
      var article = old["/common/topic/article"].length ? old["/common/topic/article"][0].id : null;
      if (o.description === null) {
        if (article && o.empty_delete) {
          return freebase.mqlwrite({id:old.id, "/common/topic/article":{id:article, connect:"delete"}})
            .then(function() {
              return old.id;
            });
        }
      }
      else if (article) {
        return freebase.upload(o.description, "text/html", {document:article})
          .then(function(uploaded) {
              return old.id;
          });
      }
      else if (o.description) {
        // create a new article with domain permission
        return create_article.create_article(o.description, "text/html", {use_permission_of:o.domain, topic:old.id})
          .then(function() {
            return old.id;
          });
      }
      return old.id;
    });
};
