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
        alldata: true,
        filter: prop_id,
        lang: h.lang_code(lang)
    };
    var promises = {};
    topic_id.forEach(function(id) {
        promises[id] = freebase.get_topic(id, options);
    });
    return deferred.all(promises)
        .then(function(result) {
            var articles = {};
            topic_id.forEach(function(id) {
                var topic = result[id];
                var values = [];
                if (topic && topic.property && topic.property[prop_id]) {
                    topic.property[prop_id].values.forEach(function(v) {
                        if (!article_id || v.id === article_id) {
                            values.push(article_value(v));
                        }
                    });
                }
                articles[id] = values;
            });
            return articles;
        });
};


/**
 * A convenient method for doing a mqlread and article query(ies) in parallel.
 * If an id or mid is specified in the query, 
 * this will do a parallel article query for that id or mid.
 * Also, if an "id|=" or "mid|=" is specified in the query,
 * this will also attempt to do multiple queries for each id or mid.
 * Otherwise, it will wait for the query result(s) and
 * invoke an article query(ies) for each result that contains an id or mid.
 * 
 * @param query:Object - A mqlread query. If an id is specified in the query, 
 * we can invoke an article query in parallel, otherwise we would have to wait
 * for the query result (for the id), then get the article(s) for each of the id(s)
 * returned in the query result.
 * @param prop_id:String (optional) - The property id linking 
 *   the topic_id to the article(s). Defaults to "/common/topic/article".
 * @param article_id:String (optional) - The id of the article (/common/document)
 *   node if you want to get a specific article.
 * @param lang:String (optional) - The language id of the article(s).
 *   Defaults to "/lang/en".
 * @param set_key:String (optional) - By default, the article will be set
 *   to each query result with prop_id key. If set_key is specified, then the article
 *   will use this instead.
 * @return the freebase.mqlread result of the query with each result item containing
 *   the article.
 */
function get_article_for(query, prop_id, article_id, lang, set_key) {
    // The query can be an array,
    // in which case we only want to see the first element (clause)
    var q = query;
    if (h.type(q) === "array") {
        q = q[0];
    }
    // default to "/common/topic/article"
    prop_id = prop_id || "/common/topic/article";
    set_key = set_key || prop_id;

    // Are there any ids or mids specified as the constraint?
    // If so, ask for their articles in parallel.
    // Otherwise, we need to wait for the query result to know which
    // ids or mids we want the article(s) of.
    var ids = q.id || q.mid || null;
    if (ids) {
        ids = [ids];
    }
    else {
        ids = q["id|="] || q["mid|="] || [];
    }
    var promises = {};
    if (ids.length) {
        promises.get_article = get_article(ids, prop_id, article_id, lang);
    }
    promises.mqlread = freebase.mqlread(query)
        .then(function(env) {
            return env.result;
        });
    return deferred.all(promises)
        .then(function(result) {
            var mqlread_result = result.mqlread;
            if (!mqlread_result) {
                return mqlread_result;
            }            
            if (h.type(mqlread_result) !== "array") {
                mqlread_result = [mqlread_result];
            }
            var promise;
            if (!result.get_article) {
                var ids = [];
                mqlread_result.forEach(function(r) {
                    var id = r.id || r.mid;
                    if (id) {
                        ids.push(id);
                    }
                });
                if (ids.length) {
                    return get_article(ids, prop_id, article_id, lang)
                        .then(function(r) {
                            result.get_article = r;
                            return result;
                        });
                }
            }
            return result;
        })
        .then(function(result) {
            if (result.get_article) {
                var mqlread_result = result.mqlread;
                if (h.type(mqlread_result) !== "array") {
                    mqlread_result = [mqlread_result];
                }
                mqlread_result.forEach(function(r) {
                    var id = r.id || r.mid;
                    if (result.get_article[id]) {
                        r[set_key] = result.get_article[id];
                    }
                });
            }
            return result.mqlread;
        });
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
        }
        if (value.property["/common/document/updated"]) {
            a["/common/document/updated"] = value.property["/common/document/updated"].value;
        }
    }
    return a;
};

