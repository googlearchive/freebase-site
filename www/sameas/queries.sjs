/*
 * Copyright 2010, Google Inc.
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

var h = acre.require("lib/helper/helpers.sjs");
var i18n = acre.require("lib/i18n/i18n.sjs");
var freebase = acre.require("lib/promise/apis").freebase;
var deferred = acre.require("lib/promise/apis").deferred;

function keys(id, lang, limit) {
  lang = lang || i18n.lang;
  limit = limit || 1000;
  var q = {
    id: id,
    key: [{
      namespace: {
        id: null,
        "/base/sameas/web_id/authority": {
          optional: true,
          limit: 1,
          id: null,
          name: i18n.mql.text_clause(lang)
        },
        "!/common/uri_template/ns": {
          optional: true,
          template: null
        }
      },
      value: null,
      link: {
        timestamp: null,
        creator: {
          id: null,
          name: i18n.mql.text_clause(lang)
        }
      },
      limit: limit
    }]
  };
  return freebase.mqlread(q)
    .then(function(env) {
      var keys = [];
      env.result.key.forEach(function(k) {
        var namespace = k.namespace;
        var key = {
          authority: namespace["/base/sameas/web_id/authority"],
          ns: namespace.id,
          key: k.value,
          creator: k.link.creator,
          timestamp: k.link.timestamp
        };
        var template = namespace["!/common/uri_template/ns"];
        template = template && template.template;
        if (template) {
          key.template = template;
          key.url = template.replace(/\{key\}/, k.value);
        }
        keys.push(key);
      });
      function compare_key(a, b) {
        if (a.ns === b.ns) {
          return b.key < a.key;
        }
        return b.ns < a.ns;
      };
      keys.sort(function(a, b) {
        if (a.authority && b.authority) {
          if (a.authority.id === b.authority.id) {
            return compare_key(a, b);
          }
          return i18n.display_name(b.authority) < i18n.display_name(a.authority);
        }
        else if (a.authority) {
          return -1;
        }
        else if (b.authority) {
          return 1;
        }
        else {
          return compare_key(a, b);
        }
      });
    return keys;
  });
};

/**

[{
  "id": "/en/bob_dylan",
  "/common/topic/weblink": [{
    "key":         null,
    "url":         null,
    "template": {
      "id":       null,
      "name":     null,
      "ns": {
        "id": null,
        "/base/sameas/web_id/authority": {
          "id":       null,
          "optional": true
        }
      },
      "template": null
    },
    "category": {
      optional: true,
      id: null
    },
    "description": null
  }]
}]

 */

function weblinks(id) {
  var q = weblinks_mql(id);
  return freebase.mqlread(q, {extended:1})
    .then(function(env) {
      return env.result["/common/topic/weblink"];
    });
};

function weblinks_mql(id) {
  return {
    id: id,
    "/common/topic/weblink": [{
      optional: true,
      key: null,
      url: null,
      template: {
        id: null,
        ns: {
          id: null,
          "/base/sameas/web_id/authority": {
            optional: true,
            id: null,
            name: i18n.mql.query.name()
          }
        },
        template: null
      },
      category: {
        optional: true,
        id: null,
        name: i18n.mql.query.name()
      },
      description: null
    }]
  };
};


var _NO_CATEGORY = {
  id: "_NO_CATEGORY",
  name: "_NO_CATEGORY"
};

var _NO_AUTHORITY = {
  id: "_NO_AUTHORITY",
  name: "_NO_AUTHORITY"
};

function organized_weblinks(id) {

  return weblinks(id)
    .then(function(links) {

      var known_authorities = {};
      var webpages = [];
      var authorities = [];

      links.forEach(function(link) {
        // construct the weblink object
        var weblink = {
          key: link.key,
          url: link.url,
          description: link.description,
          template: link.template.template,
          ns: link.template.ns.id,
          category: link.category
        };

        // attach weblink object to authorities if it's topic equivalent
        if(link.category && link.category.id === '/en/topic_equivalent') {
          var authority = link.template.ns["/base/sameas/web_id/authority"] || _NO_AUTHORITY;
          var existing = known_authorities[authority.id];

          // If we haven't seen this authority yet add to the list
          if(!existing) {
            existing = known_authorities[authority.id] = h.extend({}, authority, {weblinks:[]});
            authorities.push(existing);
          }

          // push the weblink to the appropriate authority
          existing.weblinks.push(weblink);
        }

        // otherwise, attach to regular webpage object
        else {
          webpages.push(weblink);
        }
      });

      // sort weblinks within each authority alphabetically
      authorities.forEach(function(authority) {
        authority.weblinks.sort(weblink_sort);
      });

      // move unknown authorites to the end of the list for display
      for(i=0; i < authorities.length; i++) {
        if(authorities[i].id === '_NO_AUTHORITY') {
          var to_move = authorities.splice(i, 1);
          authorities.push(to_move[0]);
        }
      }

      var weblinks = {
        authorities: authorities,
        webpages: webpages
      }
      console.log('weblinks', weblinks);
      return weblinks;
    });
};

function weblinks_by_category(id) {

  return weblinks(id)
    .then(function(links) {
      var seen = {};
      var categories = [];
      links.forEach(function(link) {
        var category = link.category || _NO_CATEGORY;
        var existing = seen[category.id];
        if (!existing) {
          existing = seen[category.id] = h.extend({}, category, {weblinks:[]});
          categories.push(existing);
        }

        var weblink = {
          key: link.key,
          url: link.url,
          description: link.description,
          template: link.template.template,
          ns: link.template.ns.id,
          authority: link.template.ns["/base/sameas/web_id/authority"]
        };
        existing.weblinks.push(weblink);
      });
      categories.forEach(function(category) {
        category.weblinks.sort(weblink_sort);
      });
      return categories.sort(category_sort);
    });
};

function weblink_sort(a, b) {
  if (a.authority && b.authority) {
    return b.authority.id < a.authority.id;
  }
  else if (b.authority) {
    return 1;
  }
  else if (a.authority) {
    return -1;
  }
  return b.ns < a.ns;
};

function category_sort(a, b) {
  return b.id < a.id;
};

