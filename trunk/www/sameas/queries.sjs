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
  var q = {
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
  return freebase.mqlread(q, {extended:1})
    .then(function(env) {
      return env.result["/common/topic/weblink"];
    });
};


var _NO_CATEGORY = {
  id: "_NO_CATEGORY",
  name: "_NO_CATEGORY"
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

