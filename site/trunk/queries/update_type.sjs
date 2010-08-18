var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var create_type = mf.require("create_type");
var create_article = mf.require("create_article");
var qh = mf.require("helpers");

/**
 * validation for update_type options
 * @see create_type.validate_options
 */
function validate_options(o) {
  create_type.validate_options(o, ["domain"]);
  if (!o.id) {
    throw ("type id required");
  }
  return o;
};

/**
 * Update an existing type values (name, key, description, typehint, etc.)
 *
 * @param o:Object (required) - options specifying the updated values. @see validate_options
 */
function update_type(o) {
  // validate args
  try {
    validate_options(o);
  }
  catch (e) {
    return deferred.rejected(e);
  }

  var q = {
    id: o.id,
    guid: null,
    type: "/type/type",
    key: {namespace:o.domain,value:null},
    "/common/topic/article": qh.article_clause(true)
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result || {};
    })
    .then(function(old) {
      if (o.key && old.key.value !== o.key) {
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
      else {
        return old;
      }
    })
    .then(function(old) {
      var update = {
        guid: old.guid,
        type: "/type/type"
      };
      if (o.name) {
        update.name = {value:o.name, lang:o.lang, connect:"update"};
      }
      if (o.typehint === "mediator") {
        update["/freebase/type_hints/mediator"] = {value:true, connect:"update"};
        // remove /common/topic as included type
        update["/freebase/type_hints/included_types"] = {
          id: "/common/topic",
          connect: "delete"
        };
      }
      else {
        if (o.typehint === "enumeration") {
          update["/freebase/type_hints/enumeration"] = {value:true, connect:"update"};
        }
        else {
          update["/freebase/type_hints/mediator"] = {value:false, connect:"update"};
          update["/freebase/type_hints/enumeration"] = {value:false, connect:"update"};
        }
        // add /common/topic as included type
        update["/freebase/type_hints/included_types"] = {
          id: "/common/topic",
          connect: "insert"
        };
      }
      return freebase.mqlwrite(update)
        .then(function(env) {
          return old;
        });
    })
    .then(function(old) {
      // update desc
      var article = old["/common/topic/article"].length ? old["/common/topic/article"][0].id : null;
      if (article) {
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
      else {
        return old.id;
      }
    });
};

