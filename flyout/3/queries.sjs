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
var h = acre.require("lib/helper/helpers.sjs");
var validators = acre.require("lib/validator/validators.sjs");
var apis = acre.require("lib/promise/apis.sjs");
var freebase = apis.freebase;
var deferred = apis.deferred;
var creator = acre.require("lib/queries/creator.sjs");
var apps_queries = acre.require("lib/queries/apps.sjs");
var i18n = acre.require("lib/i18n/i18n.sjs");
var _ = i18n.gettext;
var object_query = acre.require("site/queries/object.sjs");

/**
 * Flyout for /freebase/apps/acre_app
 * - Released to <url>
 * - Is a clone of <original app>
 * - Has been cloned <n times>
 * - Latest version <version>
 */
function acre_app(object, lang) {
    var id = object.id;
    var resource = validators.AcreResource(id);
    return apps_queries.get_app(resource)
      .then(function(app) {
          var summary = [];
          var host = h.first_element(app.hosts);
          if (host) {
              summary.push([_("Released to"), "http://" + host.host]);
          }
          if (app.parent && app.paranet.id !== "/freebase/apps/seed") {
              summary.push([_("Is a clone of"), app.parent.id]);
          }
          if (app.children) {
              var cloned = app.children.length;
              if (cloned) {
                  summary.push([_("Has been cloned"),
                      cloned > 1 ? h.sprintf(_("%s times"), cloned) : _("1 time")]);
              }
          }
          if (app.all_versions) {
              var current = h.first_element(app.all_versions);
              if (current) {
                  summary.push([_("Latest version"), h.sprintf("%s (%s)", current.name, h.relative_date(acre.freebase.date_from_iso(current.as_of_time)))]);
              }
          }
          return flyout_promise(object, lang, {
              label: _("Acre App"),
              summary: summary
          });
      });
};

/**
 * Flyout for /type/domain
 * - Created by <user>
 * - Types include <types>
 */
function domain(object, lang) {
    var id = object.id;
    return freebase.mqlread(
        creator.extend({
            id: id,
            type: "/type/domain",
            types: [{
                optional: true,
                id: null,
                name: i18n.mql.text_clause(lang),
                index: null,
                sort: "index"
            }],
            "/freebase/domain_profile/category": {
                optional: true,
                id: "/category/commons"
            }
        }))
        .then(function(env) {
            var domain = env.result;
            var summary = [];
            summary.push([_("Created by"), h.id_key(h.get_attribution(domain).creator)]);
            if (domain.types && domain.types.length) {
                var types = domain.types.map(function(type) {
                    var name = i18n.mql.get_text(lang, type.name);
                    return name && name.value || type.id;
                });
                summary.push([_("Types include"), types.slice(0, 3)]);
            }
            return flyout_promise(object, lang, {
                label: domain_label(domain),
                summary: summary
            });
        });
};

/**
 * Flyout for /type/type
 * - In <domain>
 * - Properties include <properties>
 */
function type(object, lang) {
    var id = object.id;
    return freebase.mqlread({
        id: id,
        type: "/type/type",
        domain: {
            id: null,
            name: i18n.mql.text_clause(lang),
            "/freebase/domain_profile/category": {
                optional: true,
                id: "/category/commons"
            }
        },
        properties: [{
            optional: true,
            id: null,
            name: i18n.mql.text_clause(lang),
            index: null,
            sort: "index"            
        }]
    })
    .then(function(env) {
        var type = env.result;
        var summary = [[_("In"), domain_name_label(type.domain, lang)]];
        if (type.properties && type.properties.length) {
            var props = type.properties.map(function(prop) {
                var name = i18n.mql.get_text(lang, prop.name);
                return name && name.value || prop.id;
            });
            summary.push([_("Properties include"), props.slice(0, 3)]);
        }
        return flyout_promise(object, lang, {
            label: _("Schema"),
            summary: summary
        });
    });
};

function domain_label(domain) {
    if (domain["/freebase/domain_profile/category"] &&
        domain["/freebase/domain_profile/category"].id === "/category/commons") {
        return _("Commons");
    }
    else if (/^\/base\//.test(domain.id)) {
        return _("Base");
    }
    else if (/^\/user\//.test(domain.id)) {
        return _("User Domain");
    }
    else {
        return _("Domain");
    }
}
function domain_name_label(domain, lang) {
    var name = i18n.mql.get_text(lang, domain.name);
    name = name && name.value || domain.id;
    return h.sprintf("%s %s", name, domain_label(domain));
}

/**
 * Flyout for /type/property
 * - From <type>
 * - In <domain>
 */
function property(object, lang) {
    var id = object.id;
    return freebase.mqlread({
        id: id,
        type: "/type/property",
        schema: {
            id: null,
            name: i18n.mql.text_clause(lang),
            domain: {
                id: null,
                name: i18n.mql.text_clause(lang),
                "/freebase/domain_profile/category": {
                    optional: true,
                    id: "/category/commons"
                }
            }       
        },
        "/freebase/documented_object/tip": i18n.mql.text_clause(lang)
    })
    .then(function(env) {
        var prop = env.result;
        var type = prop.schema;
        var type_name = i18n.mql.get_text(lang, type.name);
        type_name = type_name && type_name.value || type.id;
        var summary = [
            [_("From"), h.sprintf(_("%s Schema"), type_name)],
            ["In", domain_name_label(type.domain, lang)]
        ];
        // override article with "/freebase/documented_object/tip"
        var tip = i18n.mql.get_text(lang, prop["/freebase/documented_object/tip"]);
        var result = {
            label: _("Property"),
            summary: summary
        };
        if (tip) {
            result.article = tip.value;
        }
        return flyout_promise(object, lang, result);
    });
};

/**
 * Flyout for /type/user
 * - Member since <timestamp>
 * - /freebase/user_profile/my_full_name
 * - /freebase/user_profile/location
 * - Owns <domains>
 */
function user(object, lang) {
    var id = object.id;
    var promises = {
        user: freebase.mqlread({
                id: id,
                type: "/type/user",
                timestamp: null,
                "/freebase/user_profile/my_full_name": i18n.mql.text_clause(lang),
                "/freebase/user_profile/location": {
                    optional: true,
                    name: i18n.mql.text_clause(lang)
                }
            })
            .then(function(env) {
                return env.result;
            }),
        domains: freebase.mqlread([{
                id: null,
                type: "/type/domain",
                name: i18n.mql.text_clause(lang),
                "/freebase/domain_profile/category": {
                    optional: true,
                    id: "/category/commons"
                },
                "forbid:type": {
                    "id": "/freebase/apps/application",
                    "optional": "forbidden"
                },
                owners: {
                    member: {
                        id: id
                    }
                }
            }])
            .then(function(env) {
                return env.result;
            })
    };
    return deferred.all(promises)
        .then(function(result) {
            var u = result.user;
            var domains = result.domains;
            var summary = [
                [_("Member since"), u.timestamp.split("T").shift()]
            ];
            var full_name = u["/freebase/user_profile/my_full_name"];
            full_name = i18n.mql.get_text(lang, full_name);
            if (full_name) {
                summary.push([full_name.value]);
            }
            var location = u["/freebase/user_profile/location"];
            location = location && i18n.mql.get_text(lang, location.name);
            if (location) {
                summary.push([location.value]);
            }
            if (domains) {
                var list = domains.map(function(d) {
                    return domain_name_label(d, lang);
                });
                summary.push([_("Owns"), list.slice(0, 3)]);
            }
            return flyout_promise(object, lang, {
                label: _("User"),
                summary: summary
            });
        });
};

/**
 * Flyout for /freebase/query
 * - Created by <user>
 * - On <timestamp>
 */
function query(object, lang) {
    var id = object.id;
    return freebase.mqlread(
        creator.extend({
            id: id,
            type: "/freebase/query",
            timestamp: null
        }))
        .then(function(env) {
            var r = env.result;
            var summary = [
                [_("Created by"), h.id_key(h.get_attribution(r).creator)],
                [_("On"), r.timestamp.split("T").shift()]
            ];
            return flyout_promise(object, lang, {
                label: _("Query"),
                summary: summary
            });
        });
};

/**
 * Flyout for /common/image
 * - License
 * - Appears in <topic>
 * - Uploaded by <user>
 * - Media type
 */
function image(object, lang) {
    var id = object.id;
    return freebase.mqlread({
        id: id,
        type: "/common/image",
        "/common/licensed_object/license": {
            optional: true,
            limit: 1,
            name: i18n.mql.text_clause(lang)
        },
        "!/common/topic/image": {
            optional: true,
            limit: 1,
            name: i18n.mql.text_clause(lang)
        },
        "/type/content/uploaded_by": {
            optional: true,
            id: null
        },
        "/type/content/media_type": {
            optional: true,
            name: i18n.mql.text_clause(lang)
        }
    })
    .then(function(env) {
        var r = env.result;
        var summary = [];
        var license = r["/common/licensed_object/license"];
        license = license && i18n.mql.get_text(lang, license.name);
        if (license) {
            summary.push([_("License"), license.value]);
        }
        var topic = r["!/common/topic/image"];
        topic = topic && i18n.mql.get_text(lang, topic.name);
        if (topic) {
            summary.push([_("Appears in"), topic.value]);
        }
        var uploaded_by = r["/type/content/uploaded_by"];
        if (uploaded_by) {
            summary.push([_("Uploaded by"), h.id_key(uploaded_by.id)]);
        }
        var media_type = r["/type/content/media_type"];
        media_type = media_type && i18n.mql.get_text(lang, media_type.name);
        if (media_type) {
            summary.push([_("Media type"), media_type.value]);
        }
        return flyout_promise(object, lang, {
            label: _("Image"),
            summary: summary,
            image: id
        });
    });
};

/**
 * Flyout for /book/book_edition
 * - book_edition.book summary
 */
function book_edition(object, lang) {
    var promises = {
        edition: topic(object, lang),
        book: freebase.mqlread({
                id: object.id,
                type: "/book/book_edition",
                book: object_query.mql(null)
            })
            .then(function(env) {
                return object_query.callback(env.result.book);
            })
            .then(function(book) {
                return topic(book, lang);
            })
    };
    return deferred.all(promises)
        .then(function(result) {
            var edition = result.edition;
            var book = result.book;
            if (book.summary.length) {
                // insert book author at the beginning
                edition.summary.splice(0, 0, book.summary[0]);
                edition.summary = edition.summary.concat(book.summary.slice(1));
            }
            ["article", "image"].forEach(function(key) {
                var val = book[key];
                if (val) {
                    edition[key] = val;
                }
            });
            return edition;
        });
};

/**
 * Flyout for /common/topic
 * Using freebase.get_topic with filter=suggest, get all
 * /synthetic/notability/notable_property name,value pairs
 */
function topic(object, lang) {
    var id = object.id;
    return freebase.get_topic(id, {
            alldata: true,
            lang: h.lang_code(lang || "/lang/en"),
            filter: "suggest"
        })
        .then(function(topic_api_result) {
            var summary = [];
            var notability = [id];
            var p = topic_api_result && topic_api_result.property;
            if (p) {
                var notability_props = p["/synthetic/notability/notable_properties"];
                notability_props = notability_props && notability_props.values;
                if (notability_props && notability_props.length) {
                    // notability properties is in reverse order
                    notability_props.reverse();
                    notability_props.forEach(function(notability_prop) {
                        var prop = notability_prop.property["/synthetic/notable_for/property"].values;
                        if (prop.length === 1) { // skip CVTs for now
                            prop = prop[0];
                            var values = p[prop.id];
                            values = values && values.values;
                            if (values && values.length) {
                                var prop_name = notability_prop.text;
                                var prop_value = values[0].text;
                                summary.push([prop_name, prop_value]);
                            }
                        }
                    });
                }
                var notable_types = p["/synthetic/notability/notable_types"];
                notable_types = notable_types && notable_types.values;
                if (notable_types && notable_types.length) {
                    notability = notable_types.map(function(t) {
                        return t.text;
                    }).slice(0, 3);
                }
            }
            return flyout_promise(object, lang, {
                summary: summary.slice(0, 3),
                notability: notability.join(", ")
            });
        });
};

function unknown(object, lang) {
    return flyout_promise(object, lang);
};


/**
    name:String,
    label:String,
    image:MqlId,
    article:String,
    summary:Array,
    notability:Array
**/
function flyout_promise(object, lang, flyout) {
    flyout = flyout || {};
    if (!flyout.name) {
        if (object.name.length) {
            flyout.name = object.name[0].value;
        }
        else {
            flyout.name = object.id;
        }
    }
    if (!flyout.image && object.image.length) {
        // There is an image associated with this topic,
        // thus use image api with this topic
        flyout.image = object.id;
    }
    if (!flyout.summary) {
        flyout.summary = [];
    }
    if (!flyout.notability) {
        flyout.notability = object.id;
    }
    if (!flyout.article && object.article) {
        // There is an article associated with this topic,
        // thus use text api to get the article
        return freebase.get_blob(object.id, "plain", {lang:h.lang_code(lang)})
            .then(function(blob) {
                flyout.article = blob.body;
                return flyout;
            }, function(err) {
                flyout.article = null;
                return flyout;
            });
    }
    return deferred.resolved(flyout);
};
