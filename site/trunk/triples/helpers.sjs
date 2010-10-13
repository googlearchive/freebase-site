var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");
var i18n = mf.require("i18n", "i18n");
var _ = i18n.gettext;

/**
 * return a triples data structure.
 * where s=subject, p=predicate and o=object.
 * In addition, a mql query representing the triple is provided.
 *
 * @param subject:String - mql id
 * @param predicate:String - mql property
 * @param object:Object - the object {id:String} or {value:String, lang:String(optional), namespace:String(optional)}
 */
function triple(subject, predicate, object, namespace, value) {
  var o = {
    s: subject,
    p: predicate
  };
  if (namespace && value) {
    o.o = {namespace:namespace, value:value};
  }
  else if ("id" in object) {
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

/**
 * Receive an object and it's list of types
 * return most relevant one
 * @param map: Object - a key and an ID
 * @param object: Object - the topic we are dealing with
 */
function get_object_kind(map, object) {
  console.log(map);

  var object_kind = "";

  if (map["/freebase/apps/acre_app"]) {
    object_kind = _("Acre App");
  }

  else if (map["/type/domain"]) {
    object_kind = "Domain";
    if (object.id.indexOf("/base") === 0 || object.id.indexOf("/user") === 0) {
      object_kind = _("User Domain"); 
    }
    else {
      object_kind = _("Domain"); 
    }
  }

  else if (map["/type/type"]) {
    if (object["/freebase/type_hints/mediator"] === true) {
      object_kind = _("Mediator");
    }
    else if (object["/freebase/type_hints/enumeration"] === true) {
      object_kind = _("Enumerated Type");
    }
    else {
      object_kind = _("Type"); 
    }
  }

  else if (map["/freebase/query"]) {
    object_kind = _("Collection");
  }

  else if (map["/type/property"]) {
    object_kind = _("Property");
  }

  else if (map["/type/user"] || map["/freebase/user_profile"]) {
    object_kind = _("User Profile"); 
  }

  else if (map["/common/image"]) {
    object_kind = _("Image");
  }

  else if (map["/common/document"]) {
    object_kind = _("Article");
  }

  else if (map["/common/topic"]) {
    object_kind = _("Topic");
  }
  
  return object_kind;

}

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

function format_number(n) {
  if (n < 10) {
    return "<10";
  }
  var i;
  for (i=20; i<100; i+=10) {
    if (n < i) {
      return h.sprintf("%s+", (i-10));
    }
  }
  for (i=200; i<1000; i+=100) {
    if (n < i) {
      return h.sprintf("%s+", (i-100));
    }
  }
  if (n < 10000) {
    return h.sprintf("%sk", Math.round(n/100)/10);
  }
  return h.sprintf("%sk", i18n.format_number(Math.round(n/1000)));
};

function is_valid(link) {
  return (link.valid === false) ? false : true;
};

function valid_class(link) {
  return is_valid(link) ? "valid": "invalid";
};

function link_class(link) {
  var operation = "";
  if (link.operation != null) {
    operation = link.operation;
  }
  return h.trim(h.sprintf("%s %s", valid_class(link), operation));
};
