var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");
var qh = mf.require("helpers");
var create_article = mf.require("create_article");
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var validators = mf.require("validator", "validators");

/**
 * Create a new topic with name, type (optional) and description (optional).
 * If "create" option is "unless_exists", the constraints will be on the name and type (and not the type's included_types).
 * Also, if topic exists with a description, it's description will be updated if description is specified.
 * If "included_types" option is TRUE, this will type the topic with the included_types (/freebase/type_hints/included_types)
 * of the "type" specified.
 *
 * @param o:Object (required) - options specifying the new topic.
 */
function create_topic(options) {
  var o;
  try {
    o = {
      name: validators.String(options, "name", {required:true}),

      type: validators.MqlId(options, "type", {if_empty:""}),
      included_types: validators.StringBool(options, "included_types", {if_empty:true}),
      description: validators.String(options, "description", {if_empty:""}),

      create: validators.OneOf(options, "create", {oneof:["unconditional", "unless_exists"], if_empty:"unconditional"}),
      lang: validators.MqlId(options, "lang", {if_empty:"/lang/en"})
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }

  var q = {
    id: null,
    name: {
      value: o.name,
      lang: o.lang
    },
    create: o.create
  };
  if (o.type) {
    q.type = o.type;
  }

  return freebase.mqlwrite(q)
    .then(function(env) {
      var created = env.result;
      created.name = created.name.value;
      return created;
    })
    .then(function(created) {
      if (o.type && o.included_types) {
        return included_types(o.type)
          .then(function(types) {
            if (types.length) {
              var q = {
                id: created.id,
                type: [{id:t.id, connect:"insert"} for each (t in types)]
              };
              return freebase.mqlwrite(q)
                .then(function() {
                  return created;
                });
            }
            else {
              return created;
            }
          });
      }
      else {
        return created;
      }
    })
    .then(function(created) {
      if (o.description) {
        if (created.create === "existed") {
          // look up if there's an existing /common/topic/article
          return freebase.mqlread({id:created.id, "/common/topic/article": qh.article_clause(true)})
            .then(function(env) {
              var result = env.result;
              var article = result["/common/topic/article"].length ? result["/common/topic/article"][0].id : null;
              if (article) {
                return freebase.upload(o.description, "text/html", {document:article})
                  .then(function() {
                    return created;
                  });
              }
              else {
                return create_article.create_article(o.description, "text/html", {topic:created.id})
                  .then(function() {
                    return created;
                  });
              }
            });
        }
        else {
          // otherwise just create a new /common/topic/article
          return create_article.create_article(o.description, "text/html", {topic:created.id})
            .then(function() {
              return created;
            });
        }
      }
      else {
        return created;
      }
    });

};


/**
 * copied from schema queries included_types
 */
function included_types(id) {
  return freebase.mqlread({
    id: id,
    "/freebase/type_hints/included_types": [{
      optional: true,
      id: null,
      name: null,
      type: "/type/type",
      index: null,
      sort: "index",
      "!/freebase/domain_profile/base_type": {optional: "forbidden", id: null, limit: 0}
    }]
  })
  .then(function(env) {
    return env.result;
  })
  .then(function(result) {
    var types = result["/freebase/type_hints/included_types"];
    return [{id: t.id, name: t.name} for each (t in types)];
  });
};
