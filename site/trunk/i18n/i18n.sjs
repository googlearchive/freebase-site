var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");

var lang;
var bundle;
var bundle_path;
var undefined;

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
    console.warn("[i18n]", bundle_path, msgid, undefined);
  }
  return msgid;
};


/////////////////
// view helpers
/////////////////

/**
 * Get the display of a topic specified by obj.
 *
 * Return the name in the following order
 * 1. obj[key]  - key defaults to "name"
 * 2. default_value
 * 3. obj.id
 * 4. null
 */
function display_name(obj, default_value, key) {
  if (!key) {
    key = "name";
  }
  var name = mql.result.name(obj[key]);
  if (name) {
    return name.value;
  }
  if (default_value != null) {
    return default_value;
  }
  return obj.id || null;
};

/**
 * Usage:
 * var blob = display_article(obj, "blob");
 * var [blob] = display_article(obj, ["blob"]);
 * var [blob, blurb] = display_article(obj, ["blob", "blurb"]);
 *
 * @param keys:String or Array
 */
function display_article(obj, keys, article_key) {
  if (!article_key) {
    article_key = "/common/topic/article";
  }
  var is_string = false;
  var mykeys = keys;
  if (typeof mykeys === "string") {
    mykeys = [mykeys];
    is_string = true;
  }
  else if (!is_array(mykeys) || mykeys.length === 0) {
    return null;
  }
  var result = [];
  var article = mql.result.article(obj[article_key]);
  for (var i=0,l=mykeys.length; i<l; i++) {
    result.push(article && article[mykeys[i]] || null);
  }
  if (is_string) {
    return result[0];
  }
  return result;
};


/**
 * TODO: convert all format methods to use locale specific formats
 */

function format_number(val) {
  return h.commafy(val);
};

function format_timestamp(timestamp) {
  return format_date(acre.freebase.date_from_iso(timestamp));
};

function format_date(date) {
  return h.format_date(date, "MMMM dd, yyyy");
};


/////////////////
// edit helpers
/////////////////

function get_edit_names(obj) {
  return get_edit_texts(obj, "name");
};

function get_edit_texts(obj, key) {
  var texts = obj[key] || [];
  return mql.get_texts(lang, texts);
};

function get_edit_articles(obj, key) {
  if (!key) {
    key = "/common/topic/article";
  }
  var articles = obj[key] || [];
  return mql.get_articles(lang, articles);
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
    },
    article: function() {
      return mql.article_clause(lang);
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
    },
    article: function(result) {
      return mql.get_article(lang, result);
    },
    articles: function(result) {
      return mql.get_articles(lang, result);
    }
  },

  /**
   * cached result of mql.langs()
   */
  _langs:null,

  /**
   * Get all freebase/mql lang equivalents (/lang/<code>) of the languages in the 40+ language initiative
   * @see https://sites.google.com/a/google.com/40-language-initiative/home/language-details
   */
  langs: function() {
    if (!mql._langs) {
      var tier = [
        ["en"], // Tier 0
        ["en-GB", "fr", "it", "de", "es", "nl", "zh-CN", "zh-TW", "ja", "ko", "pt-BR", "ru", "pl", "tr", "th", "ar"], // Tier 1
        ["sv", "fi", "da", "pt-PT", "ro", "hu", "iw", "id", "cs", "el", "no", "vi", "bg", "hr", "lt", "sk", "fil", "sl", "sr", "ca", "lv", "uk", "hi", "fa", "es-419"] // Tier 2
      ];
      // freebase equivalent
      var equiv = {
        "en-GB" : "en",
        "zh-CN" : "zh",
        "zh-TW" : "zh",
        "pt-BR" : "pt",
        "pt-PT" : "pt",
        "iw"    : "he",
        "es-419": "es"
      };
      var tiers = tier[0].concat(tier[1]).concat(tier[2]);
      var ids = [];
      var seen = {};
      for (var i=0,l=tiers.length; i<l; i++) {
        var id = tiers[i];
        if (id in equiv) {
          id = equiv[id];
        }
        if (! (id in seen)) {
          ids.push("/lang/" + id);
          seen[id] = 1;
        }
      }
      var q = [{
        id: null,
        "id|=": ids,
        name: null
      }];
      // langs don't change, so use as_of_time
      var langs = acre.freebase.mqlread(q, {as_of_time: ""+(new Date()).getFullYear()}).result;
      langs.sort(function(a,b) {
        return (a.name || "").toLowerCase() > (b.name || "").toLowerCase();
      });
      mql._langs = langs;
    }
    return mql._langs;
  },

  text_clause: function(lang) {
    var langs = ["/lang/en"];
    if (lang !== "/lang/en") {
      langs.push(lang);
    }
    return [{
      lang: null,
      "lang|=": langs,
      value: null,
      optional: true
    }];
  },

  article_clause: function(lang) {
    var langs = ["/lang/en"];
    if (lang !== "/lang/en") {
      langs.push(lang);
    }
    return [{
      optional:   true,
      id:         null,
      timestamp:  null,
      type:       "/common/document",
      source_uri: null,   // wikipedia articles
      "nolang:content": { // old (pre-i18n) articles do not have language set
        optional: true,
        id:       null,
        type:     "/type/content",
        language: {
          id: null,
          optional: "forbidden"
        }
      },
      "lang:content": {   // new (post-i18n) articles have language set
        optional: true,
        id:       null,
        type:     "/type/content",
        language: {
          id: null,
          "id|=": langs
        }
      }
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
    var map = map_array(result || [], "lang");
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
  },

  /**
   * Similar to get_texts, but padded array of articles where the padded article will have id = null.
   *
   * So if lang == "/lang/ko" and there is no "/lang/ko" article, the result might look like:
   *
   * [{id:null, lang:"/lang/ko"}, {id:"foo", lang:"/lang/en"}]
   *
   * And similarly, if there is a "/lang/ko" but not a "/lang/en" article, the result would look like:
   *
   * [{id:"bar", lang:"/lang/ko"}, {id:null, lang:"/lang/en"}]
   *
   * And if there are neither values:
   *
   * [{id:null, lang:"/lang/ko"}, {id:null, lang:"/lang/en"}]
   *
   * And if lang == "/lang/en", the result would be length == 1:
   *
   * [{id:"foo", lang:"/lang/en"}]
   */
  get_articles: function(lang, result) {
    var wp_lang_article;
    var wp_en_article;
    var nolang_article;
    var lang_article;
    var en_article;
    var lang_code = lang.split("/").pop();
    var wp_lang_uri = h.sprintf("http://wp/%s/", lang_code);
    result.forEach(function(article) {
      if (article.source_uri) {
        if (lang !== "/lang/en" && article.source_uri.indexOf(wp_lang_uri) === 0) {
          if (wp_lang_article) {
            if (article.timestamp > wp_lang_article.timestamp) {
              wp_lang_article = article;
            }
          }
          else {
            wp_lang_article = article;
          }
          wp_lang_article.lang = lang;
        }
        else if (article.source_uri.indexOf("http://wp/en/") === 0) {
          if (wp_en_article) {
            if (article.timestamp > wp_en_article.timestamp) {
              wp_en_article = article;
            }
          }
          else {
            wp_en_article = article;
          }
          wp_en_article.lang = "/lang/en";
        }
      }
      else if (article["nolang:content"]) {
        if (nolang_article) {
            if (article.timestamp > nolang_article.timestamp) {
              nolang_article = article;
            }
        }
        else {
          nolang_article = article;
        }
        nolang_article.lang = "/lang/en";
      }
      else if (article["lang:content"]) {
        var language = article["lang:content"].language.id;
        if (lang !== "/lang/en" && lang === language) {
          if (lang_article) {
            if (article.timestamp > lang_article.timestamp) {
              lang_article = article;
            }
          }
          else {
            lang_article = article;
          }
          lang_article.lang = lang;
        }
        else if (language === "/lang/en") {
          if (en_article) {
            if (article.timestamp > en_article.timestamp) {
              en_article = article;
            }
          }
          else {
            en_article = article;
          }
          en_article.lang = "/lang/en";
        }
      }
    });

    var articles = [];
    var article;
    if (lang !== "/lang/en") {
      article = lang_article || wp_lang_article;
      if (article) {
        article.lang = lang;
        articles.push(article);
      }
      else {
        articles.push({id:null, lang:lang});
      }
    }
    article = en_article || nolang_article || wp_en_article;
    if (article) {
      articles.push(article);
    }
    else {
      articles.push({id:null, lang:"/lang/en"});
    }
    return articles;
    //return lang_article || en_article || nolang_article || wp_lang_article || wp_en_article || null;
  },

  /**
   * Get the first non-null article id
   * @see get_articles
   */
  get_article: function(lang, result, lang_match) {
    var articles = mql.get_articles(lang, result);
    for (var i=0,l=articles.length; i<l; i++) {
      if (articles[i].id !== null) {
        if (lang_match) {
          if (articles[i].lang === lang) {
            return articles[i];
          }
        }
        else {
          return articles[i];
        }
      }
    }
    return null;
  }
};


///////////////////////////////
// deterimine lang and bundle
///////////////////////////////

try {
  /**
   * Preferred langauge is determined in the following order
   * 1. lang cookie
   * 2. accept-language request header
   * 3. default to "en"
   */
  var i,l;
  var supported_langs = map_array(mql.langs(), "id");
  var accept_langs;
  if (acre.request.cookies.lang) {
    accept_langs = [trim(acre.request.cookies.lang).split("/").pop()];
  }
  else {
    accept_langs = acre.request.headers['accept-language'].split(",");
  }
  var langs = [];
  var map = {};
  for (i=0,l=accept_langs.length; i<l; i++) {
    var lang_parts = trim(accept_langs[i]).split(";");
    var lang_code = trim(lang_parts[0].toLowerCase());
    var lang_id = "/lang/" + lang_code;
    if (! (lang_id in supported_langs)) {
      continue;
    }
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
        qvalue = parseFloat(trim(qvalue_parts[1]));
      }
    }
    if (lang_id in map) {
      // if same langs
      // take the larger qvalue
      if (map[lang_id][1] < qvalue) {
        map[lang_id][1] = qvalue;
      }
    }
    else {
      var tuple = [lang_code, qvalue];
      langs.push(tuple);
      map[lang_id] = tuple;
    }
  };
  // default en ==> /lang/en must be present
  if (!("/lang/en" in map)) {
    var en = ["en", 0];
    map["/lang/en"] = en;
    langs.push(en);
  }
  // sort langs by qvalue
  langs.sort(function(a,b) {
               return b[1] - a[1];
             });


  // Find the first lang bundle "[lang_code].properties"
  var app = acre.get_metadata(acre.request.script.path);
  for (i=0,l=langs.length; i<l; i++) {
    var filename = langs[i][0] + ".properties";
    if (filename in app.files) {
      if (bundle === undefined) {
        bundle_path = acre.request.script.app.path + "/" + filename;
        bundle = acre.require(bundle_path).bundle;
      }
    }
    else {
      console.warn("[i18n]", acre.request.script.app.path + "/" + filename, undefined);
    }
  }
  // Note that /lang/en is in langs so result will always be >= 1
  // This will be the language to query for all /type/text and /type/content
  lang = "/lang/" + langs[0][0];
}
catch (e) {
  // trap all exceptions
  console.error("[i18n]", e);
  bundle = null;
};



/////////
// utils
/////////

function map_array(a, key) {
  var map = {};
  for (var i=0,l=a.length; i<l; i++) {
    map[a[i][key]] = a[i];
  };
  return map;
};

function trim(str) {
  return str.replace(/^\s+|\s+$/g, "");
};

function is_array(obj) {
  return toString.call(obj) === "[object Array]";
};
