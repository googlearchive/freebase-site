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

/**
 * @see https://sites.google.com/a/google.com/40-language-initiative/home/language-details
 *
 * These langs have multiple ids (keys)
 * /lang/pt-br   (/lang/pt)
 * /lang/zh      (/lang/zh-cn, /lang/zh-hans)
 * /lang/iw      (/lang/he)
 * /lang/zh-hant (/lang/zh-tw)
 */
var LANGS = [

  // Tier 0
  {
    "id": "/lang/en",
    "name": "English"
  },

  // Tier 1
  {
    "id": "/lang/en-gb",
    "name": "British English"
  },
  {
    "id": "/lang/fr",
    "name": "French"
  },
  {
    "id": "/lang/it",
    "name": "Italian"
  },
  {
    "id": "/lang/de",
    "name": "German"
  },
  {
    "id": "/lang/es",
    "name": "Spanish"
  },
  {
    "id": "/lang/nl",
    "name": "Dutch"
  },
  {
    "id": "/lang/zh",
    "o:id": ["/lang/zh-cn", "/lang/zh-hans"],
    "name": "Chinese"
  },
  {
    "id": "/lang/zh-hant",
    "o:id": ["/lang/zh-tw"],
    "name": "Chinese (traditional)"
  },
  {
    "id": "/lang/ja",
    "name": "Japanese"
  },
  {
    "id": "/lang/ko",
    "name": "Korean"
  },
  {
    "id": "/lang/pt-br",
    "o:id": ["/lang/pt"],
    "name": "Portuguese"
  },
  {
    "id": "/lang/ru",
    "name": "Russian"
  },
  {
    "id": "/lang/pl",
    "name": "Polish"
  },
  {
    "id": "/lang/tr",
    "name": "Turkish"
  },
  {
    "id": "/lang/th",
    "name": "Thai"
  },
  {
    "id": "/lang/ar",
    "name": "Arabic"
  },

  // Tier 2
  {
    "id": "/lang/sv",
    "name": "Swedish"
  },
  {
    "id": "/lang/fi",
    "name": "Finnish"
  },
  {
    "id": "/lang/da",
    "name": "Danish"
  },
  {
    "id": "/lang/pt-pt",
    "name": "Iberian Portuguese"
  },
  {
    "id": "/lang/ro",
    "name": "Romanian"
  },
  {
    "id": "/lang/hu",
    "name": "Hungarian"
  },
  {
    "id": "/lang/iw",
    "o:id": ["/lang/he"],
    "name": "Hebrew"
  },
  {
    "id": "/lang/id",
    "name": "Indonesian"
  },
  {
    "id": "/lang/cs",
    "name": "Czech"
  },
  {
    "id": "/lang/el",
    "name": "Greek"
  },
  {
    "id": "/lang/no",
    "name": "Norwegian"
  },
  {
    "id": "/lang/vi",
    "name": "Vietnamese"
  },
  {
    "id": "/lang/bg",
    "name": "Bulgarian"
  },
  {
    "id": "/lang/hr",
    "name": "Croatian"
  },
  {
    "id": "/lang/lt",
    "name": "Lithuanian"
  },
  {
    "id": "/lang/sk",
    "name": "Slovak"
  },
  {
    "id": "/lang/fil",
    "name": "Filipino"
  },
  {
    "id": "/lang/sl",
    "name": "Slovenian"
  },
  {
    "id": "/lang/sr",
    "name": "Serbian"
  },
  {
    "id": "/lang/ca",
    "name": "Catalan"
  },
  {
    "id": "/lang/lv",
    "name": "Latvian"
  },
  {
    "id": "/lang/uk",
    "name": "Ukrainian"
  },
  {
    "id": "/lang/hi",
    "name": "Hindi"
  },
  {
    "id": "/lang/fa",
    "name": "Persian"
  },
  {
    "id": "/lang/es-419",
    "name": "Latin American Spanish"
  },
  {
    "id": "/lang/af",
    "name": "Afrikaans"
  },
  {
    "id": "/lang/am",
    "name": "Amharic"
  },
  {
    "id": "/lang/bn",
    "name": "Bengali"
  },
  {
    "id": "/lang/et",
    "name": "Estonian"
  },
  {
    "id": "/lang/is",
    "name": "Icelandic"
  },
  {
    "id": "/lang/ms",
    "name": "Malay"
  },
  {
    "id": "/lang/mr",
    "name": "Marathi"
  },
  {
    "id": "/lang/sw",
    "name": "Swahili"
  },
  {
    "id": "/lang/ta",
    "name": "Tamil"
  },
  {
    "id": "/lang/zu",
    "name": "Zulu"
  },
  {
    "id": "/lang/eu",
    "name": "Basque"
  },
  {
    "id": "/lang/zh-hk",
    "name": "Chinese (Mandarin, Hong Kong)"
  },
  {
    "id": "/lang/fr-ca",
    "name": "French (Canadian)"
  },
  {
    "id": "/lang/gl",
    "name": "Galician"
  },
  {
    "id": "/lang/gu",
    "name": "Gujarati"
  },
  {
    "id": "/lang/kn",
    "name": "Kannada"
  },
  {
    "id": "/lang/ml",
    "name": "Malayalam"
  },
  {
    "id": "/lang/te",
    "name": "Telugu"
  },
  {
    "id": "/lang/ur",
    "name": "Urdu"
  }
];
var LANGS_BY_ID = {};
var LANGS_BY_CODE = {};
LANGS.forEach(function(l) {
  var code = h.lang_code(l.id);
  LANGS_BY_ID[l.id] = LANGS_BY_CODE[code] = l;
  if (l["o:id"]) {
    l["o:id"].forEach(function(id) {
      code = h.lang_code(id);
      LANGS_BY_ID[id] = LANGS_BY_CODE[code] = l;
    });
  }
});

var lang;
var bundle;
var bundle_path;


///////////
// gettext
///////////

/**
 * gettext accepts a msgid (key) in the string bundle.
 * If the string bundle does not exist or the msgid does not exist in the string bundle,
 * just returns msgid.
 */
function gettext(msgid) {
  if (bundle) {
    if (typeof bundle[msgid] === "string") {
      return bundle[msgid];
    }
    // TODO: disable until we're ready to localize
    //console.warn("[i18n]", bundle_path, msgid, undefined);
  }
  return msgid;
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
 * lang is determined by the "?lang=" parameter, where the value must be a valid mql lang id
 *
 * The language bundle used for chrome is determined by the "accept-language' request header..
 */
var accept_langs = get_accept_langs();
set_bundle(accept_langs);
set_lang(acre.request.params.lang || acre.request.body_params.lang || "/lang/en");

function set_lang(lang_id_or_code) {
  /**
   * Allow simple lang code parameters like lang=ko instead of (lang=%2Flang%2Fko).
   */
  var lang_id = h.lang_id(lang_id_or_code);
  var l = LANGS_BY_ID[lang_id];
  if (!l) {
    l = LANGS[0]; // lang/en
  }
  // mql lang id
  lang = l.id;
};

function set_bundle(lang_codes) {
  if (!h.isArray(lang_codes)) {
    lang_codes = [lang_codes];
  }
  var lib = acre.get_metadata();
  var app = acre.get_metadata(acre.request.script.app.path);
  var lib_bundle;
  var app_bundle;
  lang_codes.every(function(lang_code) {
    var lang_by_code = LANGS_BY_CODE[lang_code];
    if (lang_by_code) {
      var filename = lang_code + ".properties";
      if (!lib_bundle && filename in lib.files) {
        lib_bundle = lib.path + "/" + filename;
      }
      if (!app_bundle && filename in app.files) {
        app_bundle = app.path + "/" + filename;
      }
      if (lib_bundle && app_bundle) {
        return false;
      }
    }
    return true;
  });
  if (lib_bundle) {
    lib_bundle = acre.require(lib_bundle).bundle;
  }
  if (app_bundle) {
    app_bundle = acre.require(app_bundle).bundle;
  }
  bundle = h.extend(true, lib_bundle || {}, app_bundle);
};

function get_accept_langs() {
  var accept_langs = acre.request.headers['accept-language'];
  if (accept_langs) {
    accept_langs = accept_langs.split(",");
  }
  else {
    return ["en-US"];
  }
  var qvalues = {};
  var lang_codes = [];
  var i,l;
  accept_langs.forEach(function(accept_lang) {
    var lang_parts = h.trim(accept_lang).split(";");
    var lang_code = h.trim(lang_parts[0]);
    /**
     * qvalue is a value from 0 to 1. 1 being the most preferred. qvalue defaults to 1 if not present.
     * so if you have the following:
     *
     * accept-language: ko-KR,ko;q=0.8,en-us;q=0.5,en;q=0.3
     *
     * ko-KR is the preferred, then ko if ko-KR is not available, then en-us, then en.
     *
     * @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
     */
    var qvalue = 1;
    if (lang_parts.length > 1) {
      var qvalue_parts = lang_parts[1].split("=");
      if (qvalue_parts.length > 1) {
        qvalue = parseFloat(h.trim(qvalue_parts[1]));
      }
    }
    if (lang_code in qvalues) {
      // take the larger qvalue
      if (qvalues[lang_code] < qvalue) {
        qvalues[lang_code] = qvalue;
      }
    }
    else {
      qvalues[lang_code] = qvalue;
    }
    lang_codes.push(lang_code);
  });
  // /lang/en must be present
  if (!("en-US" in qvalues)) {
    qvalues["en-US"] = 0;
    lang_codes.push("en-US");
  }
  lang_codes.sort(function(a,b) {
    return qvalues[b] - qvalues[a];
  });
  return lang_codes;
};






var dojo = {
  locale: function() {
    var locale = h.lang_code(lang);
    if (locale === "iw") {
      locale = "he";
    }
    return locale;
  }
};


function normalize_lang(lang_id) {
  var l = LANGS_BY_ID[lang_id];
  if (l) {
    return l.id;
  }
  else {
    return lang_id;
  }
};
