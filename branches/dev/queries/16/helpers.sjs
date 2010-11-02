var mf = acre.require("MANIFEST").mf;
var extend = mf.require("core", "helpers_util").extend;

var LITERAL_TYPE_IDS = {
  "/type/int":1,
  "/type/float":1,
  "/type/boolean":1,
  "/type/rawstring":1,
  "/type/uri":1,
  "/type/text":1,
  "/type/datetime":1,
  "/type/bytestring":1,
  "/type/id":1,
  "/type/key":1,
  "/type/value":1,
  "/type/enumeration":1
};
function is_literal_type(type_id) {
  return  LITERAL_TYPE_IDS[type_id] === 1;
};

/**
 * Get the type role looking at legacy/deprecated type hints,
 * /freebase/type_hints/mediator,
 * /freebase/type_hints/enumeration
 * as well as the new /freebase/type_hints/role.
 *
 * @param type:Object (required)
 * @param set:Boolean (optional) - Set type.role = mediator|cvt|enumeration|null if TRUE.
 */
function get_type_role(type, set) {
  var role = null;
  if (type["/freebase/type_hints/role"]) {
    if (type["/freebase/type_hints/role"].id === "/freebase/type_role/mediator") {
      role = "mediator";
    }
    else if (type["/freebase/type_hints/role"].id === "/freebase/type_role/cvt") {
      role = "cvt";
    }
    else if (type["/freebase/type_hints/role"].id === "/freebase/type_role/enumeration") {
      role = "enumeration";
    }
  }
  else if (type["/freebase/type_hints/mediator"]) {
    role = "mediator";
  }
  else if (type["/freebase/type_hints/enumeration"]) {
    role = "enumeration";
  }
  if (set) {
    type.role = role;
  }
  return role;
};



function user_clause(id, badges, options) {
  if (!id) {
    id = null;
  }
  var q = {
    "id": id,
    "name": null,
    "type": "/type/user"
  };
  if (badges) {
    extend(q, {
       "badges:/type/user/usergroup":  [{
         "key": {"namespace": "/freebase/badges"},
         "id": null,
         "name": null,
         "type": "/type/usergroup",
         "optional": true
       }]
    });
  }
  if (options) {
    extend(q, options);
  }
  return q;
};

function image_clause(options) {
  var q = {
    "optional": true,
    "id": null,
    "name": null,
    "type": "/common/image",
    "limit": 1,
    "link": {"timestamp": null},
    "index": null,
    "sort": ["index","link.timestamp"]
  };
  if (options) {
    extend(q, options);
  }
  return [q];
};

/**
 Generic clause for getting the "/common/topic/article" (or any /common/document)
 of an object.

 if current is true, the only the most recent article is returned
 **/
function article_clause(current, options) {
  var q = {
    "optional": true,
    "id": null
    //"creator": {"id": null, "name": null, "timestamp": null},
    //"/common/document/source_uri": null,
    //"/common/document/content": content_clause()
  };
  if (current) {
    extend(q, {
      "limit": 1,
      "timestamp": null,
      "sort": "-timestamp"
    });
  }
  if (options) {
    extend(q, options);
  }
  return [q];
};


function content_clause(options) {
  var q = {
    "optional": true,
    "id": null,
    "name": null,
    "limit": 1,
    "/type/content/blob_id": null,
    "/type/content/media_type": null,
    "/type/content/text_encoding": null,
    "/type/content/length": null,
    "/type/content/language": null
  };
  if (options) {
    extend(q, options);
  }
  return q;
};

