var mf = acre.require("MANIFEST").MF;
var deferred = mf.require("promise", "deferred");
var freebase = mf.require("promise", "apis").freebase;
var h = mf.require("core", "helpers");
var create_article = mf.require("create_article");
var validators = mf.require("validator", "validators");

/**
 * Create a new type using the permission of the specified domain.
 *
 * @param o:Object (required) - options specifying the new type @see validate_options
 */
function create_type(options) {
  var o;
  try {
    o = {
      domain: validators.MqlId(options.domain, {required:true}).to_js(),
      name: validators.String(options.name, {required:true}).to_js(),
      key: validators.String(options.key, {required:true}).to_js(),
      description: validators.String(options.description, {if_empty:""}).to_js(),
      typehint: validators.OneOf(options.typehint, {oneof:["enumeration", "mediator"], if_empty:""}).to_js(),
      mqlkey_quote: validators.StringBool(options.mqlkey_quote, {if_empty:false}).to_js(),
      lang: validators.MqlId(options.lang, {if_empty:"/lang/en"}).to_js()
    };
  }
  catch(e if e instanceof validators.Invalid) {
    return deferred.rejected(e);
  }
  if (o.mqlkey_quote) {
    o.key = acre.freebase.mqlkey_quote(o.key);
  }

  var q = {
    id: null,
    guid: null,
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

