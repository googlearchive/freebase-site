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
var apis = acre.require("promise/apis.sjs");
var deferred = apis.deferred;
var freebase = apis.freebase;
var i18n = acre.require("i18n/i18n.sjs");

/**
 * Use Topic API to get an article (/common/topic/article) of a topic.
 * 
 * @param topic_id:String or Array(required) - The subject or entity id(s)
 *   having the article(s).
 * @param prop_id:String (optional) - The property id linking 
 *   the topic_id to the article(s). Defaults to "/common/topic/article".
 * @param article_id:String (optional) - The id of the article (/common/document)
 *   node if you want to get a specific article.
 * @param lang:String (optional) - The language id of the article(s).
 *   Defaults to "/lang/en".
 * @return an map of article objects keyed by the topic_id where each object has
 * {
 *     id:String (required) - The id of the article node
 *     text:String (required) - The article content
 *     lang:String (required) - The language id of the article
 *     "/common/document/content":String (optional) - The id of the content node.
 *                                         Immutable articles (i.e., wikipedia)
 *                                         do not have a content id.
 *     "/common/document/updated":String (optional) - The datetime when this article
 *                                         content was updated.
 * }
 */
function get_article(topic_id, prop_id, article_id, lang) {
    if (h.type(topic_id) !== "array") {
        topic_id = [topic_id];
    }
    if (!prop_id) {
        prop_id = "/common/topic/article";
    }
    if (!lang) {
        lang = "/lang/en";
    }
    var options = {
        filter: prop_id,
        lang: h.lang_code(i18n.get_lang(true, lang))
    };


    /**
     * Doing get_topic_multi for articles is SLOW especially for schemas.
     * For now, use Topic API (get_topic) for a single topic and 
     * use Text API (get_blob) for multiple topics.
     * However, the Text API assumes "/common/topic/article" when retrieving
     * the article(s) for a topic.
     */

    var articles = {};
    if (topic_id.length === 1) {
        return freebase.get_topic(topic_id[0], options)
            .then(function(topic) {
                var values = [];
                if (topic && topic.property && topic.property[prop_id]) {
                    topic.property[prop_id].values.forEach(function(v) {
                        if (!article_id || v.id === article_id) {
                            values.push(article_value(v));
                        }
                    });
                }
                articles[topic_id[0]] = values;
                return articles;
            });
    }
    else if (topic_id.length > 1) {
        if (prop_id !== "/common/topic/article") {
            return deferred.rejected("Only '/common/topic/article' is supported when using the Text API (freebase.get_blob)");
        }
        if (article_id) {
            return deferred.rejected("You cannot specify a specfic article_id when using the Text API");
        }
        topic_id.forEach(function(id) {
            articles[id] = freebase.get_blob(id, "plain", {lang:h.lang_code(lang)})
                .then(function(r) {
                    return [{
                        /**
                         * This is the deficiency of using the Text API.
                         * You do not get the article id nor the lang.
                         */
                        text: r.body,
                        lang: lang  // for now just echo back the lang
                    }];
                }, function(e) {
                    if (e.response.body.code === 404) {
                        return [];
                    }
                    return deferred.rejected(e);
                });
        });
        return deferred.all(articles)
            .then(function(articles) {
                return articles;
            });
    }
    else {
        return deferred.resolved(articles);
    }

/**
    // uncomment once get_topic_multi performance is better for multiple topics,
    // especially schema articles.

    return freebase.get_topic_multi(topic_id, options)
        .then(function(r) {
            var articles = {};
            if (r) {
                r.forEach(function(env) {
                    var topic_id = env.id; // requested topic id
                    var topic = env.result;
                    var values = [];
                    if (topic && topic.property && topic.property[prop_id]) {
                        topic.property[prop_id].values.forEach(function(v) {
                            if (!article_id || v.id === article_id) {
                                values.push(article_value(v));
                            }
                        });
                    }
                    articles[topic_id] = values;                    
                });
            }
            return articles;
        });
**/
};


/**
 * Transform an article value returned by the Topic API
 * to a usable format for the client
 * 
 * For example, this is an article value from the Topic API:
 * {
 *   "text": "Bob Dylan, ( /ˈdɪlən/) born Robert Allen Zimmerman on May 24, 1941...",
 *   "lang": "en",
 *   "id": "/m/0155b",
 *   "uri": "http://dev.freebase.com/m/0155b",
 *   "property": {
 *     "/common/document/text": {
 *       "id": "/common/document/text",
 *       "type": "string",
 *       "values": [{
 *         "text": "Bob Dylan, ( /ˈdɪlən/) born Robert Allen Zimmerman on May 24, 1941...",
 *         "lang": "en"
 *       }]
 *     }
 *   }
 * }
 **/ 
function article_value(value) {
    var a = {
        text: value.text,
        lang: value.lang,
        id: value.id
    };
    if (value.property) {
        if (value.property["/common/document/content"]) {
            a["/common/document/content"] = value.property["/common/document/content"].id;
            // lang is not being propagated to the value.
            // get it from /common/document/content.values[0].lang
            if (!a.lang) {
                a.lang = value.property["/common/document/content"].values[0].lang;
            }
        }
        if (value.property["/common/document/updated"]) {
            a["/common/document/updated"] = value.property["/common/document/updated"].value;
        }
    }
    return a;
};

/**
 * Get the article text from the given topic object.
 * The article attached to the topic is assumed to be the result
 * of using get_article().
 * 
 * @param topic - The topic object.
 * @param pid - The property id or key of the topic object 
 *              containing the article (i.e., topic[pid]). 
 * @param in_lang - If a lang is specified, this will try to get the 
 *                  text of the first article node matching the lang otherwise
 *                  returns the default_value or "".
 * @param max_length - If specified, return the substring of the full article
 *                     from the beginning to the last index of a 
 *                     whitespace character before the max_length.
 * @param default_value - If an article is not found or is empty ("", null),
 *                        return the default_value if specified otherwise an
 *                        empty string ("").
 */
function get_text(topic, pid, in_lang, max_length, default_value) {
    var a = get_document_node(topic, pid, in_lang);
    if (a) {
        a = a.text || "";
        if (max_length) {
            a = a.substring(0, max_length);
            var i = a.lastIndexOf(" ");
            if (i > 0) {
                a = a.substring(0, i);
            }
            a += "...";            
        }
    }
    else {
       a = default_value || ""; 
    }
    return a;
};

/**
 * Get the article document node from the give topic object.
 * The article attached to the topic is assumed to be the result
 * of using get_article().
 * 
 * @param topic - The topic object.
 * @param pid - The property id or key of the topic object 
 *              containing the article (i.e., topic[pid]). 
 * @param in_lang - If a lang is specified, this will try to get the 
 *                  text of the first article node matching the lang otherwise
 *                  returns the default_value or "".
 */
function get_document_node(topic, pid, in_lang) {
    pid = pid || "/common/topic/article";
    var a = null;
    if (topic[pid] && topic[pid].length) {
        if (in_lang) {
            in_lang = h.lang_code(in_lang);
            topic[pid].every(function(n) {
                if (n.lang === in_lang) {
                    a = n;
                    return false;
                }
                return true;
            });
        }
        else {
            a = topic[pid][0];
        }
    }
    return a;
};
