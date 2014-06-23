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
var _ = i18n.gettext;

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
    "/common/topic/article",
    "/common/topic/official_website",
    "/common/topic/social_media_presence",
    "/common/topic/topic_equivalent_webpage"
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
        filter: OBJECT_FILTERS.concat(props || []),
        limit: 0
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
          description: get_description(topic, type_map),
          notability: get_notability(topic),
          linkcount: get_linkcount(topic),
          flag: get_first_value(topic, "!/freebase/review_flag/item"),

          weblinks: get_weblinks(topic)

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

function get_latest_value(topic_result, prop) {
  var values = get_values(topic_result, prop);
  if (!values) {
    return null;
  } else if (!h.isArray(values)) {
    return values;
  }
  var latest_value = values[0];
  var latest_date = latest_value.timestamp;

  values.forEach(function(value){
    var date = value.timestamp;
    if (date > latest_date) {
      latest_value = value;
      latest_date = date;
    }
  });
  return latest_value;
}

function get_description(topic, tm) {
  var desc = null;
  var is_schema_object = tm["/type/type"] || tm["/type/domain"] || tm["/type/property"];

  // for schema objects return latest value (by timestamp)
  if (is_schema_object) {
    desc = get_latest_value(topic, "/common/topic/description");
    if (!desc) {
      var article = get_latest_value(topic, "/common/topic/article");
      if (article) {
        desc = get_first_value(article, "/common/document/text");
      }
    }
  } else {
    // Prefer wikipedia descriptions
    var values = get_values(topic, "/common/topic/description");
    if (values) {
      values.every(function(value) {
        if (h.is_wikipedia_description(value)) {
          desc = value;
          return false;
        }
        return true;
      });
    }
    if (!desc && values && values.length) {
      desc = values[0];
    }
    if (!desc) {
      var article = get_latest_value(topic, "/common/topic/article");
      if (article) {
        desc = get_first_value(article, "/common/document/text");
      }
    }
  }
  return desc;
}

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
 * All recognized usergroups that are displayed as badges
 * for users that belong to one or more groups.
 */
var BADGES = {
  BOT:              '/m/02h53f9',
  FREEBASE_EXPERTS: '/m/0432s8d',
  STAFF_GOOGLE:     '/m/02h53fj',
  STAFF_BOT:        '/m/0rz7ps8',
  STAFF_CL:         '/m/0rz7plz',
  STAFF_DE:         '/m/0rz7nkd',
  STAFF_IC:         '/m/0rz7p0t',
  STAFF_ICO:        '/m/0rz7qgp',
  STAFF_JS:         '/m/0rz7p9x',
  STAFF_OD:         '/m/0rz7pvw',
  STAFF_SS:         '/m/0vp75bj',
  STAFF_BS:         '/m/010jfnv7',
  STAFF_GL:         '/m/010jfq30',
  TOP_CONTRIBUTOR:  '/m/02h53fx'
};

/**
 * For a given user, get all "badges" or usergroups the user belongs
 * to in BADGES.
 * @return {!Array.<string>} List of usergroup or badge names.
 */
function get_user_badges(topic) {
  var badge_ids = [];
  for (var k in BADGES) {
    badge_ids.push(BADGES[k]);
  }
  return freebase.mqlread({
    id: topic.id,
    '/type/user/usergroup': [{
      mid: null,
      'id|=': badge_ids,
      name: null,
      optional: true
    }]
  }).then(function(env) {
    var badges = [];
    if (env.result && env.result['/type/user/usergroup'].length) {
      env.result['/type/user/usergroup'].forEach(function(usergroup) {
        badges.push(usergroup.name);
      });
    }
    return badges;
  }, function(err) {
    return [];
  });
};



/**
 * Get the relevant object banner info.
 * All object type relevant properties should be declared in the
 * properties section.
 * For example, we ask for "/freebase/type_hints/mediator" and
 * "/freebase/type_hints/enumeration" for /type/type and
 * we display whether or not the type is a MEDIATOR or ENUMERATION,
 * in the object banner.
 * @param {object} obj The object query result.
 * @param {string} obj_type The object type that matched in the object routing.
 * @return {promise} A list of banner info.
 */
function get_object_banners(obj, obj_type) {
  var banners = [];
  obj_type = obj_type.id;
  if (obj_type === '/type/domain') {
    var category = get_values(obj, '/freebase/domain_profile/category');
    if (category && h.is_commons_domain(category)) {
      banners.push(_('Commons domain'));
    }
    else if (h.is_commons_domain(obj)) {
      banners.push(_('Commons domain'));
    }
    else {
      banners.push(_('User domain'));
    }
  }
  else if (obj_type === '/type/type') {
    var deprecated = get_first_value(obj, '/freebase/type_hints/deprecated');
    var mediator = get_first_value(obj, '/freebase/type_hints/mediator');
    var enumeration = get_first_value(obj, '/freebase/type_hints/enumeration');
    var never_assert = get_first_value(
        obj, '/freebase/type_hints/never_assert');
    if (deprecated && deprecated.value === true) {
      banners.push(_('This type is Deprecated.'));
    }
    if (mediator && mediator.value === true) {
      banners.push(_('This is a Mediator.'));
    }
    if (enumeration && enumeration.value === true) {
      banners.push(_('This is an Enumerated Type.'));
    }
    if (never_assert && never_assert.value === true) {
      banners.push(_('This type is never asserted on a topic.'));
    }
  }
  else if (obj_type === '/type/property') {
    var deprecated = get_first_value(
        obj, '/freebase/property_hints/deprecated');
    var requires_permission = get_first_value(
        obj, '/type/property/requires_permission');
    var hidden = get_first_value(
        obj, '/freebase/property_hints/display_none');
    var disambiguator = get_first_value(
        obj, '/freebase/property_hints/disambiguator');
    var delegated = get_first_value(
        obj, '/type/property/delegated');
    if (deprecated && deprecated.value === true) {
      banners.push(_('This property is Deprecated.'));
    }
    if (requires_permission && requires_permission.value === true) {
      banners.push(_('This property requires permission.'));
    }
    if (hidden && hidden.value === true) {
      banners.push(_('This property is hidden by default.'));
    }
    if (disambiguator && disambiguator.value === true) {
      banners.push(_('This property is a disambiguator.'));
    }
    if (delegated && delegated.id) {
      banners.push({
        link: h.fb_url(delegated.id),
        text: _('This property is delegated to %s.'),
        text_for_link: delegated.id
      });
    }
    var types = get_values(obj, '/type/object/type') || [];
    types.every(function(t) {
      if (t.id === '/type/extension') {
        banners.push(_('This property is a mql extension.'));
        return false;
      }
      return true;
    });
  }
  return deferred.resolved(banners);
}

/**
 * Get /common/topic/official_website, /common/topic/social_media_presence,
 * /common/topic/topic_equivalent_webpage urls sorted by their domains
 * giving precedence to wikipedia.org. For wikipedia.org urls, sort the urls
 * with precedence to the current lang (i18n.lang).
 * @param {object} obj The object query result.
 * @return {Array.<object>} Where each object in the array has signature:
 *     <ul>
 *       <li>{domain} string The domain name (i.e., "wikipedia.org").</li>
 *       <li>{Array.<string>} urls The urls of this domain</li>
 *       <li>{string} favicon The domain favicon url.</li>
 *     </ul>
 */
function get_weblinks(topic) {
  var result = [];
  var official = get_values(topic, "/common/topic/official_website") || [];
  var social = get_values(topic, "/common/topic/social_media_presence") || [];
  var equivalent =
      get_values(topic, "/common/topic/topic_equivalent_webpage") || [];
  var all = official.concat(social).concat(equivalent);
  var by_domains = {};
  all.forEach(function(item) {
    var url = item.value;
    var domain = h.parse_uri(url).host;
    var favicon_host = domain;
    // handle http://mb-redir.freebaseapps.com -> musicbrainz
    if (domain === 'mb-redir.freebaseapps.com') {
      domain = 'musicbrainz.org';
      favicon_host = 'www.musicbrainz.org';
    }
    else {
      var parts = domain.split('.');
      if (parts.length &&
          (parts[0] == 'www' || h.endsWith(domain, '.wikipedia.org'))) {
        domain = parts.slice(1).join('.');
      }
      domain = domain.toLowerCase();
    }
    var d = by_domains[domain];
    if (!d) {
      d = by_domains[domain] = {
        domain: domain,
        urls: [],
        favicon: h.proxy_image_url('http://' + favicon_host + '/favicon.ico')
      };
      result.push(d);
    }
    d.urls.push(url);
  });
  var wikipedia = by_domains['wikipedia.org'];
  if (wikipedia) {
    // Since we don't have language mappings to wikipedial urls,
    // try all language codes for the current lang.
    // For example, for /lang/iw, try 'http://iw.wikipedia.org/...' and
    // 'http://he.wikipedia.org/...'.
    var lang_codes = i18n.LANGS_BY_ID[i18n.lang].key;
    var prefixes = lang_codes.map(function(l) {
      return 'http://' + l + '.';
    });
    wikipedia.urls.sort(function(a, b) {
      var nomatch = prefixes.every(function(prefix) {
        return !h.startsWith(a, prefix);
      });
      if (nomatch) {
        nomatch = prefixes.every(function(prefix) {
          return !h.startsWith(b, prefix);
        });
        if (nomatch) {
          return b < a;
        } else {
          return 1;
        }
      } else {
        return -1;
      }
    });
  }
  result.sort(function(a, b) {
    if (a.domain === 'wikipedia.org') {
      return -1;
    } else if (b.domain === 'wikipedia.org') {
      return 1;
    } else {
      return b.domain < a.domain;
    }
  });
  return result;
}

