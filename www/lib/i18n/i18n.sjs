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
var validators = acre.require('validator/validators.sjs');
var topscope = this.__proto__;

/**
 * acre.require METADATA over-ride to use handlers/js_to_sjs_handler.sjs
 * for "*.js" files.
 */
var JS_TO_SJS = {
    handlers: {
        js_to_sjs: acre.current_script.app.path + "/handlers/js_to_sjs_handler.sjs"
    },
    extensions: {
        "js": {
            handler: "js_to_sjs"
        }
    }
};

/**
 * Load the Globalize library (js) as
 * a server-side libarary (sjs).
 *
 * This will set Globalize as a "global" variable in the topscope of acre.
 * This is necessary to use the Globalize library "as-is" including all
 * of it's culture info that depend on a "global" Globalize variable.
 *
 * Globalize cultures and bundles, expect a global "Globalize" variable
 * where the simple act of acre.require(...) (server-side) or
 * <script src=...> (client-side) will modify and extend this global
 * variable.
 */
var Globalize = topscope.Globalize;
if (!Globalize) {
    Globalize = topscope.Globalize = acre.require("globalize/globalize.js", JS_TO_SJS).Globalize;
}

/**
 * Google Language Tiers
 *
 * @see https://sites.google.com/a/google.com/40-language-initiative/home/language-details
 *
 * Each of these language codes *MUST* must correspond to a freebase lang id:
 *
 *  "xx[-YY]*" => "/lang/xx[-YY]*"
 */
var LANG_TIERS = [
    "en",
    "en-US",
    "ar",
    "zh-CN",
    "zh-TW",
    "nl",
    "en-GB",
    "fr",
    "de",
    "it",
    "ja",
    "ko",
    "pl",
    "pt",
    "ru",
    "es",
    "th",
    "tr",
    "es-419",
    "bg",
    "ca",
    "hr",
    "cs",
    "da",
    "fil",
    "fi",
    "el",
    "iw",
    "hi",
    "hu",
    "id",
    "lv",
    "lt",
    "no",
    "pt-PT",
    "ro",
    "sr",
    "sk",
    "sl",
    "sv",
    "uk",
    "vi",
    "fa",
    "af",
    "am",
    "bn",
    "et",
    "is",
    "ms",
    "mr",
    "sw",
    "ta",
    "zu",
    "eu",
    "zh-HK",
    "fr-CA",
    "gl",
    "gu",
    "kn",
    "ml",
    "te",
    "ur",
    "km",
    "lo",
    "ne",
    "si",
    "dz"
];

var CULTURE_MAP = {
    "iw": "he",        // Globalize uses he
    "es-419": "es-MX", // there is no es-419 in Globalize, just use Mexico's
    "dz": "en"         // this is no dz in Globalize
};

/**
 * Load lang info (from mql) that match each LANG_TIERS code.
 * Each lang info's id and key will directy correspond to
 * each LANG_TIERS code. For example for "zh-CN", the lang info will
 * be {id: "/lang/zh-CN", key: "zh-CN"}. The id and key will be the
 * canonical lang id and code used by freebase-site.
 *
 * LANGS will be cached so that we don't query it every time i18n.sjs
 * is required.
 */
var LANGS = acre.cache.request.get("i18n.LANGS");

/**
 * A lang may have multiple keys, therefor multiple ids. For example
 * /lang/zh, /lang/zh-cn, /lang/zh-hans, /lang/zh-CN, /lang/zh-Hans
 * all point to the same lang. LANGS_BY_ID and LANGS_BY_CODE
 * are maps of the lang id and code, respectively, to the lang info,
 * containing the canonical lang id and code used by freebase-site.
 */
var LANGS_BY_ID = {};
var LANGS_BY_CODE = {};
if (!LANGS) {
    var ids = [];
    var codes = {};
    LANG_TIERS.forEach(function(key) {
        codes[key] = 1;
        ids.push("/lang/" + key);
    });
    var q = [{
        id: null,
        "id|=": LANG_TIERS.map(function(key) {
            return "/lang/" + key;
        }),
        "key": [],
        "m:id": null,
        name: null
    }];
    LANGS = acre.freebase.mqlread(q).result;
    acre.cache.request.put("i18n.LANGS", LANGS);
}

LANGS.forEach(function(l) {
    if (!l.name) {
        l.name = l.id;
    }
    l.key.forEach(function(key) {
        LANGS_BY_ID["/lang/" + key] = l;
        LANGS_BY_CODE[key] = l;
    });
});

/**
 * This is the current lang id which correspond to a lang code in the LANG_TIERS.
 * This MAY NOT be the default mql id. Use mql_lang for the dfeault mql id.
 * For example, "/lang/zh-CN" is specified by the LANG_TIERS
 * but mql returns "/lang/zh" as the default id.
 *
 * This is set in set_lang()
 */
var lang = null;
var lang_code = null;
var mql_lang = null;
var mql_lang_code = null;

/**
 * Get the current canonical lang id.
 * If get_mql_id is TRUE, get the canonical mql id.
 * Otherwise, get the the canonical id specified by the LANG_TIERS.
 * If for_lang is specified, get the canonical lang id for that lang
 * in LANGS_BY_ID lookup.
 *
 * If current lang is "/lang/zh-CN",
 *
 * get_lang()                    // returns "/lang/zh-CN"
 * get_lang(true)                // returns "/lang/zh"
 * get_lang(false, "/lang/zh")   // returns "/lang/zh-CN"
 * get_lang(true, "/lang/zh-CN") // returns "/lang/zh"
 *
 * @param get_mql_id:Boolean
 * @param for_lang_or_code:String - Can be a lang id or code
 */
function get_lang(get_mql_id, for_lang_or_code) {
    if (for_lang_or_code) {
        var id = h.lang_id(for_lang_or_code);
        var l = LANGS_BY_ID[id];
        if (l) {
            return get_mql_id ? l["m:id"] : l.id;
        }
        else {
            return for_lang_or_code;
        }
    }
    else {
        return get_mql_id ? mql_lang : lang;
    }
};

/**
 * Like get_lang() but returns the lang code.
 * If current lang is "/lang/zh-CN",
 *
 * get_lang_code()              // returns "zh-CN"
 * get_lang_code(true)          // returns "zh"
 * get_lang_code(false, "zh")   // returns "zh-CN"
 * get_lang_code(true, "zh-CN") // returns "zh"
 */
function get_lang_code(get_mql_code, for_lang_or_code) {
    if (for_lang_or_code) {
        var code = h.lang_code(for_lang_or_code);
        var l = LANGS_BY_CODE[code];
        if (l) {
            return get_mql_code ? h.lang_code(l["m:id"]) : h.lang_code(l.id);
        }
        else {
            return for_lang_or_code;
        }
    }
    else {
        return get_mql_code ? mql_lang_code : lang_code;
    }
};


///////////
// gettext
///////////

/**
 * gettext accepts a msgid in the string bundle.
 * If the string bundle does not exist or the msgid does not exist in the string bundle,
 * just returns msgid.
 */
var last_bundle_app = acre.request.script.app.host;
function gettext(msgid) {
  var culture_code = get_globalize_culture_lang_code();
  if (last_bundle_app != acre.request.script.app.host) {
      var app = null;
      try {
          app = acre.get_metadata("//bundles." + acre.request.script.app.host);
      }
      catch (ex) {
          // some apps do not have a bundle
      }
      var bundle = "globalize.bundle." + culture_code + ".js";
      if (app && app.files[bundle]) {
        // Requiring a bundle will extend the global "Globalize" variable
        acre.require(app.path + "/" + bundle, JS_TO_SJS);
      }
      last_bundle_app = acre.request.script.app.host;
  }
  var msg = Globalize.localize(msgid, culture_code);
  if (msg == null) {
      msg = Globalize.localize(msgid, "default");
  }
  if (msg == null) {
      // We still didn't find a localized string. Just echo back the msgid
      msg = msgid;
  }
  return msg;
};


/////////////////
// view helpers
/////////////////

/**
 * Get the display name of a topic. If null, return default_value or topic id.
 */
function display_name(obj, default_value, key, in_lang) {
  if (!key) {
    key = "name";
  }
  if (default_value == null) {
    default_value = obj.id;
  }
  return display_text(obj, default_value, key, in_lang);
};

/**
 * Get the display text of obj[key]. If null, return default_value.
 */
function display_text(obj, default_value, key, in_lang) {
  var text = mql.result.text(obj[key]);
  if (text) {
    return text.value;
  }
  if (default_value != null) {
    return default_value;
  }
  return null;
};

function display_name_node(obj, key, in_lang) {
  key = key || "name";
  return display_text_node(obj, key, in_lang);
};

function display_text_node(obj, key, in_lang) {
  return mql.result.text(obj[key]);
};


/////////////////
// mql helpers
/////////////////

var mql = {

  /**
   * mql.query.* return mql query clauses
   */
  query: {
    text: function() {
      return mql.text_clause(lang);
    },
    name: function() {
      return mql.query.text();
    }
  },

  /**
   * mql.result.* can parse the mql results from using mq.query.* clauses
   */
  result: {
    text: function(result) {
      return mql.get_text(lang, result);
    },
    name: function(result) {
      return mql.result.text(result);
    }
  },

  /**
   * Get all freebase/mql lang equivalents (/lang/<code>) of the languages in the 40+ language initiative
   * @see https://sites.google.com/a/google.com/40-language-initiative/home/language-details
   */
  langs: function(sorted) {
    if (sorted) {
      if (!mql.langs.sorted) {
        mql.langs.sorted = LANGS.slice().sort(function(a,b) {
          return b.name < a.name;
        });
      }
      return mql.langs.sorted;
    }
    return LANGS;
  },

  text_clause: function(lang) {
    var langs = [];
    if (lang) {
      langs.push(lang);
    }
    if (lang !== "/lang/en") {
      langs.push("/lang/en");
    }
    return [{
      lang: null,
      "lang|=": langs,
      value: null,
      optional: true
    }];
  },

  /**
   * Return a padded array of texts in lang and "/lang/en".
   * If lang != "/lang/en", this will always return length == 2
   * If lang == "/lang/en", this will always return length == 1
   * The padded text will have value = null;
   *
   * So if lang == "/lang/ko" and there is no "/lang/ko" value, the result might look like:
   *
   * [{value:null, lang:"/lang/ko"}, {value:"foo", lang:"/lang/en"}]
   *
   * And similarly, if there is a "/lang/ko" but not a "/lang/en" value, the result would look like:
   *
   * [{value:"bar", lang:"/lang/ko"}, {value:null, lang:"/lang/en"}]
   *
   * And if there are neither values:
   *
   * [{value:null, lang:"/lang/ko"}, {value:null, lang:"/lang/en"}]
   *
   * And if lang == "/lang/en", the result would be length == 1:
   *
   * [{value:"foo", lang:"/lang/en"}]
   */
  get_texts: function(lang, result) {
    var map = h.map_array(result || [], "lang");
    var texts = [];
    if (lang !== "/lang/en") {
      if (lang in map) {
        texts.push(map[lang]);
      }
      else {
        texts.push({value:null, lang:lang});
      }
    }
    if ("/lang/en" in map) {
      texts.push(map["/lang/en"]);
    }
    else {
      texts.push({value:null, lang:"/lang/en"});
    }
    return texts;
  },

  /**
   * Get the first non-null text value
   * @see get_texts
   */
  get_text: function(lang, result, lang_match) {
    var texts = mql.get_texts(lang, result);
    for (var i=0,l=texts.length; i<l; i++) {
      if (texts[i].value !== null) {
        if (lang_match) {
          if (texts[i].lang === lang) {
            return texts[i];
          }
        }
        else {
          return texts[i];
        }
      }
    }
    return null;
  }
};

///////////////////////////////
// determine lang and bundle
///////////////////////////////

/**
 * lang is determined by the "?lang=" parameter,
 * where the value must be a valid mql lang id or a lang id
 * (i.e, /lang/en or en).
 *
 * Also, the language bundles used for UI labels is also determined by
 * the lang parameter.
 */
set_lang(acre.request.params.lang || acre.request.body_params.lang || "/lang/en");

function set_lang(req_lang) {
  var lang_id = h.lang_id(req_lang);
  var l = LANGS_BY_ID[lang_id];
  if (!l) {
    l = LANGS_BY_ID["/lang/en"];
  }

  // canonical lang id from LANG_TIERS
  lang = l.id;
  lang_code = h.lang_code(lang);
  // mql lang id
  mql_lang = l["m:id"];
  mql_lang_code = h.lang_code(mql_lang);

  // add Globalize.cultures and default lang bundle (lib/bundle)
  // using the canonical lang code specified by LANG_TIERS

  // globalize cultures/bundles are their own "app" and not included in lib
  var globalize_cultures = acre.get_metadata("//cultures.globalize." + acre.current_script.app.host);
  var globalize_bundles = acre.get_metadata("//bundles." + acre.current_script.app.host);

  var culture_code = get_globalize_culture_lang_code();
  var culture = "globalize.culture." + culture_code + ".js";
  var bundle = "globalize.bundle." + culture_code + ".js";
  if (globalize_cultures.files[culture]) {
      // Requiring a culture will extend the global "Globalize" variable
      acre.require(globalize_cultures.path + "/" + culture, JS_TO_SJS);
  }
  if (globalize_bundles.files[bundle]) {
      // Requiring a bundle will extend the global "Globalize" variable
      acre.require(globalize_bundles.path + "/" + bundle, JS_TO_SJS);
  }
};


/**
 * Get the corresponding Globalize culture language code
 * given the lang id or code.
 */

function get_globalize_culture_lang_code(for_lang_or_code) {
    var code = get_lang_code(false, for_lang_or_code);
    return CULTURE_MAP[code] || code;
};

/**
 * Globalize.format takes a format 'nX' where X is the
 * number of decimal places you want in the output.
 * So for int, we use 'n0' for floats, 'n' means the default 2
 * decimal precision. For floats, we try to figure out the
 * number of decimals so that we can echo back the number
 * in the current locale. For scientific notations,
 * we want to just echo it back without any locale formatting.
 * @param {number} number The number to format.
 * @param {boolean} is_float Whether or not number is a float.
 * @param {string} opt_format Use this format if specified.
 * @return {string} The formatted number in current locale.
 * @see https://github.com/jquery/globalize#format
 */
function format_number(number, is_float, opt_format) {
  if (typeof number !== 'number') {
    return number;
  }
  if (!opt_format) {
    var str = '' + number;
    if (h.is_scientific_notation(number)) {
      return number;
    }
    else if (is_float) {
      opt_format = 'n';
      var index = str.indexOf('.');
      if (index !== -1) {
        opt_format = 'n' + str.substr(index + 1).length;
      }
    }
    else {
      opt_format = 'n0';
    }
  }
  var culture = get_globalize_culture_lang_code();
  return Globalize.format(number, opt_format, culture);
};

function format_datetime(datetime, format) {
    if (iso8601.is_time(datetime)) {
        return format_time(datetime, format);
    }
    else {
        return format_date(datetime, format);
    }
};

function format_date(date, format) {
    var d = acre.freebase.date_from_iso(date);
    if (!d) {
        return date;
    }
    var culture = get_globalize_culture_lang_code();
    if (format) {
        date = Globalize.format(d, format, culture);
    }
    else {
        var year = parseInt(d.getFullYear(), 10);
        if (year < 1) {
            // All dates with years < 1, will be formatted with the BCE year only
            date = format_bce_year(year);
        }
        else if (iso8601.is_date_yyyy(date)) {
            date = Globalize.format(d, "yyyy", culture);
        }
        else if (iso8601.is_date_yyyymm(date)) {
            date = Globalize.format(d, "Y", culture);
        }
        else if (iso8601.is_date_yyyymmdd(date)) {
            date = Globalize.format(d, "d", culture);
        }
        else {
            date = Globalize.format(d, "f", culture);
        }
    }
    return date;
};

function format_bce_year(year) {
    // This is English centric as Globalize doesn't
    // seem to handle negative years.
    var y = year;
    if (typeof year !== "number") {
        y = parseInt(year, 10);
    }
    if (y < 1) {
        return (-1 * y) + 1 + " BCE";
    }
    return year;
};

/**
 * @param time:String - a valid iso8601 time string that start with 'T'
 * (i.e., T06:30). If it is a full iso8601 string, it will only format the time
 * part.
 */
function format_time(time, format) {
    var index = time.indexOf("T");
    var culture = get_globalize_culture_lang_code();
    if (index !== -1) {
      time = time.substring(index + 1);
    }
    if (iso8601.is_time_hh(time)) {
      var d = Globalize.parseDate(time, "HH");
      time = Globalize.format(d, format || "t", culture);
    }
    else if (iso8601.is_time_hhmm(time)) {
      var d = Globalize.parseDate(time, "HH:mm");
      time = Globalize.format(d, format || "t", culture);
    }
    else if (iso8601.is_time_hhmmss(time)) {
      var d = Globalize.parseDate(time, "HH:mm:ss");
      time = Globalize.format(d, format || "T", culture);
    }
    return time;
};

var iso8601 = {};

(function() {
    var r_time = /^T?([01][0-9]|2[0-3])(:[0-5][0-9]){0,2}$/;
    var r_time_hh = /^T?([01][0-9]|2[0-3])$/;
    var r_time_hhmm = /^T?([01][0-9]|2[0-3]):[0-5][0-9]$/;
    var r_time_hhmmss = /^T?([01][0-9]|2[0-3])(:[0-5][0-9]){2}$/;

    var r_date_yyyy = /^\d{4}$/;
    var r_date_yyyymm = /^\d{4}-\d{2}$/;
    var r_date_yyyymmdd = /^\d{4}(-\d{2}){2}$/;

    iso8601.is_time = function(s) {
        return r_time.test(s);
    };

    iso8601.is_time_hh = function(s) {
        return r_time_hh(s);
    };

    iso8601.is_time_hhmm = function(s) {
        return r_time_hhmm(s);
    };

    iso8601.is_time_hhmmss = function(s) {
        return r_time_hhmmss(s);
    };

    iso8601.is_date_yyyy = function(s) {
        return r_date_yyyy(s);
    };

    iso8601.is_date_yyyymm = function(s) {
        return r_date_yyyymm(s);
    };

    iso8601.is_date_yyyymmdd = function(s) {
        return r_date_yyyymmdd(s);
    };
})();
