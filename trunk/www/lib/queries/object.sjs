/*
* Copyright 2012, Google Inc.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
*     * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above
* copyright notice, this list of conditions and the following disclaimer
* in the documentation and/or other materials provided with the
* distribution.
*     * Neither the name of Google Inc. nor the names of its
* contributors may be used to endorse or promote products derived from
* this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
var h = acre.require("helper/helpers.sjs");
var deferred = acre.require("promise/deferred");
var freebase = acre.require("promise/apis").freebase;
var i18n = acre.require("i18n/i18n.sjs");

/* default filters we need for any object */
var OBJECT_FILTERS = [ 
    "/type/object", 
    "/dataworld/gardening_hint/replaced_by",
    "/freebase/object_profile/linkcount",
    "!/freebase/review_flag/item",
    "/common/topic/notable_types", 
    "/common/topic/notable_for", 
    "/common/topic/image",
    "/common/topic/description",

    /* TODO: remove these once transition to /common/topic/description is complete */
    "/common/topic/article",
    "/freebase/documented_object/documented_object_tip"
];

/**
 * Basic freebase object information
 *
 * The returned object is used to drive object routing 
 * and the display of the object masthead.
 *
 * @param id:String
 * @param props:Array - additional properties needed by routing rules
 */
function object(id, props) {
    var api_options = {
        lang: h.lang_code(i18n.get_lang(true)),
        filter: OBJECT_FILTERS.concat(props || [])
    };
    return freebase.get_topic(id, api_options)
      .then(function(topic) {
        var types = get_values(topic, "/type/object/type") || [];
        var type_map = (types && types.length) ? h.map_array([].concat(types), "id") : {};
        type_map["/type/object"] = true; // all objects are implicitly /type/object

        return {
          id: id, /* TODO - use_mid in routing rules trumps TT id canonicalization for now */
          type: types,
          type_map: type_map,
          property: topic.property,

          mid: get_first_value(topic, "/type/object/mid").value,
          name: get_first_value(topic, "/type/object/name"),
          replaced_by: get_first_value(topic, "/dataworld/gardening_hint/replaced_by"),
          attribution: get_first_value(topic, "/type/object/attribution"),
          timestamp: get_first_value(topic, "/type/object/timestamp").value,
          image: get_first_value(topic, "/common/topic/image"),

          permission: get_permission(topic),
          description: get_description(topic),
          notability: get_notability(topic),
          linkcount: get_linkcount(topic),
          flag: get_first_value(topic, "!/freebase/review_flag/item")
        };
      });
};

function get_values(topic_result, prop) {
  var props = topic_result.property;
  return (props && props[prop] && props[prop].values) ? props[prop].values : null;
};

function get_first_value(topic_result, prop) {
  var values = get_values(topic_result, prop);
  return values ? h.first_element(values) : null;
}

function get_description(topic) {
  var description = null;
  ["/common/topic/description", 
   "/freebase/documented_object/documented_object_tip"].every(function(prop) {
    description = get_first_value(topic, prop);
    return description === null;
  });
  if (!description) {
    var doc = get_first_value(topic, "/common/topic/article");
    if (doc) {
      description = get_first_value(doc, "/common/document/text");
    }
  }
  return description;
};

function get_permission(topic) {
  var permission = get_first_value(topic, "/type/object/permission");
  if (permission && (permission.id === "/boot/all_permission")) {
    permission = null;
  }
  return permission;
};

/**
 * Given topic result with notable_types and notable_for,
 * return the first notable_types and first notable_for values.
 * If object result does not have notable_types
 * nor notable_for, return null.
 */
function get_notability(topic) {
  var notable_type = get_first_value(topic, "/common/topic/notable_types");
  var notable_for = get_first_value(topic, "/common/topic/notable_for");
  if (notable_type || notable_for) {
    return {
      notable_type: notable_type,
      notable_for: notable_for
    };
  }
  return null;
};

/**
 * Given topic result (with /freebase/object_profile/linkcount),
 * return the linkcount structure. If /freebase/object_profile/linkcount does
 * not exist, return null.
 */
function get_linkcount(topic) {
    return get_values(topic, "/freebase/object_profile/linkcount");
}

/**
 * promise to get saved queries
 */
function get_query(topic) {
  var value = get_first_value(topic, "/common/document/text");
  var query = (value && value.value) ? JSON.parse(value.value) : null;
  return deferred.resolved(query);
};

/**
 * User badge selection
 * 
 * @param o:Object - The object query result
 */
function get_user_badge(topic) {
  var usergroups = get_values(topic, "/type/user/usergroup");
  var label = null;

  if (usergroups) {
    var group_ids = h.map_array(usergroups, "id");

    /* TODO: Topic Tables should retain IDs for /type/usergroups */
    /* /en/current_metaweb_staff */
    if (group_ids["/m/02h53fj"]) {
      label = "Staff";
    }
    /* /freebase/badges/freebaseexpert */
    else if (group_ids["/m/0432s8d"]) {
      label = "Expert";
    }
    /* /freebase/badges/topcontributor */
    else if (group_ids["/m/02h53fx"]) {
      label = "Top User"
    }
    /* /freebase/bots */
    else if (group_ids["/m/02h53f9"]) {
      label = "Bot"
    }
  }

  return deferred.resolved(label);
};

/* Total topic count for the homepage */
function topic_count() {
  var q = {
    "id": "/common/topic",
    "/freebase/type_profile/instance_count": null
  };
  return freebase.mqlread(q)
    .then(function(env) {
      return env.result;
    })
    .then(function(r) {
      return r["/freebase/type_profile/instance_count"];
    });
};


