var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");

/**
 * return a triples data structure.
 * where s=subject, p=predicate and o=object.
 * In addition, a mql query representing the triple is provided.
 *
 * @param subject:String - mql id
 * @param predicate:String - mql property
 * @param object:Object - the object {id:String} or {value:String, lang:String(optional), namespace:String(optional)}
 */
function triple(subject, predicate, object) {
  var o = {
    s: subject,
    p: predicate
  };
  if ("id" in object) {
    o.o = {id: object.id};
  }
  else if ("value" in object) {
    o.o = {value: object.value};
    ["lang", "namespace"].forEach(function(key) {
      if (key in object) {
        o.o[key] = object[key];
      }
    });
    if (object.link && object.link.target_value && object.link.target_value.lang) {
      o.o.lang = object.link.target_value.lang;
    }
  }
  o.mql = {id: subject};
  o.mql[predicate] = h.extend({}, o.o);
  o.mql = JSON.stringify(o.mql);
  return o;
};



function tipattrs(type, id, attrs) {
  attrs = attrs || {};
  var c = attrs["class"];
  if (c) {
    c = h.sprintf("%s %s", c, tipclass(type, id));
  }
  else {
    c = tipclass(type, id);
  }
  attrs["class"] = acre.markup.stringify(acre.markup.bless(c));
  return attrs;
};

function tipclass(type, id) {
  return h.sprintf("%s %s", type, JSON.stringify({id:id}));
};
