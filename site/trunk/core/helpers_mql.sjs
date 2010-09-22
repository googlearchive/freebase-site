var exports = {
  "is_literal_type": is_literal_type,
  "get_type_role": get_type_role
};

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
  var type_hints_role = type["/freebase/type_hints/role"];
  if (type_hints_role) {
    if (typeof type_hints_role === "object") {
      type_hints_role = type_hints_role.id;
    }
    if (type_hints_role === "/freebase/type_role/mediator") {
      role = "mediator";
    }
    else if (type_hints_role === "/freebase/type_role/cvt") {
      role = "cvt";
    }
    else if (type_hints_role === "/freebase/type_role/enumeration") {
      role = "enumeration";
    }
  }
  else if (type["/freebase/type_hints/mediator"] === true) {
    role = "mediator";
  }
  else if (type["/freebase/type_hints/enumeration"] === true) {
    role = "enumeration";
  }
  if (set) {
    type.role = role;
  }
  return role;
};

