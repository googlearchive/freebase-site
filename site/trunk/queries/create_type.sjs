var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");
var create_article = mf.require("create_article").create_article;

/**
 * Create a new type using the permission of the specified domain.
 *
 * @param o:Object (required) - options specifying the new type (name, key, etc.):
 *   domain (required)
 *   name (required)
 *   key (required)
 *   desc (optional)
 *   typehint (optional) - "enumeration", "cvt"
 *   mqlkey_quote (optional) - acre.freebase.mqlkey_quote(key) if TRUE, default is False.
 */
function create_type(o) {
  var domain = o.domain == null ? "" : h.trim(o.domain);
  var name = o.name == null ? "" : h.trim(o.name);
  var key = o.key == null ? "" : h.trim(o.key);
  var desc = o.desc == null ? "" : h.trim(o.desc);
  var typehint = (o.typehint === "enumeration" || o.typehint === "cvt") ? o.typehint : "";
  var mqlkey_quote = o.mqlkey_quote === true;
  var lang = o.lang == null ? "/lang/en" : o.lang;  // this should be set globally somehow
  if (domain === "" || name === "" || key === "") {
    return deferred.rejected("name and key required");
  }
  if (mqlkey_quote) {
    key = acre.freebase.mqlkey_quote(key);
  }
  var q = {
    id: null,
    key: {
      value: key,
      namespace: domain
    },
    type: {
      id: "/type/type"
    },
    "/type/type/domain": {
      id: domain
    },
    create: "unless_exists"
  };
  return freebase.mqlwrite(q, {use_permission_of: domain})
    .then(function(env) {
      return env.result;
    })
    .then(function(created) {
      if (created.create === "existed") {
        return deferred.rejected("key already exists: " + key);
      }
      q = {
        id: created.id,
        name: {
          value: name,
          lang: lang,
          connect: "update"
        }
      };
      if (typehint === "cvt") {
        // add /freebase/type_profile/mediator
        q["/freebase/type_hints/mediator"] = {
          value: true,
          connect: "update"
        };
      }
      else {
        if (typehint === "enumeration") {
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
          if (desc !== "") {
            return create_article(desc, "text/html", {use_permission_of: domain, topic: created.id})
              .then(function(article) {
                return created;
              });
          }
          return created;
        });
    });
};

