var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");

var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var update_article = mf.require("queries", "update_article");
var validators = mf.require("validator", "validators");
var i18n = mf.require("i18n", "i18n");

/**
 * Update an existing type values (name, key, description, role, etc.)
 *
 * @param o:Object (required) - options specifying the updated values.
 */
function update_type(options) {
  var o;
  try {
    o = {
      // required
      domain: validators.MqlId(options, "domain", {required:true}),
      id: validators.MqlId(options, "id", {required:true}),

      // optional
      name: validators.String(options, "name", {if_empty:null}),
      key: validators.String(options, "key", {if_empty:null}),
      description: validators.String(options, "description", {if_empty:null}),
      role: validators.OneOf(options, "role", {oneof:["mediator", "enumeration"], if_empty:null}),
      terminal: validators.StringBool(options, "terminal", {if_empty:null}),

      // default to /lang/en
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"}),

      // an array of options to remove/delete (name, key, description, role);
      remove: validators.Array(options, "remove", {if_empty:[]})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var remove = {};
  o.remove.forEach(function(k) {
    remove[k] = true;
  });

  var q = {
    id: o.id,
    guid: null,
    type: "/type/type",
    key: {namespace:o.domain, value:null, optional:true},
    name: {value:null, lang:o.lang, optional:true},
    "/freebase/type_hints/mediator": null,
    "/freebase/type_hints/terminal": null,
    "/freebase/type_hints/enumeration": null,
    "/common/topic/article": i18n.mql.article_clause(o.lang)
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(old) {
      if (remove.key && old.key) {
        return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.domain, value:old.key.value, connect:"delete"}})
          .then(function(env) {
            // old id may no longer be valid since we deleted the key
            old.id = env.result.id;
            return old;
          });
      }
      else if (! (o.key == null || old.key.value == o.key)) {
        // delete old key
        return freebase.mqlwrite({guid:old.guid, key:{namespace:o.domain, value:old.key.value, connect:"delete"}})
          .then(function(env) {
            // insert new key
            return freebase.mqlwrite({guid:old.guid, id:null, key:{namespace:o.domain, value:o.key, connect:"insert"}})
              .then(function(env) {
                // id may have changed
                old.id = env.result.id;
                return old;
              });
          });
      }
      return old;
    })
    .then(function(old) {
      var update = {
        guid: old.guid,
        type: "/type/type"
      };
      if (remove.name && old.name) {
        update.name = {value:old.name.value, lang:old.name.lang, connect:"delete"};
      }
      else if (o.name != null) {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }

      var old_role = h.get_type_role(old);

      if (remove.role) {
        if (old_role === "mediator") {
          if (old["/freebase/type_hints/mediator"]) {
            update["/freebase/type_hints/mediator"] = {value: true, connect: "delete"};
          }
          update["/freebase/type_hints/included_types"] = {id: "/common/topic", connect: "insert"};
        }
        else if (old_role === "enumeration") {
          if (old["/freebase/type_hints/enumeration"]) {
            update["/freebase/type_hints/enumeration"] = {value: true, connect: "delete"};
          }
        }
      }
      else if (o.role === "mediator") {
        update["/freebase/type_hints/mediator"] = {value: true, connect: "update"};
        // remove old enumeration flag
        update["/freebase/type_hints/enumeration"] = {value:true, connect:"delete"};
        // remove /common/topic as included type
        update["/freebase/type_hints/included_types"] = {id: "/common/topic", connect: "delete"};
      }
      else if (o.role === "enumeration") {
        update["/freebase/type_hints/enumeration"] = {value: true, connect: "update"};
        // remove old mediator flag
        update["/freebase/type_hints/mediator"] = {value:true, connect:"delete"};
        // insert /common/topic as included type
        update["/freebase/type_hints/included_types"] = {id: "/common/topic", connect: "insert"};
      }

      if (remove.terminal) {
        var old_terminal = old["/freebase/type_hints/terminal"];
        if (old_terminal !== null) {
          update["/freebase/type_hints/terminal"] = {value: old_terminal, connect: "delete"};
        }
      }
      else if (o.terminal != null) {
        update["/freebase/type_hints/terminal"] = {value: o.terminal, connect: "update"};
      }

      var d = old;
      var keys = ["name", "/freebase/type_hints/mediator", "/freebase/type_hints/terminal", "/freebase/type_hints/enumeration"];
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
      var article = i18n.mql.get_article(o.lang, old["/common/topic/article"], true);
      if (article && article.source_uri) {
        article = null;  // can't update/delete wp articles
      }
      if (remove.description && article) {
        return freebase.mqlwrite({id:old.id, "/common/topic/article":{id:article.id, connect:"delete"}})
          .then(function() {
            return old.id;
          });
      }
      else if (o.description != null) {
        var update_article_options = {
          topic: old.id,
          article: article ? article.id : null,
          lang: o.lang,
          use_permission_of: old.id
        };
        return update_article.update_article(o.description, "text/html", update_article_options)
          .then(function() {
            return old.id;
          });
      }
      else {
        return old.id;
      }
    });
};

