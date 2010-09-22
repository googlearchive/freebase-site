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

