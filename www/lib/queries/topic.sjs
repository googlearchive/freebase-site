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

var h = acre.require("helper/helpers.sjs");
var i18n = acre.require("i18n/i18n.sjs");
var freebase = acre.require("promise/apis.sjs").freebase;
var deferred = acre.require("promise/deferred.sjs");
var pq = acre.require("propbox/queries.sjs");
var ph = acre.require("propbox/helpers.sjs");

/**
 * Get topic data/structure from Topic API
 */
function topic(id, lang, limit, as_of_time, domains) {
  var params = {
    lang: [lang || "/lang/en"]
  };
  if (params.lang != "/lang/en") {
    params.lang.push("/lang/en");
  }
  params.lang.push("/lang/wp");
  if (limit) {
    params.limit = limit;
  }
  if (as_of_time) {
    params.as_of_time = as_of_time;
  }
  if (domains) {
    params.domains = domains;
  }
  var url = h.fb_api_url("/api/experimental/topic/full", id, params);
  return freebase.fetch(url)
    .then(function(env) {
      return env.result;
    })
    .then(function(result) {
      var props = result && result.properties;
      if (props) {
        /**
         * load image and article deep properties
         */
        var image_props = [];
        var article_props = [];
        var address_props = [];
        for (var prop_id in props) {
          var prop = props[prop_id];
          var ect = prop.expected_type.id;
          if (ect === "/common/image") {
            prop.id = prop_id;
            image_props.push(prop);
          }
          else if (ect === "/common/document") {
            prop.id = prop_id;
            article_props.push(prop);
          }
          else if (ect === "/location/mailing_address") {
            prop.id = prop_id;
            address_props.push(prop);
          }
        }

        var promises = [];

        if (image_props.length) {
          promises.push(get_image_deep_props(id, image_props, lang));
        }
        if (article_props.length) {
          promises.push(get_article_deep_props(id, article_props, lang));
        }
        if (address_props.length) {
          promises.push(get_address_cvt_props(id, address_props, lang));
        }

        return deferred.all(promises)
          .then(function(ps) {
            return result;
          });

      }
      return result;
    });
};

function get_image_deep_props(id, image_props, lang) {
  return image_deep_props(lang)
    .then(function(subprops) {
        return get_deep_props(id, image_props, subprops, lang);
    });
};

function image_deep_props(lang) {
  return pq.prop_structures("/type/object/name",
                            "/type/object/creator",
                            "/type/content/uploaded_by",
                            "/common/image/rights_holder_text_attribution",
                            "/common/licensed_object/license",
                            lang);
};


function get_deep_props(id, props, subprops, lang) {
  var promises = [];
  props.forEach(function(prop) {
    prop.properties = subprops;
    prop.values.forEach(function(value) {
      promises.push(deep_props_query(id, prop, value, lang));
    });
  });

  return deferred.all(promises)
    .then(function() {
      return props;
    });
};

function deep_props_query(id, prop, value, lang) {
  return pq.prop_data(id, prop, value.id, lang)
    .then(function(result) {
      result.forEach(function(data) {
        prop.properties.forEach(function(subprop) {
           subprop = h.extend({}, subprop);
           subprop.values = [];
           data[subprop.id].forEach(function(subdata) {
             subprop.values.push(ph.minimal_prop_value(subprop, subdata, lang));
           });
           value[subprop.id] = subprop;
        });
      });
    });
};

function get_article_deep_props(id, article_props, lang) {
  return article_deep_props(lang)
    .then(function(subprops) {
      return get_deep_props(id, article_props, subprops, lang);
    })
    .then(function(result) {
      // fetch blurbs for each article value
      var blurbs = [];
      article_props.forEach(function(article_prop) {
        article_prop.values.forEach(function(value) {
          blurbs.push(i18n._get_blob.closure(value, "blurb", {maxlength:32}, "text"));
        });
      });
      return deferred.all(blurbs)
        .then(function() {
          return result;
        });
    });
};

function article_deep_props(lang) {
  return pq.prop_structures("/type/object/creator",
                            "/type/object/timestamp",
                            "/common/document/source_uri",
                            "/common/document/content",
                            lang);
};


function get_address_cvt_props(id, address_props, lang) {
  return address_cvt_props(lang)
    .then(function(subprops) {
      return get_deep_props(id, address_props, subprops, lang);
    })
    .then(function(result) {

      console.log("get_address_cvt_props", result);

      return result;
    });
};


function address_cvt_props(lang) {
  return pq.prop_structures("/location/mailing_address/street_address",
                            "/location/mailing_address/citytown",
                            "/location/mailing_address/state_province_region",
                            "/location/mailing_address/postal_code",
                            "/location/mailing_address/country",
                            lang);
};
