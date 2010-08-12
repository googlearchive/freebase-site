var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");
var create_article = mf.require("create_article");

/*
 * @param o:Object (required) - options specifying the new type (name, key, etc.):
 *   domain (required)
 *   name (required)
 *   key (required)
 *   description (optional)
 *   typehint (optional) - "enumeration", "mediator"
 *   mqlkey_quote (optional) - acre.freebase.mqlkey_quote(key) if TRUE, default is False.
 *
 * Note: this will modify o with the validated values
 */
function validate_options(o, required) {
  o.domain = o.domain == null ? "" : h.trim(o.domain);
  o.name = o.name == null ? "" : h.trim(o.name);
  o.key = o.key == null ? "" : h.trim(o.key);
  o.description = o.description == null ? "" : h.trim(o.description);
  o.typehint = (o.typehint === "enumeration" || o.typehint === "mediator") ? o.typehint : "";
  o.mqlkey_quote = o.mqlkey_quote === true;
  o.lang = o.lang == null ? "/lang/en" : o.lang;  // this should be set globally somehow
  if (required) {
    for (var i=0,l=required.length; i<l; i++) {
      if (o[required[i]] === "") {
        return deferred.rejected(required[i] + " required");
      }
    }
  }
  if (o.mqlkey_quote) {
    o.key = acre.freebase.mqlkey_quote(o.key);
  }
  return o;
};

/**
 * Create a new type using the permission of the specified domain.
 *
 * @param o:Object (required) - options specifying the new type @see validate_options
 */
function create_type(o) {
  // validate args
  validate_options(o, ["domain", "name", "key"]);

  var q = {
    id: null,
    key: {
      value: o.key,
      namespace: o.domain
    },
    type: {
      id: "/type/type"
    },
    "/type/type/domain": {
      id: o.domain
    },
    create: "unless_exists"
  };
  return freebase.mqlwrite(q, {use_permission_of: o.domain})
    .then(function(env) {
      return env.result;
    })
    .then(function(created) {
      if (created.create === "existed") {
        return deferred.rejected("key already exists: " + o.key);
      }
      // cleanup result
      created.domain = created["/type/type/domain"];

      q = {
        id: created.id,
        name: {
          value: o.name,
          lang: o.lang,
          connect: "update"
        }
      };
      if (o.typehint === "mediator") {
        // add /freebase/type_profile/mediator
        q["/freebase/type_hints/mediator"] = {
          value: true,
          connect: "update"
        };
      }
      else {
        if (o.typehint === "enumeration") {
          q["/freebase/type_hints/enumeration"] = {
            value: true,
            connect: "update"
          };
        }
        q["/freebase/type_hints/included_types"] = {
          id: "/common/topic",
          connect: "insert"
        };
      }
      return freebase.mqlwrite(q)
        .then(function(env) {
          return env.result;
        })
        .then(function(result) {
          if (o.description !== "") {
            return create_article.create_article(o.description, "text/html", {use_permission_of: o.domain, topic: created.id})
              .then(function(article) {
                return created;
              });
          }
          return created;
        });
    });
};

